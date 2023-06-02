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
import { Commit, Discussion, ExclamationMark, Release } from '../icons';
import { getIconColor, getIssueIcon, getPullRequestIcon } from './getIcon';

export function createNotificationData(
	{ id, repository, subject, unread: u, updated_at, reason }: GithubNotification,
	data: GithubItem,
	savedNotifications: SavedNotifications
): NotificationData {
	const previous = savedNotifications.find((n) => n.id === id);
	const pinned = previous?.pinned || false;
	const unread = u || previous?.unread || false;
	const isNew = (u && !previous?.unread) || false;

	const [owner, repo] = repository.full_name.split('/');
	const common = {
		id,
		pinned,
		unread,
		isNew,
		time: previous?.time || updated_at,
		title: subject.title,
		type: subject.type,
		owner,
		repo,
		repoId: `${repository.id}`,
		ownerAvatar: repository.owner.avatar_url
	} satisfies Partial<NotificationData>;

	switch (subject.type) {
		case 'Commit': {
			const { author, html_url } = data as GithubCommit;
			return {
				...common,
				author: { login: author.login, avatar: author.avatar_url },
				description: 'made a commit',
				icon: Commit,
				iconColor: 'blue',
				url: html_url
			};
		}

		case 'Issue': {
			const { labels, number, state, created_at, closed_at, closed_by, user, html_url } =
				data as GithubIssue;

			let author;
			let description = 'New activity on issue';
			if (
				state == 'open' &&
				new Date(common.time).getTime() - new Date(created_at).getTime() < 60000
			) {
				author = { login: user.login, avatar: user.avatar_url };
				description = 'opened this issue';
			} else if (
				state === 'closed' &&
				new Date(common.time).getTime() - new Date(closed_at as string).getTime() < 60000
			) {
				author = closed_by ? { login: closed_by.login, avatar: closed_by.avatar_url } : undefined;
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
				url: html_url,
				previously:
					previous?.previously || previous?.description !== description ? previous : undefined
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
				author = { login: user.login, avatar: user.avatar_url };
				description = 'opened this pull request';
			} else if (
				state === 'closed' &&
				new Date(common.time).getTime() - new Date(closed_at as string).getTime() < 60000
			) {
				author = merged_by
					? { login: merged_by.login, avatar: merged_by.avatar_url }
					: { login: user.login, avatar: user.avatar_url };
				description = `${merged ? 'merged' : 'closed'} this pull request`;
			} else if (reason === 'review_requested') {
				author = { login: user.login, avatar: user.avatar_url };
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
				url: html_url,
				previously:
					previous?.previously || previous?.description !== description ? previous : undefined
			};
		}

		case 'Release': {
			const { author, tag_name, prerelease, html_url } = data as GithubRelease;
			return {
				...common,
				author: { login: author.login, avatar: author.avatar_url },
				description: 'made a release',
				icon: Release,
				iconColor: 'blue',
				labels: [
					{ name: tag_name, color: 'FFFFFF' },
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
			return {
				...common,
				type: 'PullRequest',
				description: `'${subject.type}' notifications are not yet fully supported`,
				icon: ExclamationMark,
				iconColor: 'grey'
			};
	}
}
