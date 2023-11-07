import { AUTH_GITLAB_ID, AUTH_GITLAB_SECRET } from '$env/static/private';
import { PUBLIC_SITE_URL } from '$env/static/public';

const headers = {
	'Access-Control-Allow-Origin': '*'
};

export async function GET({ url }) {
	const { searchParams } = url;

	if (!searchParams.has('refresh_token')) {
		return new Response('refresh_token not found', { status: 400, headers });
	}

	try {
		const response = await fetch('https://gitlab.com/oauth/token', {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				client_id: AUTH_GITLAB_ID,
				client_secret: AUTH_GITLAB_SECRET,
				refresh_token: searchParams.get('refresh_token'),
				redirect_uri: `${PUBLIC_SITE_URL}/auth/gitlab/callback`,
				grant_type: 'refresh_token'
			})
		});

		if (response.ok) {
			const data = await response.json();
			return new Response(JSON.stringify(data), { status: 200, headers });
		}

		return new Response(response.statusText, { status: response.status, headers });
	} catch (error) {
		return new Response(JSON.stringify({ error }), { status: 500, headers });
	}
}
