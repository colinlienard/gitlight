import type { LayoutServerLoad } from './$types';

export const load = (async ({ cookies }) => {
	const user = cookies.get('user') ? JSON.parse(cookies.get('user') as string) : null;
	const accessToken = cookies.get('access_token');
	return { session: { user, accessToken } };
}) satisfies LayoutServerLoad;
