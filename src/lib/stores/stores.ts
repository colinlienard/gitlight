import { writable } from 'svelte/store';
import type { NotificationData, SavedNotifications, Settings } from '~/lib/types';

export const filteredNotifications = writable<NotificationData[]>([]);

export const githubNotifications = writable<NotificationData[]>([]);

export const savedEventIds = writable<SavedNotifications | null>(null);

export const loading = writable<boolean>(true);

export const settings = writable<Settings>({
	activateNotifcations: true,
	readWhenOpenInBrowser: true,
	readWhenPin: true
});
