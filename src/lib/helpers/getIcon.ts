import type { ComponentType } from 'svelte';
import {
	ClosedIssueIcon,
	ClosedPullRequestIcon,
	CompletedIssueIcon,
	DraftPullRequestIcon,
	MergedPullRequestIcon,
	OpenIssueIcon,
	OpenPullRequestIcon
} from '~/lib/icons';
import type { GithubIssue, GithubPullRequest } from '~/lib/types';

export function getIssueIcon({ state, state_reason }: GithubIssue): ComponentType {
	switch (state) {
		case 'open':
			return OpenIssueIcon;
		case 'closed':
			return state_reason === 'completed' ? CompletedIssueIcon : ClosedIssueIcon;
		default:
			throw new Error('Invalid state');
	}
}

export function getPullRequestIcon({ state, merged, draft }: GithubPullRequest): ComponentType {
	switch (state) {
		case 'open':
			return draft ? DraftPullRequestIcon : OpenPullRequestIcon;
		case 'closed':
			return merged ? MergedPullRequestIcon : ClosedPullRequestIcon;
		default:
			throw new Error('Invalid state');
	}
}
