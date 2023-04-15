import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	if (event.locals.session) {
		throw redirect(303, '/dashboard');
	}
}) satisfies PageServerLoad;
