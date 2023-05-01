import type {
	GithubCommit,
	GithubIssue,
	GithubItem,
	GithubNotification,
	GithubPullRequest,
	GithubRelease,
	NotificationData,
	SavedNotifications
} from '~/lib/types';
import { Commit, Discussion, Release } from '../icons';
import { getIconColor, getIssueIcon, getPullRequestIcon } from './getIcon';

export function createNotificationData(
	{ id, repository, subject, unread: u, updated_at }: GithubNotification,
	data: GithubItem,
	savedNotificationIds: SavedNotifications
): NotificationData {
	const pinned = savedNotificationIds?.pinned.includes(id) || false;
	const unread = u || savedNotificationIds?.unread.includes(id) || false;
	const isNew = (u && !savedNotificationIds?.unread.includes(id)) || false;

	const [owner, repo] = repository.full_name.split('/');
	const common = {
		id,
		pinned,
		unread,
		isNew,
		time: updated_at,
		title: subject.title,
		type: subject.type,
		owner,
		repo,
		repoId: `${repository.id}`,
		ownerAvatar: repository.owner.avatar_url
	};

	switch (subject.type) {
		case 'Commit':
			return {
				...common,
				author: (data as GithubCommit).author,
				description: 'made a commit',
				icon: Commit,
				iconColor: 'blue',
				url: (data as GithubCommit).html_url
			};

		case 'Issue': {
			const { labels, number, html_url } = data as GithubIssue;
			return {
				...common,
				description: 'New activity on issue',
				icon: getIssueIcon(data as GithubIssue),
				iconColor: getIconColor(data as GithubIssue),
				number,
				labels,
				url: html_url
			};
		}

		case 'PullRequest': {
			const { user, merged, number, labels, state, html_url } = data as GithubPullRequest;
			return {
				...common,
				author: user,
				description: `${
					merged ? 'merged' : state === 'open' ? 'opened' : 'closed'
				} this pull request`,
				icon: getPullRequestIcon(data as GithubPullRequest),
				iconColor: getIconColor(data as GithubPullRequest),
				number,
				labels,
				url: html_url
			};
		}

		case 'Release': {
			const { author, tag_name, prerelease, html_url } = data as GithubRelease;
			return {
				...common,
				author,
				description: 'made a release',
				icon: Release,
				iconColor: 'blue',
				labels: [
					{ name: tag_name, color: 'white' },
					...(prerelease ? [{ name: 'pre-release', color: 'FFA723' }] : [])
				],
				url: html_url
			};
		}

		case 'Discussion':
			return {
				...common,
				description: 'New activity on discussion',
				icon: Discussion,
				iconColor: 'blue'
			};

		default:
			throw new Error(`Invalid notification type: ${subject.type}`);
	}
}
