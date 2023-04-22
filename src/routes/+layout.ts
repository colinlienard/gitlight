import { redirect } from '@sveltejs/kit';

import '~/styles/_reset.scss';
import '~/styles/_base.scss';
import '~/styles/_fonts.scss';
import { browser } from '$app/environment';
import type { GithubUser, User } from '~/lib/types';
import { fetchGithub } from '~/lib/helpers/fetchGithub.js';

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
			const { name, login, avatar_url } = (await fetchGithub(
				'user',
				false,
				accessToken
			)) as GithubUser;
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

	return { session };
}
