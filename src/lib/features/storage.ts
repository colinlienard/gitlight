import type { Priority, SavedNotifications, Settings, User } from '../types';

type StorageMap = {
	'github-user': User;
	'github-access-token': string;
	'gitlab-user': User;
	'gitlab-access-token': string;
	settings: Settings;
	'github-notifications': SavedNotifications;
	'github-watched-repos': { id: string; active: boolean; muted: boolean }[];
	'github-watched-persons': { login: string; active: boolean; muted: boolean }[];
	'type-filters': boolean[];
	priorities: Priority[];
};

export const storage = {
	get<T extends keyof StorageMap>(key: T): StorageMap[T] | null {
		if (storage.has(key)) {
			const value = localStorage.getItem(key) as string;
			try {
				return JSON.parse(value);
			} catch {
				return value as StorageMap[T];
			}
		}
		return null;
	},
	set<T extends keyof StorageMap>(key: T, value: StorageMap[T]) {
		localStorage.setItem(key, JSON.stringify(value));
	},
	has(key: keyof StorageMap): boolean {
		return !!localStorage.getItem(key);
	},
	remove(key: keyof StorageMap) {
		localStorage.removeItem(key);
	}
};
