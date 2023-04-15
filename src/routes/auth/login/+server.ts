import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AUTH_SECRET, AUTH_GITHUB_ID } from '$env/static/private';

export const GET = (async ({ url }) => {
	const githubLoginUrl = new URL('https://github.com/login/oauth/authorize');
	githubLoginUrl.searchParams.set('scope', 'repo');
	githubLoginUrl.searchParams.set('client_id', AUTH_GITHUB_ID);
	githubLoginUrl.searchParams.set('redirect_uri', `${url.origin}/auth/callback`);
	githubLoginUrl.searchParams.set('state', AUTH_SECRET);
	throw redirect(303, githubLoginUrl.toString());
}) satisfies RequestHandler;
