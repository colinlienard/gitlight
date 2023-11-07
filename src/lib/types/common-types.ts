import type { GithubLabel, GithubRepository } from './github-types';
import type { GitlabEvent } from './gitlab-types';

export type User = {
	name?: string;
	login: string;
	avatar?: string;
	bot?: boolean;
};

export type Session = {
	githubUser?: User;
	githubAccessToken?: string;
	gitlabUser?: User;
	gitlabAccessToken?: string;
};

export type NotificationIcon =
	| 'commit'
	| 'issue'
	| 'open-issue'
	| 'completed-issue'
	| 'closed-issue'
	| 'pr'
	| 'draft-pr'
	| 'open-pr'
	| 'merged-pr'
	| 'closed-pr'
	| 'release'
	| 'discussion'
	| 'workflow'
	| 'workflow-fail'
	| 'workflow-success'
	| 'unsupported';

export type NotificationType = 'pr' | 'issue' | 'commit' | 'release' | 'discussion' | 'workflow';

export type NotificationData = {
	id: string;
	from: 'github' | 'gitlab';
	type: NotificationType;
	status: 'unread' | 'read' | 'pinned' | 'done';
	muted: boolean;
	author?: User;
	creator?: User;
	title: string;
	description: string;
	priority?: {
		label: string;
		value: number;
	};
	time: string;
	icon: NotificationIcon;
	opened?: boolean;
	repository: {
		id: number;
		url: string;
		domain: string;
		owner: string;
		name: string;
	};
	ownerAvatar?: string;
	number?: number;
	labels?: GithubLabel[];
	url?: string;
	ref?: string;
	previously?: {
		author?: User;
		description: NotificationData['description'];
	};
};

export type TypeFilters = Array<{
	name: string;
	type: NotificationType;
	active: boolean;
	number: number;
}>;

export type Subscription = {
	repo: GithubRepository;
	active: boolean;
};

export type SavedNotifications = Array<{
	id: string;
	author?: User;
	description: string;
	status: 'unread' | 'read' | 'pinned' | 'done';
	muted: boolean;
	time: string;
	previously?: NotificationData['previously'];
}>;

export type WatchedRepo = {
	id: number;
	name: string;
	ownerName: string;
	ownerAvatar?: string;
	number: number;
	active: boolean;
	muted: boolean;
	from: 'github' | 'gitlab';
};

export type WatchedPerson = {
	login: string;
	avatar: string;
	number: number;
	active: boolean;
	muted: boolean;
	bot?: boolean;
	from: 'github' | 'gitlab';
};

export type GitlabEventWithRepoData = GitlabEvent & {
	repository: {
		id: number;
		url: string;
		domain: string;
		owner: string;
		name: string;
		encoded: string;
	};
};

export type Settings = {
	theme: 'system' | 'light' | 'dark';
	activateNotifications: boolean;
	readWhenOpenInBrowser: boolean;
	notificationNumber: number;
	sidebarHidden: boolean;
	showOnlyOpen: boolean;
	pats: Array<{
		owner: string;
		token: string;
	}>;
	prioritySorting: boolean;
	showPriority: boolean;
	providerView: 'github' | 'gitlab' | 'both';
	applyFiltersForDone: boolean;
	viewMode: 'List' | 'Kanban' | 'Kanban (vertical)';
	activeTray: boolean;
	gitlabRepos: Array<{
		id: number;
		url: string;
	}>;
};

export type Priority = {
	value: number;
} & (
	| {
			criteria: 'many-comments' | 'many-reactions' | 'assigned' | 'mentioned' | 'review-request';
	  }
	| {
			criteria: 'label';
			specifier: string;
	  }
	| {
			criteria: 'state';
			specifier: 'open' | 'closed';
	  }
	| {
			criteria: 'type';
			specifier: NotificationType;
	  }
);
