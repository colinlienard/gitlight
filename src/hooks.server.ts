import { fetchGithub } from '~/lib/helpers';
import type { Handle } from '@sveltejs/kit';
import type { GithubUser, User } from './lib/types';

export const handle: Handle = async ({ event, resolve }) => {
	if (!event.locals.session) {
		const { cookies } = event;

		const user = cookies.get('user') ? JSON.parse(cookies.get('user') as string) : null;
		const accessToken = cookies.get('access_token');

		if (user && accessToken) {
			event.locals.session = { user, accessToken };
		} else if (accessToken) {
			try {
				const { name, login, avatar_url } = (await fetchGithub('user', accessToken)) as GithubUser;
				const userData: User = { name, login, avatar: avatar_url };
				cookies.set('user', JSON.stringify(userData), {
					path: '/',
					expires: new Date('Tue, 19 Jan 2038 04:14:07 GMT')
				});
				event.locals.session = { user: userData, accessToken };
			} catch {
				event.locals.session = null;
			}
		} else {
			event.locals.session = null;
		}
	}

	const response = await resolve(event);
	return response;
};
