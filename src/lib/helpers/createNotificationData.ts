import { Commit, Discussion, Release } from '../icons';
import type { TGithubEvent, TNotification } from '../types';
import { formatRelativeDate } from './formatRelativeDate';
import { getIssueIcon, getPullRequestIcon } from './getIcon';

export function createNotificationData({
	actor,
	created_at,
	payload,
	repo,
	type
}: TGithubEvent): TNotification {
	const common = {
		time: formatRelativeDate(created_at),
		repo: repo.name
	};

	switch (type) {
		case 'CommitCommentEvent':
			return {
				...common,
				description: [
					{ text: actor.display_login, image: actor.avatar_url },
					' commented on a commit'
				],
				icon: Discussion,
				title: payload.comment.body,
				url: payload.comment.html_url
			};

		case 'CreateEvent':
			return {
				...common,
				description: [],
				icon: Commit,
				title: 'CreateEvent not implemented',
				url: ''
			};

		case 'DeleteEvent':
			return {
				...common,
				description: [],
				icon: Commit,
				title: 'DeleteEvent not implemented',
				url: ''
			};

		case 'ForkEvent':
			return {
				...common,
				description: [],
				icon: Commit,
				title: 'ForkEvent not implemented',
				url: ''
			};

		case 'GollumEvent':
			return {
				...common,
				description: [],
				icon: Commit,
				title: 'GollumEvent not implemented',
				url: ''
			};

		case 'IssueCommentEvent':
			return {
				...common,
				description: [
					{ text: actor.display_login, image: actor.avatar_url },
					' commented on ',
					{ text: payload.issue.title, icon: getIssueIcon(payload.issue.state) }
				],
				icon: Discussion,
				title: payload.comment.body,
				url: payload.comment.html_url
			};

		case 'IssuesEvent':
			return {
				...common,
				description: [
					{ text: actor.display_login, image: actor.avatar_url },
					` ${payload.action} this issue`
				],
				icon: getIssueIcon(payload.issue.state),
				title: payload.issue.title,
				number: payload.issue.number,
				url: payload.issue.html_url,
				labels: payload.issue.labels
			};

		case 'MemberEvent':
			return {
				...common,
				description: [],
				icon: Commit,
				title: 'MemberEvent not implemented',
				url: ''
			};

		case 'PublicEvent':
			return {
				...common,
				description: [],
				icon: Commit,
				title: 'PublicEvent not implemented',
				url: ''
			};

		case 'PullRequestEvent':
			return {
				...common,
				description: [
					{ text: actor.display_login, image: actor.avatar_url },
					` ${payload.action} this pull request`
				],
				icon: getPullRequestIcon(payload.pull_request.state),
				title: payload.pull_request.title,
				number: payload.pull_request.number,
				url: payload.pull_request.html_url,
				labels: payload.pull_request.labels
			};

		case 'PullRequestReviewEvent':
			return {
				...common,
				description: [],
				icon: Commit,
				title: 'PullRequestReviewEvent not implemented',
				url: ''
			};

		case 'PullRequestReviewCommentEvent':
			return {
				...common,
				description: [],
				icon: Commit,
				title: 'PullRequestReviewCommentEvent not implemented',
				url: ''
			};

		case 'PullRequestReviewThreadEvent':
			return {
				...common,
				description: [],
				icon: Commit,
				title: 'PullRequestReviewThreadEvent not implemented',
				url: ''
			};

		case 'PushEvent':
			return {
				...common,
				description: [],
				icon: Commit,
				title: 'PushEvent not implemented',
				url: ''
			};

		case 'ReleaseEvent':
			return {
				...common,
				description: [
					{ text: actor.display_login, image: actor.avatar_url },
					' published a release'
				],
				icon: Release,
				title: payload.release.name,
				url: payload.release.html_url,
				labels: [
					{ name: payload.release.tag_name, color: 'white' },
					...(payload.release.prerelease ? [{ name: 'pre-release', color: 'FFA723' }] : [])
				]
			};

		case 'SponsorshipEvent':
			return {
				...common,
				description: [],
				icon: Commit,
				title: 'SponsorshipEvent not implemented',
				url: ''
			};

		case 'WatchEvent':
			return {
				...common,
				description: [],
				icon: Commit,
				title: 'WatchEvent not implemented',
				url: ''
			};

		default:
			throw new Error('Unknown event type');
	}
}
