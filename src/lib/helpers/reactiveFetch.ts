import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export function reactiveFetch<T extends unknown[]>(
	fetcher: (..._: T) => Promise<unknown>,
	...args: T
) {
	const result = writable({
		data: null as unknown,
		error: null as unknown,
		loading: true
	});

	(async () => {
		if (!browser) return;

		try {
			const data = await fetcher(...args);
			result.set({ data, error: null, loading: false });
		} catch (error) {
			result.set({ data: null, error, loading: false });
		}
	})();

	return result;
}
