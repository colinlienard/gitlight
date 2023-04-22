import { writable } from 'svelte/store';
import type { NotificationData } from '~/lib/types';

export const filteredNotifications = writable<NotificationData[]>([]);

export const githubNotifications = writable<NotificationData[]>([]);

export const savedEventIds = writable<{
	pinned: string[];
	unread: string[];
	read: string[];
} | null>(null);

export const loading = writable<boolean>(true);

export const settings = writable({
	activateNotifcations: true,
	readWhenOpenInBrowser: true,
	readWhenPin: true
});
