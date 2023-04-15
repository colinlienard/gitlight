import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AUTH_SECRET, GITHUB_ID, GITHUB_SECRET } from '$env/static/private';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const { searchParams, origin } = url;

	if (
		searchParams.has('code') &&
		searchParams.has('state') &&
		searchParams.get('state') === AUTH_SECRET
	) {
		const code = searchParams.get('code');
		const response = await fetch('https://github.com/login/oauth/access_token', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				client_id: GITHUB_ID,
				client_secret: GITHUB_SECRET,
				redirect_uri: `${origin}/auth/callback`,
				code
			})
		});

		if (response.ok) {
			const data = await response.json();
			cookies.set('access_token', data.access_token, {
				path: '/',
				expires: new Date('Tue, 19 Jan 2038 04:14:07 GMT')
			});
			throw redirect(303, '/dashboard');
		}

		throw redirect(303, '/');
	}

	throw redirect(303, '/');
};
