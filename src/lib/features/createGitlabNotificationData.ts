import { page } from '$app/stores';
import { fetchGitlab } from './fetchGitlab';
import { storage } from './storage';
import { cleanSpecifier, getGitlabIcon, prioritiesLabel } from '../helpers';
import type {
	GitlabEventWithRepoData,
	GitlabIssue,
	GitlabLabel,
	GitlabMergeRequest,
	NotificationData,
	Priority,
	SavedNotifications,
	User
} from '../types';

type GroupedEvent = {
	target_id?: number;
	ref?: string;
	events: GitlabEventWithRepoData[];
	data?: GitlabMergeRequest | GitlabIssue;
};

let GITLAB_LABELS: Map<string, GitlabLabel[]> | undefined;

/*
- Group events by target_id, or ref
  - if not first fetch, search in savedNotifications and take same id
- For each group
  - if target_id, get the issue/mr
  - if ref, do nothing
- Merge ref group with target_id group
- Order by date inside groups
- Create notification data with previous for each group (one group = one notification)
*/
export async function prepareGitlabNotificationData(events: GitlabEventWithRepoData[]) {
	const grouped = events.reduce<GroupedEvent[]>((previous, current) => {
		const { target_type } = current;
		const target_id =
			(target_type === 'Note' || target_type === 'DiffNote' || target_type === 'DiscussionNote'
				? current.note.noteable_id
				: current.target_id) || undefined;
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
				const { target_type } = firstEvent;
				const isNote =
					target_type === 'Note' || target_type === 'DiffNote' || target_type === 'DiscussionNote';
				let type: 'Issue' | 'MergeRequest' = 'MergeRequest';
				if (
					(isNote && firstEvent.note.noteable_type === 'Issue') ||
					('target_type' in firstEvent && firstEvent.target_type === 'Issue')
				) {
					type = 'Issue';
				}
				const data = await fetchGitlab<GitlabMergeRequest | GitlabIssue>(
					`projects/${firstEvent.repository.encoded}/${
						type === 'Issue' ? 'issues' : 'merge_requests'
					}/${isNote ? firstEvent.note.noteable_iid : firstEvent.target_iid}`
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
	gitlabEvent: GitlabEventWithRepoData,
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
					if (
						gitlabEvent.target_type === 'DiffNote' &&
						gitlabEvent.author.username !== getLoggedUser()?.login
					) {
						return `*requested changes*${
							gitlabEvent.note.body ? `: _${gitlabEvent.note.body}_` : ' on this pull request'
						}`;
					}
					return `*commented*: _${gitlabEvent.note.body}_`;

				case 'approved':
					return `*approved* this merge request`;

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

export async function createGitlabNotificationData(
	event: GroupedEvent,
	savedNotifications: SavedNotifications
): Promise<NotificationData | null> {
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
		repository: firstEvent.repository
	} as const;
	let value: NotificationData;

	const textData = getTextData(firstEvent, !event.data);
	const secondEvent =
		event.events[1] ||
		(previous && previous?.description !== textData.description ? previous : undefined);
	const previously = secondEvent ? getTextData(secondEvent) : undefined;

	switch (firstEvent.action_name) {
		case 'pushed new':
		case 'pushed to':
			if (!event.data) {
				value = {
					...common,
					...textData,
					type: 'commit',
					icon: 'commit',
					title: firstEvent.push_data.commit_title
				};
			} else {
				value = {
					...common,
					...textData,
					type: 'pr',
					icon: getGitlabIcon(event.data),
					title: event.data.title,
					number: event.data.iid,
					labels: getColoredLabels(firstEvent.repository.encoded, event.data.labels),
					url: event.data.web_url,
					ref: event.ref,
					creator: {
						login: event.data.author.username,
						name: event.data.author.name,
						avatar: event.data.author.avatar_url
					},
					previously
				};
			}
			break;

		case 'opened':
		case 'closed':
		case 'accepted':
		case 'approved':
		case 'commented on':
			if (!event.data) return null;
			value = {
				...common,
				...textData,
				type: 'source_branch' in event.data ? 'pr' : 'issue',
				icon: getGitlabIcon(event.data),
				title: event.data.title,
				number: event.data.iid,
				labels: getColoredLabels(firstEvent.repository.encoded, event.data.labels),
				url: event.data.web_url,
				ref: event.ref,
				creator: {
					login: event.data.author.username,
					name: event.data.author.name,
					avatar: event.data.author.avatar_url
				},
				previously
			};
			break;

		case 'created':
		case 'deleted':
		case 'joined':
			return null;

		default:
			// Log for debug purposes
			// eslint-disable-next-line no-console
			console.log(`Unknown event type: ${(firstEvent as GitlabEventWithRepoData).action_name}`);
			return null;
	}

	const priorities = storage.get('priorities');
	if (!priorities || priorities.length === 0) return value;

	// Get all comments
	const { target_type } = firstEvent;
	const isNote =
		target_type === 'Note' || target_type === 'DiffNote' || target_type === 'DiscussionNote';
	const iid = isNote ? firstEvent.note.noteable_iid : firstEvent.target_iid;
	const comments = iid
		? await fetchGitlab<Array<{ body: string }>>(
				`projects/${firstEvent.repository.encoded}/${
					(isNote && firstEvent.note.noteable_type === 'Issue') || target_type === 'Issue'
						? 'issues'
						: 'merge_requests'
				}/${iid}/notes`
		  )
		: undefined;

	// Get value for each priority
	const valuedPriorities = priorities.map<[Priority['criteria'], number, string | undefined]>(
		(priority) => [
			priority.criteria,
			getPriorityValue(priority, value, event.data, comments) ? priority.value : 0,
			'specifier' in priority ? priority.specifier : undefined
		]
	);

	// Get the accumulated value of all priorities
	const accumulatedValue = valuedPriorities.reduce<number>(
		(previous, current) => previous + current[1],
		0
	);
	if (accumulatedValue === 0) return value;

	// Get the most valued criteria
	const mostValuedCriteria = valuedPriorities.reduce<(typeof valuedPriorities)[number]>(
		(previous, current) =>
			(accumulatedValue > 0 ? previous[1] > current[1] : previous[1] < current[1])
				? previous
				: current,
		valuedPriorities[0]
	);

	const priorityLabel = mostValuedCriteria[2]
		? `${prioritiesLabel[mostValuedCriteria[0]]} "${cleanSpecifier(mostValuedCriteria[2])}"`
		: prioritiesLabel[mostValuedCriteria[0]];
	return {
		...value,
		priority: {
			label: priorityLabel.replace('...', ''),
			value: accumulatedValue
		}
	};
}

export async function fetchGitlabLabels(repos: GitlabEventWithRepoData['repository'][]) {
	const responses = await Promise.all(
		repos.map((repo) =>
			fetchGitlab<Array<GitlabLabel>>(`projects/${repo.encoded}/labels?per_page=100`, {
				domain: repo.domain
			})
		)
	);
	GITLAB_LABELS = new Map(responses.map((response, index) => [repos[index].encoded, response]));
}

function getColoredLabels(repo: string, labels: string[]): NotificationData['labels'] {
	const gitlabLabels = GITLAB_LABELS?.get(repo);
	if (!gitlabLabels) return [];
	return labels.map((label) => {
		const gitlabLabel = gitlabLabels.find((l) => l.name === label);
		return {
			name: label,
			color: gitlabLabel?.color || '#000000'
		};
	});
}

function getPriorityValue(
	priority: Priority,
	notification: NotificationData,
	data?: GitlabIssue | GitlabMergeRequest,
	comments?: Array<{ body: string }>
): boolean | null | undefined {
	switch (priority.criteria) {
		case 'assigned':
			return (
				data &&
				'assignees' in data &&
				data.assignees.some((assignee) => assignee.username === getLoggedUser()?.login)
			);

		case 'many-comments':
			return data && 'user_notes_count' in data && data.user_notes_count > 5;

		case 'many-reactions':
			return data && 'upvotes' in data && data.upvotes + data.downvotes > 5;

		case 'mentioned':
			return comments?.some(
				({ body }) =>
					body.includes(`@${getLoggedUser()?.login}`) &&
					!body.startsWith('assigned to ') &&
					!body.startsWith('requested review from ')
			);

		case 'review-request':
			return (
				data &&
				'reviewers' in data &&
				data.reviewers.some((assignee) => assignee.username === getLoggedUser()?.login)
			);

		case 'label':
			return notification.labels?.some((label) => label.name === priority.specifier);

		case 'state': {
			if (!(data && 'state' in data)) {
				return false;
			}
			let { state } = data;
			if (state === 'merged') state = 'closed';
			return state === priority.specifier;
		}

		case 'type':
			return notification.type === priority.specifier;
	}
}

function getLoggedUser() {
	let user: User | undefined;
	page.subscribe((page) => {
		user = page.data.session?.gitlabUser;
	});
	return user;
}
