import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { checkGitlabToken, fetchGithub, fetchGitlab, storage } from '$lib/features';
import { openDesktopApp } from '$lib/helpers';
import type { GithubUser, GitlabUser } from '$lib/types';

import '~/styles/_reset.scss';
import '~/styles/_base.scss';
import '~/styles/_fonts.scss';
import 'overlayscrollbars/overlayscrollbars.css';

export const prerender = true;
export const ssr = true;

export async function load({ url }) {
	if (!browser || url.pathname === '/tray') return;

	let githubUser = storage.get('github-user');
	let githubAccessToken = storage.get('github-access-token');
	let gitlabUser = storage.get('gitlab-user');
	let gitlabAccessToken = storage.get('gitlab-access-token');
	let gitlabRefreshToken = storage.get('gitlab-refresh-token');
	let gitlabExpiration = storage.get('gitlab-expiration');

	const githubTokenParam = url.searchParams.get('github_access_token');
	const gitlabTokenParam = url.searchParams.get('gitlab_access_token');
	const gitlabRefreshTokenParam = url.searchParams.get('gitlab_refresh_token');
	const gitlabExpirationParam = url.searchParams.get('gitlab_expiration');

	// Get GitHub access token
	if (githubTokenParam) {
		githubAccessToken = githubTokenParam;
		storage.set('github-access-token', githubAccessToken);
	}

	// Get GitLab access token
	if (gitlabTokenParam) {
		gitlabAccessToken = gitlabTokenParam;
		storage.set('gitlab-access-token', gitlabAccessToken);
	}

	// Get GitLab refresh token
	if (gitlabRefreshTokenParam) {
		gitlabRefreshToken = gitlabRefreshTokenParam;
		storage.set('gitlab-refresh-token', gitlabRefreshToken);
	}

	// Get GitLab expiration
	if (gitlabExpirationParam) {
		gitlabExpiration = gitlabExpirationParam;
		storage.set('gitlab-expiration', gitlabExpiration);
	}

	// If the GitLab access token has expired, refresh it
	await checkGitlabToken();

	// Open the app with the access token
	if (
		url.searchParams.has('from_app') &&
		(githubAccessToken || (gitlabAccessToken && gitlabRefreshToken && gitlabExpiration))
	) {
		openDesktopApp({ githubAccessToken, gitlabAccessToken, gitlabRefreshToken, gitlabExpiration });
	}

	// Remove access tokens from the URL
	if (githubTokenParam || gitlabTokenParam) {
		history.replaceState({}, '', '/dashboard');
	}

	// Set GitHub user data
	if (!githubUser && githubAccessToken) {
		try {
			const { name, login, avatar_url } = await fetchGithub<GithubUser>('user', {
				accessToken: githubAccessToken
			});
			githubUser = { name, login, avatar: avatar_url };
			storage.set('github-user', githubUser);
		} catch {
			//
		}
	}

	// Set GitLab user data
	if (!gitlabUser && gitlabAccessToken) {
		try {
			const { name, username, avatar_url } = await fetchGitlab<GitlabUser>('user', {
				accessToken: gitlabAccessToken
			});
			gitlabUser = { name, login: username, avatar: avatar_url };
			storage.set('gitlab-user', gitlabUser);
		} catch {
			//
		}
	}

	const session =
		(githubUser && githubAccessToken) || (gitlabUser && gitlabAccessToken)
			? { githubUser, githubAccessToken, gitlabUser, gitlabAccessToken }
			: null;

	// Handle redirects
	if (url.pathname === '/dashboard' && !session) {
		throw redirect(302, '/login');
	} else if (url.pathname !== '/dashboard' && session) {
		throw redirect(302, '/dashboard');
	}

	return { session };
}
