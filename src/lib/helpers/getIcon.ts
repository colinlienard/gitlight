import type { ComponentType } from 'svelte';
import {
	IssueClosed,
	IssueNotPlanned,
	IssueOpen,
	PullRequestClosed,
	PullRequestDraft,
	PullRequestMerged,
	PullRequestOpen
} from '../icons';
import type { Color, GithubIssue, GithubPullRequest } from '../types';

export function getIssueIcon({ state, state_reason }: GithubIssue): ComponentType {
	switch (state) {
		case 'open':
			return IssueOpen;
		case 'closed':
			return state_reason === 'completed' ? IssueClosed : IssueNotPlanned;
		default:
			throw new Error('Invalid state');
	}
}

export function getPullRequestIcon({ state, merged, draft }: GithubPullRequest): ComponentType {
	switch (state) {
		case 'open':
			return draft ? PullRequestDraft : PullRequestOpen;
		case 'closed':
			return merged ? PullRequestMerged : PullRequestClosed;
		default:
			throw new Error('Invalid state');
	}
}

export function getIconColor(item: GithubPullRequest | GithubIssue): Color {
	// Pull request
	if ('draft' in item) {
		if (item.state === 'open') {
			return item.draft ? 'grey' : 'green';
		}
		return item.merged ? 'purple' : 'red';
	}

	// Issue
	if (item.state === 'open') {
		return 'green';
	}
	return item.state_reason === 'completed' ? 'purple' : 'grey';
}
