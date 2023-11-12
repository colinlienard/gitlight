import { writable } from 'svelte/store';
import type {
	NotificationData,
	Settings,
	TypeFilters,
	WatchedPerson,
	WatchedRepo
} from '$lib/types';

export const filteredNotifications = writable<NotificationData[]>([]);

export const githubNotifications = writable<NotificationData[]>([]);

export const gitlabNotifications = writable<NotificationData[]>([]);

export const globalNotifications = writable<NotificationData[]>([]);

export const typeFilters = writable<TypeFilters>([
	{ name: 'Pull requests', type: 'pr', active: true, number: 0 },
	{ name: 'Issues', type: 'issue', active: true, number: 0 },
	{ name: 'Commits', type: 'commit', active: true, number: 0 },
	{ name: 'Workflows', type: 'workflow', active: true, number: 0 },
	{ name: 'Discussions', type: 'discussion', active: true, number: 0 },
	{ name: 'Releases', type: 'release', active: true, number: 0 }
]);

export const watchedRepos = writable<WatchedRepo[]>([]);

export const watchedPersons = writable<WatchedPerson[]>([]);

export const loading = writable<boolean>(true);

export const settings = writable<Settings>({
	theme: 'System',
	activateNotifications: true,
	readWhenOpenInBrowser: true,
	notificationNumber: 50,
	sidebarHidden: false,
	showOnlyOpen: false,
	pats: [],
	prioritySorting: true,
	showPriority: true,
	providerView: 'both',
	applyFiltersForDone: false,
	viewMode: 'Kanban',
	activeTray: true,
	gitlabRepos: [],
	gitlabOnlyInvolved: true
});

export const theme = writable<'light' | 'dark'>('light');

export const error = writable<string | null>(null);
