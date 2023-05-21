import { redirect } from '@sveltejs/kit';
import { AUTH_SECRET, AUTH_GITHUB_ID } from '$env/static/private';

export async function GET({ url }) {
	const githubLoginUrl = new URL('https://github.com/login/oauth/authorize');
	githubLoginUrl.searchParams.set('scope', 'repo notifications');
	githubLoginUrl.searchParams.set('client_id', AUTH_GITHUB_ID);
	githubLoginUrl.searchParams.set('redirect_uri', `${url.origin}/auth/callback${url.search}`);
	githubLoginUrl.searchParams.set('state', AUTH_SECRET);
	throw redirect(302, githubLoginUrl.toString());
}
