import { page } from '$app/stores';
import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { TSession } from '../types';

export const fetchGithub = (url: string) => {
	let accessToken;
	page.subscribe(({ data }) => {
		if (data && data.session) {
			accessToken = (data.session as TSession).accessToken;
		}
	});

	const result = writable({
		data: null,
		error: null as unknown,
		loading: true
	});

	(async () => {
		if (!browser) return;

		try {
			const response = await fetch(`https://api.github.com/${url}`, {
				headers: {
					Accept: 'application/vnd.github+json',
					Authorization: `Bearer ${accessToken}`
				}
			});
			const data = await response.json();
			result.set({ data, error: null, loading: false });
		} catch (error) {
			result.set({ data: null, error, loading: false });
		}
	})();

	return result;
};
