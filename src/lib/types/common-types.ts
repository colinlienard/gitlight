import type { ComponentType } from 'svelte';
import type {
	GithubLabel,
	GithubNotificationReason,
	GithubNotificationType,
	GithubRepository
} from './github-types';

export type User = {
	name?: string;
	login: string;
	avatar?: string;
	bot?: boolean;
};

export type Session = {
	user: User;
	accessToken: string;
};

export type NotificationData = {
	id: string;
	type: GithubNotificationType;
	unread: boolean;
	pinned: boolean;
	done: boolean;
	isNew: boolean;
	reason: GithubNotificationReason;
	author?: User;
	title: string;
	description: string;
	priority?: {
		label: string;
		value: number;
	};
	time: string;
	icon: ComponentType;
	opened?: boolean;
	owner: string;
	repo: string;
	repoId: string;
	ownerAvatar: string;
	number?: number;
	labels?: GithubLabel[];
	url?: string;
	previously?: {
		author?: User;
		description: string;
	};
};

export type TypeFilters = Array<{
	name: string;
	type: GithubNotificationType;
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
	pinned: boolean;
	unread: boolean;
	done: boolean;
	time: string;
	previously?: NotificationData['previously'];
}>;

export type WatchedRepo = {
	id: string;
	name: string;
	ownerName: string;
	ownerAvatar: string;
	number: number;
	active: boolean;
};

export type WatchedPerson = {
	login: string;
	avatar: string;
	number: number;
	active: boolean;
	bot?: boolean;
};

export type Settings = {
	activateNotifications: boolean;
	pushNotificationReasons: Record<GithubNotificationReason, boolean>;
	showNotificationsSyncTimer: boolean;
	readWhenOpenInBrowser: boolean;
	readWhenPin: boolean;
	notificationNumber: number;
	notificationAxis: 'Auto' | 'Vertical' | 'Horizontal';
	sidebarHidden: boolean;
	showOnlyOpen: boolean;
	pats: Array<{
		owner: string;
		token: string;
	}>;
	prioritySorting: boolean;
};

export type Priority = {
	value: number;
} & (
	| {
			criteria: 'many-comments' | 'many-reactions' | 'assigned' | 'mentionned' | 'review-request';
	  }
	| {
			criteria: 'label';
			specifier: string;
	  }
	| {
			criteria: 'state';
			specifier: 'open' | 'closed';
	  }
);
