import { Discussion, IssueOpen } from '../icons';
import type { TGithubEvent, TNotification } from '../types';

export function createNotificationData({
	actor,
	created_at,
	payload,
	repo,
	type
}: TGithubEvent): TNotification {
	const common = {
		imageUrl: actor.avatar_url,
		time: created_at,
		repo: repo.name
	};

	switch (type) {
		case 'CommitCommentEvent':
			return {
				...common,
				title: `${actor.display_login} commented on a commit`,
				icon: Discussion,
				subject: payload.comment.body,
				url: payload.comment.html_url
			};

		case 'CreateEvent':
			throw new Error('Not implemented');

		case 'DeleteEvent':
			throw new Error('Not implemented');

		case 'ForkEvent':
			throw new Error('Not implemented');

		case 'GollumEvent':
			throw new Error('Not implemented');

		case 'IssueCommentEvent':
			return {
				...common,
				title: `${actor.display_login} commented on an issue`,
				icon: IssueOpen,
				subject: payload.comment.body,
				url: payload.comment.html_url
			};

		case 'IssuesEvent':
			throw new Error('Not implemented');

		case 'MemberEvent':
			throw new Error('Not implemented');

		case 'PublicEvent':
			throw new Error('Not implemented');

		case 'PullRequestEvent':
			throw new Error('Not implemented');

		case 'PullRequestReviewEvent':
			throw new Error('Not implemented');

		case 'PullRequestReviewCommentEvent':
			throw new Error('Not implemented');

		case 'PullRequestReviewThreadEvent':
			throw new Error('Not implemented');

		case 'PushEvent':
			throw new Error('Not implemented');

		case 'ReleaseEvent':
			throw new Error('Not implemented');

		case 'SponsorshipEvent':
			throw new Error('Not implemented');

		case 'WatchEvent':
			throw new Error('Not implemented');

		default:
			throw new Error('Unknown event type');
	}
}
