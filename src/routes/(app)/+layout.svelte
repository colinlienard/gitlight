<script lang="ts">
	import { listen } from '@tauri-apps/api/event';
	import { onMount } from 'svelte';
	import { enable, isEnabled } from 'tauri-plugin-autostart-api';
	import { goto } from '$app/navigation';
	import { storage } from '$lib/features';

	let onTauriApp = false;

	onMount(async () => {
		if (window.__TAURI__) {
			onTauriApp = true;

			// Listen for scheme request on desktop app
			listen('scheme-request', ({ payload }) => {
				const searchParams = new URLSearchParams((payload as string).replace('gitlight://', ''));
				const githubAccessToken = searchParams.get('github_access_token');
				const gitlabAccessToken = searchParams.get('gitlab_access_token');
				const gitlabRefreshToken = searchParams.get('gitlab_refresh_token');
				const gitlabExpiresIn = searchParams.get('gitlab_expires_in');

				if (githubAccessToken) {
					storage.set('github-access-token', githubAccessToken.replace('/', ''));
				}
				if (gitlabAccessToken && gitlabRefreshToken && gitlabExpiresIn) {
					storage.set('gitlab-access-token', gitlabAccessToken.replace('/', ''));
					storage.set('gitlab-refresh-token', gitlabRefreshToken.replace('/', ''));
					storage.set('gitlab-expires-in', gitlabExpiresIn.replace('/', ''));
				}

				if (
					(githubAccessToken && storage.has('gitlab-user')) ||
					(gitlabAccessToken && storage.has('github-user'))
				) {
					window.location.reload();
				} else {
					goto('/dashboard');
				}
			});

			// Enable autostart
			if (!(await isEnabled())) {
				enable();
			}
		}
	});
</script>

<svelte:head>
	<meta name="description" content="GitHub and GitLab notifications on your desktop" />
</svelte:head>

{#if onTauriApp}
	<!-- Tauri draggable titlebar -->
	<div data-tauri-drag-region />
{/if}
<slot />

<style lang="scss">
	div[data-tauri-drag-region] {
		position: fixed;
		z-index: 9999;
		height: 28px;
		inset: 0 0 auto;
	}
</style>
