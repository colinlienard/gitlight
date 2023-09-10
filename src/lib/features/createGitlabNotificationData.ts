import type { GitlabEvent, NotificationData, SavedNotifications } from '../types';

export async function createGitlabNotificationData(
	gitlabEvent: GitlabEvent,
	savedNotifications: SavedNotifications,
	firstTime: boolean
): Promise<NotificationData | null> {
	return null;
	const common = {
		id: gitlabEvent.id,
		pinned: false,
		unread: true,
		done: false,
		muted: false,
		time: gitlabEvent.created_at,
		owner,
		repo,
		repoId: `${repository.id}`,
		ownerAvatar: repository.owner.avatar_url
	} as const;

	switch (gitlabEvent.action_name) {
		case 'pushed new':
			return {
				...common,
				icon: 'commit',
				title: 'aaaa',
				description: 'bbbb',
				author: {
					login: gitlabEvent.author.username,
					avatar: gitlabEvent.author.avatar_url,
					name: gitlabEvent.author.name
				},
				type: 'commit'
			};

		case 'opened':
			return null;

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
