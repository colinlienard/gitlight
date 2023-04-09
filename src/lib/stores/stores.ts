import { writable } from 'svelte/store';
import type { TEvent } from '~/lib/types';

export const filteredEvents = writable<TEvent[]>([]);

export const githubEvents = writable<TEvent[]>([]);

export const savedEventIds = writable<{
	pinned: string[];
	read: string[];
} | null>(null);

export const loading = writable<boolean>(true);

export const settings = writable({
	activateNotifcations: true,
	readWhenOpenInBrowser: true,
	readWhenPin: true
});