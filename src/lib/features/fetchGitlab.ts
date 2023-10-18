import { page } from '$app/stores';
import { PUBLIC_SITE_URL } from '$env/static/public';
import { storage } from './storage';

type Options = {
	domain?: string;
	noCache?: boolean;
	accessToken?: string;
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: Record<string, unknown>;
};

export async function fetchGitlab<T = void>(url: string, options?: Options): Promise<T> {
	let { accessToken } = options || {};
	if (!accessToken) {
		if (storage.has('gitlab-access-token')) {
			accessToken = storage.get('gitlab-access-token') as string;
		} else {
			page.subscribe(({ data }) => {
				accessToken = data.session?.gitlabAccessToken || '';
			});
		}
	}

	// Refresh the GitLab access token if it has expired
	const expiration = storage.get('gitlab-expiration');
	if (expiration && new Date().getTime() > parseInt(expiration)) {
		const refreshToken = storage.get('gitlab-refresh-token');
		try {
			const response = await fetch(
				`${PUBLIC_SITE_URL}/auth/gitlab/refresh?refresh_token=${refreshToken}`
			);
			if (response.ok) {
				const { access_token, refresh_token, expires_in, created_at } = await response.json();
				storage.set('gitlab-access-token', access_token);
				storage.set('gitlab-refresh-token', refresh_token);
				storage.set('gitlab-expiration', `${(created_at + expires_in) * 1000}`);
				accessToken = access_token;
			}
		} catch {
			throw new Error(
				'An error occurred while refreshing the GitLab access token. Please try again.'
			);
		}
	}

	const response = await fetch(
		`${url.startsWith('http') ? '' : `https://${options?.domain ?? 'gitlab.com'}/api/v4/`}${url}`,
		{
			headers: {
				Authorization: `Bearer ${accessToken}`
			},
			method: options?.method || 'GET',
			body: options?.body ? JSON.stringify(options.body) : undefined,
			cache: options?.noCache ? 'no-store' : undefined
		}
	);

	if (options?.method === 'PATCH') return undefined as T;

	if (response.ok) {
		return await response.json();
	}

	throw new Error(`${response.status}`);
}
