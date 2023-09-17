import type { GitlabEvent, NotificationData, SavedNotifications } from '../types';

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
		id: `${gitlabEvent.id}`,
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

		case 'opened':
			return {
				...common,
				icon: 'open-pr',
				title: gitlabEvent.target_title,
				description: '*opened* this merge request',
				author: {
					login: gitlabEvent.author.username,
					avatar: gitlabEvent.author.avatar_url,
					name: gitlabEvent.author.name
				},
				type: 'pr'
			};

		case 'closed':
			return null;

		case 'merged':
			return null;

		case 'commented_on':
			return null;

		default:
			return null;
	}
}
