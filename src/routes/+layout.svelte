<script lang="ts">
	import { onMount } from 'svelte';
	import { listen } from '@tauri-apps/api/event';
	import { goto } from '$app/navigation';
	import { storage } from '~/lib/helpers';

	let onTauriApp = false;

	onMount(() => {
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
		inset: 0 0 auto 0;
		height: 28px;
		z-index: 9999;
	}
</style>
