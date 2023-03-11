import type { ComponentType } from 'svelte';
import {
	IssueClosed,
	IssueOpen,
	PullRequestClosed,
	PullRequestMerged,
	PullRequestOpen
} from '../icons';

export function getIssueIcon(state: 'open' | 'closed'): ComponentType {
	switch (state) {
		case 'open':
			return IssueOpen;
		case 'closed':
			return IssueClosed;
		default:
			throw new Error('Invalid state');
	}
}

export function getPullRequestIcon(state: 'open' | 'closed', merged: boolean): ComponentType {
	switch (state) {
		case 'open':
			return PullRequestOpen;
		case 'closed':
			return merged ? PullRequestMerged : PullRequestClosed;
		default:
			throw new Error('Invalid state');
	}
}
