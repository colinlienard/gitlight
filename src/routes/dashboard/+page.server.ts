import { redirect } from '@sveltejs/kit';
import { fetchGithub } from '~/lib/helpers';
import type { TSession } from '~/lib/types';
import type { LayoutServerLoad } from '../$types';

export const load: LayoutServerLoad = async (event) => {
	const session = await event.locals.getSession();
	if (!session?.user) {
		throw redirect(303, '/');
	}

	const { accessToken } = session as TSession;
	const { login } = await fetchGithub(`https://api.github.com/user`, accessToken);
	const githubEvents = await fetchGithub(
		`https://api.github.com/users/${login}/received_events?per_page=50`,
		accessToken
	);
	return { githubEvents };
};
