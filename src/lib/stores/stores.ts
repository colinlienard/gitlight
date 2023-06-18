import { writable } from 'svelte/store';
import type {
	NotificationData,
	SavedNotifications,
	Settings,
	WatchedPerson,
	WatchedRepo
} from '~/lib/types';

export const filteredNotifications = writable<NotificationData[]>([]);

export const githubNotifications = writable<NotificationData[]>([]);

export const savedNotifications = writable<SavedNotifications>([]);

export const watchedRepos = writable<WatchedRepo[]>([]);

export const watchedPersons = writable<WatchedPerson[]>([]);

export const loading = writable<boolean>(true);

export const settings = writable<Settings>({
	activateNotifications: true,
	readWhenOpenInBrowser: true,
	readWhenPin: false,
	notificationAxis: 'Auto',
	sidebarHidden: false
});

export const updateAvailable = writable<string | false>(false);

export const largeScreen = writable<boolean>(true);

export const error = writable<string | null>(null);
