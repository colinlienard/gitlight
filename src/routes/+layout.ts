import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { fetchGithub, storage } from '~/lib/helpers';
import type { GithubUser } from '~/lib/types';

import '~/styles/_reset.scss';
import '~/styles/_base.scss';
import '~/styles/_fonts.scss';

export const prerender = true;
export const ssr = true;

export async function load({ url }) {
	if (!browser) return;

	let user = storage.get('user');
	let accessToken = storage.get('access-token');

	// Get access token
	if (url.searchParams.has('access_token')) {
		accessToken = url.searchParams.get('access_token') as string;
		storage.set('access-token', accessToken);
		history.replaceState({}, '', '/dashboard');
	}

	// Set user data
	if (!user && accessToken) {
		try {
			const { name, login, avatar_url } = (await fetchGithub('user', {
				accessToken
			})) as GithubUser;
			user = { name, login, avatar: avatar_url };
			storage.set('user', user);
		} catch {
			//
		}
	}

	const session = user && accessToken ? { user, accessToken } : null;

	// Handle redirects
	if (url.pathname === '/dashboard' && !session) {
		throw redirect(302, '/login');
	} else if (url.pathname !== '/dashboard' && session) {
		throw redirect(302, '/dashboard');
	}

	return { session };
}
