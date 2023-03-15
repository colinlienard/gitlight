import { page } from '$app/stores';
import type { TSession } from '../types';

// Pass `accessToken` only if on the server
export const fetchGithub = async (url: string, accessToken?: string): Promise<unknown | null> => {
	if (!accessToken) {
		page.subscribe(({ data }) => {
			if (data && data.session) {
				accessToken = (data.session as TSession).accessToken;
			}
		});
	}

	const response = await fetch(url, {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${accessToken}`
		}
	});
	if (response.ok) {
		const data = await response.json();
		return data;
	}

	return null;
};
