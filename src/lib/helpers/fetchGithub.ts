import { page } from '$app/stores';
import type { Session } from '../types';

export async function fetchGithub(url: string): Promise<unknown> {
	let accessToken;
	page.subscribe(({ data }) => {
		if (data && data.session) {
			accessToken = (data.session as Session).accessToken;
		}
	});

	const response = await fetch(`https://api.github.com/${url}`, {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${accessToken}`
		},
		cache: 'no-cache'
	});
	if (response.ok) {
		const data = await response.json();
		return data;
	}

	throw new Error('Failed to fetch');
}
