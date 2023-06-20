import { writable } from 'svelte/store';
import type {
	NotificationData,
	SavedNotifications,
	Settings,
	TypeFilters,
	WatchedPerson,
	WatchedRepo
} from '~/lib/types';

export const filteredNotifications = writable<NotificationData[]>([]);

export const githubNotifications = writable<NotificationData[]>([]);

export const savedNotifications = writable<SavedNotifications>([]);

export const typeFilters = writable<TypeFilters>([
	{ name: 'Pull requests', type: 'PullRequest', active: true, number: 0 },
	{ name: 'Issues', type: 'Issue', active: true, number: 0 },
	{ name: 'Commits', type: 'Commit', active: true, number: 0 },
	{ name: 'Workflow', type: 'CheckSuite', active: true, number: 0 },
	{ name: 'Discussions', type: 'Discussion', active: true, number: 0 },
	{ name: 'Releases', type: 'Release', active: true, number: 0 }
]);

export const watchedRepos = writable<WatchedRepo[]>([]);

export const watchedPersons = writable<WatchedPerson[]>([]);

export const loading = writable<boolean>(true);

export const settings = writable<Settings>({
	activateNotifications: true,
	readWhenOpenInBrowser: true,
	readWhenPin: false,
	notificationAxis: 'Auto',
	sidebarHidden: false,
	showOnlyOpen: false
});

export const updateAvailable = writable<string | false>(false);

export const largeScreen = writable<boolean>(true);

export const error = writable<string | null>(null);
