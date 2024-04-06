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
				redirect_uri: `${origin}/auth/gitlab/callback${
					searchParams.has('from_app') ? '?from_app=true' : ''
				}`,
				grant_type: 'authorization_code',
				code
			})
		});

		if (response.ok) {
			const { access_token, refresh_token, expires_in, created_at } = await response.json();
			const params = new URLSearchParams();
			params.append('gitlab_access_token', access_token);
			params.append('gitlab_refresh_token', refresh_token);
			params.append('gitlab_expires_in', `${(created_at + expires_in) * 1000}`);
			if (searchParams.has('from_app')) {
				redirect(302, `/deeplink?${params.toString()}`);
			}
			redirect(302, `/dashboard?${params.toString()}`);
		}

		redirect(302, '/');
	}

	redirect(302, '/');
}
