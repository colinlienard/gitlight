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
				let accessToken = (payload as string).split('=')[1];
				if (accessToken) {
					accessToken = accessToken.replace('/', '');
					storage.set('access-token', accessToken);
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
