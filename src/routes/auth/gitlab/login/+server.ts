import { redirect } from '@sveltejs/kit';
import { AUTH_SECRET, AUTH_GITLAB_ID } from '$env/static/private';

export async function GET({ url }) {
	const gitlabLoginUrl = new URL('https://gitlab.com/oauth/authorize');
	gitlabLoginUrl.searchParams.set('scope', 'read_api read_user');
	gitlabLoginUrl.searchParams.set('client_id', AUTH_GITLAB_ID);
	gitlabLoginUrl.searchParams.set(
		'redirect_uri',
		`${url.origin}/auth/gitlab/callback${url.search}`
	);
	gitlabLoginUrl.searchParams.set('state', AUTH_SECRET);
	gitlabLoginUrl.searchParams.set('response_type', 'code');
	throw redirect(302, gitlabLoginUrl.toString());
}
