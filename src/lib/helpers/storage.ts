import type { Settings, User } from '../types';

type StorageMap = {
	type_filters: boolean[];
	github_watched_repos: { id: string; active: boolean }[];
	settings: Settings;
	user: User;
	access_token: string;
	github_notifications: { pinned: string[]; unread: string[] };
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
