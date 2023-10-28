import type {
	GithubIssue,
	GithubPullRequest,
	GitlabIssue,
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

export function getGitlabIcon(data: GitlabMergeRequest | GitlabIssue): NotificationIcon {
	if ('source_branch' in data) {
		switch (data.state) {
			case 'opened':
				return data.draft ? 'draft-pr' : 'open-pr';
			case 'closed':
				return 'closed-pr';
			case 'merged':
				return 'merged-pr';
			default:
				throw new Error('Invalid state');
		}
	}

	switch (data.state) {
		case 'opened':
			return 'open-issue';
		case 'closed':
			return 'completed-issue';
		default:
			throw new Error('Invalid state');
	}
}
