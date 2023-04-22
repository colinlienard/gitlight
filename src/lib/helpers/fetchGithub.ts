import { page } from '$app/stores';

export async function fetchGithub(
	url: string,
	noCache = false,
	accessToken = ''
): Promise<unknown> {
	if (!accessToken) {
		page.subscribe(({ data }) => {
			accessToken = data.session?.accessToken || '';
		});
	}

	const response = await fetch(`${url.startsWith('http') ? '' : 'https://api.github.com/'}${url}`, {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${accessToken}`
		},
		cache: noCache ? 'no-cache' : undefined
	});
	if (response.ok) {
		const data = await response.json();
		return data;
	}

	throw new Error('Failed to fetch');
}
