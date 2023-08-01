import { page } from '$app/stores';

type Options = {
	noCache?: boolean;
	accessToken?: string;
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: Record<string, unknown>;
	pat?: string;
};

export async function fetchGithub<T = void>(url: string, options?: Options): Promise<T> {
	let { accessToken } = options || {};
	if (!accessToken) {
		page.subscribe(({ data }) => {
			accessToken = data.session?.accessToken || '';
		});
	}

	const response = await fetch(`${url.startsWith('http') ? '' : 'https://api.github.com/'}${url}`, {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: options?.pat ? `token ${options.pat}` : `Bearer ${accessToken}`
		},
		method: options?.method || 'GET',
		body: options?.body ? JSON.stringify(options.body) : undefined,
		cache: options?.noCache ? 'no-store' : undefined
	});

	if (options?.method === "PATCH") return undefined as T;

	if (response.ok) {
    return await response.json();
	}

	throw new Error(`${response.status}`);
}
