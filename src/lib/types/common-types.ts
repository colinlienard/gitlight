import type { ComponentType } from 'svelte';
import type {
	GithubLabel,
	GithubNotificationType,
	GithubRepository,
	GithubUser
} from './github-types';

export type User = {
	name: string;
	login: string;
	avatar: string;
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
	author?: GithubUser;
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

export type SavedNotifications = {
	pinned: string[];
	unread: string[];
};

export type WatchedRepo = {
	id: string;
	name: string;
	ownerName: string;
	ownerAvatar: string;
	number: number;
	active: boolean;
};

export type Settings = {
	activateNotifcations: boolean;
	readWhenOpenInBrowser: boolean;
	readWhenPin: boolean;
};
