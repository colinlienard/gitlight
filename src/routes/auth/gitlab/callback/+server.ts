import { redirect } from '@sveltejs/kit';
import { AUTH_SECRET, AUTH_GITLAB_ID, AUTH_GITLAB_SECRET } from '$env/static/private';

export async function GET({ url }) {
	const { searchParams, origin } = url;

	if (
		searchParams.has('code') &&
		searchParams.has('state') &&
		searchParams.get('state') === AUTH_SECRET
	) {
		const code = searchParams.get('code');
		const response = await fetch('https://gitlab.com/oauth/token', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				client_id: AUTH_GITLAB_ID,
				client_secret: AUTH_GITLAB_SECRET,
				redirect_uri: `${origin}/auth/gitlab/callback`,
				grant_type: 'authorization_code',
				code
			})
		});

		if (response.ok) {
			const { access_token } = await response.json();
			const url = `/dashboard?gitlab_access_token=${access_token}`;
			if (searchParams.has('from_app')) {
				throw redirect(302, `${url}&from_app=true`);
			}
			throw redirect(302, url);
		}

		throw redirect(302, '/');
	}

	throw redirect(302, '/');
}
