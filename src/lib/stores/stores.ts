import { writable } from 'svelte/store';
import type { NotificationData, SavedNotifications, Settings, WatchedRepo } from '~/lib/types';

export const filteredNotifications = writable<NotificationData[]>([]);

export const githubNotifications = writable<NotificationData[]>([]);

export const savedEventIds = writable<SavedNotifications | null>(null);

export const watchedRepos = writable<WatchedRepo[]>([]);

export const loading = writable<boolean>(true);

export const settings = writable<Settings>({
	activateNotifications: true,
	readWhenOpenInBrowser: true,
	readWhenPin: false,
	notificationAxis: 'Auto'
});

export const largeScreen = writable<boolean>(true);
