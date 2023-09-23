import { fetchGitlab } from './fetchGitlab';
import { getMergeRequestIcon } from '../helpers';
import type {
	GitlabEvent,
	GitlabMergeRequest,
	NotificationData,
	SavedNotifications
} from '../types';

export async function createGitlabNotificationData(
	gitlabEvent: GitlabEvent,
	savedNotifications: SavedNotifications,
	firstTime: boolean
): Promise<NotificationData | null> {
	const previous = savedNotifications.find((n) => n.id === gitlabEvent.id.toString());
	const pinned = previous?.pinned || false;
	const muted = previous?.muted || false;
	const unread = (muted ? false : previous?.unread) || false;
	const done = previous?.done || false;

	const common = {
		id: gitlabEvent.id.toString(),
		from: 'gitlab',
		pinned,
		unread,
		done,
		muted,
		time: gitlabEvent.created_at,
		owner: 'owner',
		repo: 'repo',
		// repoId: `${repository.id}`,
		repoId: '1234',
		// ownerAvatar: repository.owner.avatar_url
		ownerAvatar: 'https://placehold.co/400'
	} as const;

	switch (gitlabEvent.action_name) {
		case 'pushed new':
			return {
				...common,
				icon: 'commit',
				title: gitlabEvent.push_data.commit_title,
				description: '*made a commit*',
				author: {
					login: gitlabEvent.author.username,
					avatar: gitlabEvent.author.avatar_url,
					name: gitlabEvent.author.name
				},
				type: 'commit'
			};

		case 'pushed to': {
			const mr = await fetchGitlab<GitlabMergeRequest>(
				`projects/colinlienard1%2Fgitlab-test/merge_requests?source_branch=${gitlabEvent.push_data.ref}`
			);
			console.log(mr);
			return {
				...common,
				icon: 'commit',
				title: gitlabEvent.push_data.commit_title,
				description: '*made a commit*',
				author: {
					login: gitlabEvent.author.username,
					avatar: gitlabEvent.author.avatar_url,
					name: gitlabEvent.author.name
				},
				type: 'commit'
			};
		}

		case 'opened': {
			const mr = await fetchGitlab<GitlabMergeRequest>(
				`projects/colinlienard1%2Fgitlab-test/merge_requests/${gitlabEvent.target_iid}`
			);
			return {
				...common,
				icon: getMergeRequestIcon(mr),
				title: gitlabEvent.target_title,
				description: '*opened* this merge request',
				author: {
					login: gitlabEvent.author.username,
					avatar: gitlabEvent.author.avatar_url,
					name: gitlabEvent.author.name
				},
				type: 'pr',
				labels: mr.labels.map((label) => ({ name: label, color: '#000000' }))
			};
		}

		case 'closed':
			return null;

		case 'merged':
			return null;

		case 'commented on':
			return null;

		case 'created':
			return null;

		default:
			// Log for debug purposes
			// eslint-disable-next-line no-console
			console.log(`Unknown event type: ${(gitlabEvent as GitlabEvent).action_name}`);
			return null;
	}
}
