import { redirect } from '@sveltejs/kit';
import { AUTH_SECRET, AUTH_GITHUB_ID, AUTH_GITHUB_SECRET } from '$env/static/private';

export async function GET({ url }) {
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
				client_id: AUTH_GITHUB_ID,
				client_secret: AUTH_GITHUB_SECRET,
				redirect_uri: `${origin}/auth/github/callback`,
				code
			})
		});

		if (response.ok) {
			const { access_token } = await response.json();
			const url = `/dashboard?access_token=${access_token}`;
			if (searchParams.has('from_app')) {
				throw redirect(302, `${url}&from_app=true`);
			}
			throw redirect(302, url);
		}

		throw redirect(302, '/');
	}

	throw redirect(302, '/');
}
