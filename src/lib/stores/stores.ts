import { writable } from 'svelte/store';
import type { EventData } from '~/lib/types';

export const filteredEvents = writable<EventData[]>([]);

export const githubEvents = writable<EventData[]>([]);

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
