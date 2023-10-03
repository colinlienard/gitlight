import { fetchGitlab } from './fetchGitlab';
import { getGitlabIcon } from '../helpers';
import type {
	GitlabEvent,
	GitlabIssue,
	GitlabMergeRequest,
	NotificationData,
	SavedNotifications
} from '../types';

type GroupedEvent = {
	target_id?: number;
	ref?: string;
	events: GitlabEvent[];
	data?: GitlabMergeRequest | GitlabIssue;
};

/*
- group events by target_id, or ref
  - if not first fetch, search in savedNotifications and take same id
- for each group
  - if target_id, get the issue/mr
  - if ref, do nothing (unless there is only one, if so get the mr with ?source_branch=)
- merge ref group with target_id group
- order by date inside groups
- create notification data with previous for each group (one group = one notification)
*/
export async function prepareGitlabNotificationData(events: GitlabEvent[]) {
	const grouped = events.reduce<GroupedEvent[]>((previous, current) => {
		const target_id =
			(current.target_type === 'Note' ? current.note.noteable_id : current.target_id) || undefined;
		const ref =
			current.action_name === 'pushed to' || current.action_name === 'pushed new'
				? current.push_data.ref
				: undefined;
		const group = previous.find((item) =>
			target_id ? item.target_id === target_id : ref ? item.ref === ref : false
		);
		if (group) {
			group.events.push(current);
		} else {
			previous.push({ target_id, ref, events: [current] });
		}
		return previous;
	}, []);

	const groupedWithData = await Promise.all(
		grouped.map<Promise<GroupedEvent>>(async (item) => {
			if (item.target_id) {
				const firstEvent = item.events[0];
				let type: 'Issue' | 'MergeRequest' = 'MergeRequest';
				if (
					(firstEvent.target_type === 'Note' && firstEvent.note.noteable_type === 'Issue') ||
					('target_type' in firstEvent && firstEvent.target_type === 'Issue')
				) {
					type = 'Issue';
				}
				const data = await fetchGitlab<GitlabMergeRequest | GitlabIssue>(
					`projects/colinlienard1%2Fgitlab-test/${type === 'Issue' ? 'issues' : 'merge_requests'}/${
						firstEvent.target_type === 'Note' ? firstEvent.note.noteable_iid : firstEvent.target_iid
					}`
				);
				return {
					target_id: item.target_id,
					ref: item.ref,
					events: item.events,
					data
				};
			} else {
				return item;
			}
		})
	);

	if (events.length === 1) return groupedWithData;

	const mergedGroups = groupedWithData
		.reduce<GroupedEvent[]>((previous, current) => {
			if (current.target_id && !current.ref) {
				previous.push(current);
			} else {
				const group = previous.find((item) =>
					item.data && 'source_branch' in item.data
						? item.data.source_branch === current.ref
						: false
				);
				if (group) {
					group.events.push(...current.events);
				} else {
					previous.push(...current.events.map((event) => ({ events: [event], ref: current.ref })));
				}
			}
			return previous;
		}, [])
		.map((item) => {
			if (item.events.length > 1) {
				item.events.sort(
					(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
				);
			}
			return item;
		});

	return mergedGroups;
}

function getTextData(
	gitlabEvent: GitlabEvent,
	hasData = true
): {
	author: NotificationData['author'];
	description: NotificationData['description'];
} {
	return {
		author: {
			login: gitlabEvent.author.username,
			avatar: gitlabEvent.author.avatar_url,
			name: gitlabEvent.author.name
		},
		description: (() => {
			switch (gitlabEvent.action_name) {
				case 'pushed new':
				case 'pushed to':
					if (hasData) return '*made a commit*';
					return `*committed*: _${gitlabEvent.push_data.commit_title}_`;

				case 'opened':
					return `*opened* this ${gitlabEvent.target_type === 'Issue' ? 'issue' : 'merge request'}`;

				case 'commented on':
					return `*commented*: _${gitlabEvent.note.body}_`;

				case 'closed':
					return `*closed* this ${gitlabEvent.target_type === 'Issue' ? 'issue' : 'merge request'}`;

				case 'accepted':
					return `*merged* this merge request`;

				default:
					return '';
			}
		})()
	};
}

export function createGitlabNotificationData(
	event: GroupedEvent,
	savedNotifications: SavedNotifications
): NotificationData | null {
	const firstEvent = event.events[0];
	const id = event.target_id ? event.target_id.toString() : firstEvent.id.toString();
	if (!id) return null;

	const previous = savedNotifications.find((n) => n.id === id);
	const pinned = previous?.pinned || false;
	const muted = previous?.muted || false;
	const unread = previous ? previous.unread : true;
	const done = previous?.done || false;

	const common = {
		id,
		from: 'gitlab',
		pinned,
		unread,
		done,
		muted,
		time: firstEvent.created_at,
		owner: 'owner',
		repo: 'repo',
		// repoId: `${repository.id}`,
		repoId: '1234',
		// ownerAvatar: repository.owner.avatar_url
		ownerAvatar: 'https://placehold.co/400'
	} as const;

	const textData = getTextData(firstEvent, !event.data);
	const secondEvent =
		event.events[1] ||
		(previous && previous?.description !== textData.description ? previous : undefined);
	const previously = secondEvent ? getTextData(secondEvent) : undefined;

	switch (firstEvent.action_name) {
		case 'pushed new':
		case 'pushed to':
			if (!event.data) {
				return {
					...common,
					...textData,
					type: 'commit',
					icon: 'commit',
					title: firstEvent.push_data.commit_title
				};
			}
			return {
				...common,
				...textData,
				type: 'pr',
				icon: getGitlabIcon(event.data),
				title: event.data.title,
				labels: event.data.labels.map((label) => ({ name: label, color: '#000000' })),
				url: event.data.web_url,
				ref: event.ref,
				creator: {
					login: event.data.author.username,
					name: event.data.author.name,
					avatar: event.data.author.avatar_url
				},
				previously
			};

		case 'opened':
		case 'closed':
		case 'accepted':
		case 'commented on':
			if (!event.data) return null;
			return {
				...common,
				...textData,
				type: 'source_branch' in event.data ? 'pr' : 'issue',
				icon: getGitlabIcon(event.data),
				title: event.data.title,
				labels: event.data.labels.map((label) => ({ name: label, color: '#000000' })),
				url: event.data.web_url,
				ref: event.ref,
				creator: {
					login: event.data.author.username,
					name: event.data.author.name,
					avatar: event.data.author.avatar_url
				},
				previously
			};

		case 'created':
		case 'deleted':
			return null;

		default:
			// Log for debug purposes
			// eslint-disable-next-line no-console
			console.log(`Unknown event type: ${(firstEvent as GitlabEvent).action_name}`);
			return null;
	}
}
