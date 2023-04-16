import { fetchGithub } from '~/lib/helpers';
import { redirect, type Handle } from '@sveltejs/kit';
import type { GithubUser } from './lib/types';

export const handle = (async ({ event, resolve }) => {
	const { cookies, url } = event;

	let user = cookies.get('user') ? JSON.parse(cookies.get('user') as string) : null;
	const accessToken = cookies.get('access_token');

	let authenticated = false;

	// Check if user is authenticated and set user data
	if (user && accessToken) {
		authenticated = true;
	} else if (accessToken) {
		try {
			const { name, login, avatar_url } = (await fetchGithub('user', accessToken)) as GithubUser;
			user = { name, login, avatar: avatar_url };
			cookies.set('user', JSON.stringify(user), {
				path: '/',
				expires: new Date('Tue, 19 Jan 2038 04:14:07 GMT')
			});
			authenticated = true;
		} catch {
			//
		}
	}

	// Handle protected routes
	if (url.pathname.startsWith('/auth')) {
		//
	} else if (url.pathname === '/dashboard' && !authenticated) {
		throw redirect(303, '/login');
	} else if (url.pathname !== '/dashboard' && authenticated) {
		throw redirect(303, '/dashboard');
	}

	const response = await resolve(event);
	return response;
}) satisfies Handle;
