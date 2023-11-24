import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { checkGitlabToken, fetchGithub, fetchGitlab, storage } from '$lib/features';
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
	let gitlabExpiresIn = storage.get('gitlab-expires-in');

	const githubTokenParam = url.searchParams.get('github_access_token');
	const gitlabTokenParam = url.searchParams.get('gitlab_access_token');
	const gitlabRefreshTokenParam = url.searchParams.get('gitlab_refresh_token');
	const gitlabExpiresInParam = url.searchParams.get('gitlab_expires_in');

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
	if (gitlabExpiresInParam) {
		gitlabExpiresIn = gitlabExpiresInParam;
		storage.set('gitlab-expires-in', gitlabExpiresIn);
	}

	// If the GitLab access token has expired, refresh it
	if (gitlabAccessToken && gitlabRefreshToken && gitlabExpiresIn) {
		try {
			await checkGitlabToken();
		} catch {
			// If this fail, logout
			storage.remove(`gitlab-user`);
			storage.remove(`gitlab-access-token`);
			storage.remove(`gitlab-refresh-token`);
			storage.remove(`gitlab-expires-in`);

			if (storage.has('github-user')) {
				window.location.reload();
			} else {
				goto('/login');
			}
		}
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
	const protectedRoute = ['/dashboard', '/deeplink'].includes(url.pathname);
	if (protectedRoute && !session) {
		throw redirect(302, '/login');
	} else if (!protectedRoute && session) {
		throw redirect(302, '/dashboard');
	}

	return { session };
}
