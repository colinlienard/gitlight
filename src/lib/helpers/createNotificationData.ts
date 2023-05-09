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
	{ id, repository, subject, unread: u, updated_at, reason }: GithubNotification,
	data: GithubItem,
	savedNotificationIds: SavedNotifications,
	date?: string
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
		time: date || updated_at,
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
			const { labels, number, state, created_at, closed_at, closed_by, user, html_url } =
				data as GithubIssue;

			let author;
			let description = 'New activity on issue';
			if (
				state == 'open' &&
				new Date(common.time).getTime() - new Date(created_at).getTime() < 60000
			) {
				author = user;
				description = 'opened this issue';
			} else if (
				state === 'closed' &&
				new Date(common.time).getTime() - new Date(closed_at as string).getTime() < 60000
			) {
				author = closed_by;
				description = 'closed this issue';
			}

			return {
				...common,
				author,
				description,
				icon: getIssueIcon(data as GithubIssue),
				iconColor: getIconColor(data as GithubIssue),
				number,
				labels,
				url: html_url
			};
		}

		case 'PullRequest': {
			const { user, merged, merged_by, number, labels, state, created_at, closed_at, html_url } =
				data as GithubPullRequest;

			let author;
			let description = 'New activity on pull request';
			if (
				state == 'open' &&
				new Date(common.time).getTime() - new Date(created_at).getTime() < 60000
			) {
				author = user;
				description = 'opened this pull request';
			} else if (
				state === 'closed' &&
				new Date(common.time).getTime() - new Date(closed_at as string).getTime() < 60000
			) {
				author = merged ? merged_by : user;
				description = `${merged ? 'merged' : 'closed'} this pull request`;
			} else if (reason === 'review_requested') {
				author = user;
				description = 'requested your review';
			}

			return {
				...common,
				author,
				description,
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
