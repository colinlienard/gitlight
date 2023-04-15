import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ cookies }) => {
	const options = {
		path: '/',
		maxAge: -1
	};
	cookies.set('access_token', '', options);
	cookies.set('user', '', options);
	throw redirect(303, '/');
};
