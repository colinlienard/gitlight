import { redirect } from '@sveltejs/kit';
import { fetchGithub } from '~/lib/helpers';
import type { TSession } from '~/lib/types';
import type { LayoutServerLoad } from '../$types';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.getSession();
	if (!session) {
		throw redirect(303, '/');
	}

	const notifications = await fetchGithub(
		'https://api.github.com/notifications?all=true',
		(session as TSession).accessToken
	);
	return { notifications };
};
