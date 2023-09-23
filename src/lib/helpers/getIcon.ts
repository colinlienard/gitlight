import type {
	GithubIssue,
	GithubPullRequest,
	GitlabMergeRequest,
	NotificationIcon
} from '$lib/types';

export function getIssueIcon({ state, state_reason }: GithubIssue): NotificationIcon {
	switch (state) {
		case 'open':
			return 'open-issue';
		case 'closed':
			return state_reason === 'completed' ? 'completed-issue' : 'closed-issue';
		default:
			throw new Error('Invalid state');
	}
}

export function getPullRequestIcon({ state, merged, draft }: GithubPullRequest): NotificationIcon {
	switch (state) {
		case 'open':
			return draft ? 'draft-pr' : 'open-pr';
		case 'closed':
			return merged ? 'merged-pr' : 'closed-pr';
		default:
			throw new Error('Invalid state');
	}
}

export function getMergeRequestIcon({ state, draft }: GitlabMergeRequest): NotificationIcon {
	switch (state) {
		case 'opened':
			return draft ? 'draft-pr' : 'open-pr';
		case 'closed':
			return 'closed-pr';
		case 'merged':
			return 'merged-pr';
		default:
			throw new Error('Invalid state');
	}
}
