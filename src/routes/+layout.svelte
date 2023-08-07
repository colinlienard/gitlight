<script lang="ts">
	import { listen } from '@tauri-apps/api/event';
	import { onMount } from 'svelte';
	import { enable, isEnabled } from 'tauri-plugin-autostart-api';
	import { goto } from '$app/navigation';
	import { storage } from '~/lib/helpers';

	let onTauriApp = false;

	onMount(async () => {
		if (window.__TAURI__) {
			onTauriApp = true;

			// Listen for scheme request on desktop app
			listen('scheme-request', ({ payload }) => {
				const scheme = (payload as string).split('&');

				let githubAccessToken = scheme[0].split('=')[1];
				if (githubAccessToken) {
					githubAccessToken = githubAccessToken.replace('/', '');
					storage.set('github-access-token', githubAccessToken);
				}

				let gitlabAccessToken = scheme[1].split('=')[1];
				if (gitlabAccessToken) {
					gitlabAccessToken = gitlabAccessToken.replace('/', '');
					storage.set('gitlab-access-token', gitlabAccessToken);
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
