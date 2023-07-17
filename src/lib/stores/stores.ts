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
	pushNotificationReasons: {
		assign: true,
		author: true,
		comment: true,
		manual: true,
		mention: true,
		team_mention: true,
		review_requested: true,
		subscribed: true,
		ci_activity: true,
		invitation: true,
		security_alert: true,
		state_change: true
	},
	showNotificationsSyncTimer: true,
	readWhenOpenInBrowser: false,
	readWhenPin: false,
	notificationNumber: 50,
	notificationAxis: 'Auto',
	sidebarHidden: false,
	showOnlyOpen: false,
	pats: []
});

export const largeScreen = writable<boolean>(true);

export const error = writable<string | null>(null);
