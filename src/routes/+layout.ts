import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { fetchGithub } from '~/lib/helpers';
import type { GithubUser, User } from '~/lib/types';

import '~/styles/_reset.scss';
import '~/styles/_base.scss';
import '~/styles/_fonts.scss';

export const prerender = true;
export const ssr = true;

export async function load({ url }) {
	if (!browser) return;

	let user: User = localStorage.getItem('user')
		? JSON.parse(localStorage.getItem('user') as string)
		: null;
	let accessToken = localStorage.getItem('access_token');

	// Get access token
	if (url.searchParams.has('access_token')) {
		accessToken = url.searchParams.get('access_token') as string;
		localStorage.setItem('access_token', accessToken);
		history.replaceState({}, '', '/dashboard');
	}

	// Set user data
	if (!user && accessToken) {
		try {
			const { name, login, avatar_url } = (await fetchGithub('user', {
				accessToken
			})) as GithubUser;
			user = { name, login, avatar: avatar_url };
			localStorage.setItem('user', JSON.stringify(user));
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

	// Open the desktop app with the access token

	if (!window.__TAURI__ && accessToken) {
		window.location.href = `gitlight://access_token=${accessToken}`;
	}

	return { session };
}
