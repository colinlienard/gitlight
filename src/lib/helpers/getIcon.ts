import type { ComponentType } from 'svelte';
import {
	IssueClosed,
	IssueOpen,
	PullRequestClosed,
	PullRequestDraft,
	PullRequestMerged,
	PullRequestOpen
} from '../icons';
import type { TColors, TGithubIssue, TGithubPullRequest } from '../types';

export function getIssueIcon({ state }: TGithubIssue): ComponentType {
	switch (state) {
		case 'open':
			return IssueOpen;
		case 'closed':
			return IssueClosed;
		default:
			throw new Error('Invalid state');
	}
}

export function getPullRequestIcon({ state, merged, draft }: TGithubPullRequest): ComponentType {
	switch (state) {
		case 'open':
			return draft ? PullRequestDraft : PullRequestOpen;
		case 'closed':
			return merged ? PullRequestMerged : PullRequestClosed;
		default:
			throw new Error('Invalid state');
	}
}

export function getIconColor(item: TGithubPullRequest | TGithubIssue): TColors {
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
	return item.state_reason === 'completed' ? 'purple' : 'red';
}
