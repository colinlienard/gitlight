import { redirect } from '@sveltejs/kit';
import { browser } from '$app/environment';
import { fetchGithub, fetchGitlab, storage } from '~/lib/helpers';
import type { GithubUser, GitlabUser } from '~/lib/types';

import '~/styles/_reset.scss';
import '~/styles/_base.scss';
import '~/styles/_fonts.scss';
import 'overlayscrollbars/overlayscrollbars.css';

export const prerender = true;
export const ssr = true;

export async function load({ url }) {
	if (!browser) return;

	// Migrate old storage keys
	// TODO: Remove this in a future version
	if (localStorage.getItem('user')) {
		localStorage.setItem('github-user', localStorage.getItem('user') as string);
		localStorage.removeItem('user');
	}
	if (localStorage.getItem('access-token')) {
		localStorage.setItem('github-access-token', localStorage.getItem('access-token') as string);
		localStorage.removeItem('access-token');
	}
	// End migration

	let githubUser = storage.get('github-user');
	let githubAccessToken = storage.get('github-access-token');
	let gitlabUser = storage.get('gitlab-user');
	let gitlabAccessToken = storage.get('gitlab-access-token');

	// Get GitHub access token
	if (url.searchParams.has('github_access_token')) {
		githubAccessToken = url.searchParams.get('github_access_token') as string;
		storage.set('github-access-token', githubAccessToken);

		// Open the app with the access token
		if (url.searchParams.has('from_app')) {
			window.location.href = `gitlight://access_token=${githubAccessToken}`;
		}

		history.replaceState({}, '', '/dashboard');
	}

	// Get GitLab access token
	if (url.searchParams.has('gitlab_access_token')) {
		gitlabAccessToken = url.searchParams.get('gitlab_access_token') as string;
		storage.set('gitlab-access-token', gitlabAccessToken);

		// Open the app with the access token
		if (url.searchParams.has('from_app')) {
			window.location.href = `gitlight://access_token=${gitlabAccessToken}`;
		}

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
