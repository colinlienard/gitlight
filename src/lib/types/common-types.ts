import type { ComponentType } from 'svelte';
import type { GithubLabel, GithubNotificationType, GithubRepository } from './github-types';

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

export type Color = 'blue' | 'purple' | 'green' | 'red' | 'grey';

export type NotificationData = {
	id: string;
	type: GithubNotificationType;
	unread: boolean;
	pinned: boolean;
	isNew: boolean;
	author?: User;
	title: string;
	description: string;
	time: string;
	icon: ComponentType;
	iconColor: Color;
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

export type TypeFilters = {
	name: string;
	type: GithubNotificationType;
	active: boolean;
	number: number;
}[];

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
	readWhenOpenInBrowser: boolean;
	readWhenPin: boolean;
	notificationAxis: 'Auto' | 'Vertical' | 'Horizontal';
	sidebarHidden: boolean;
};
