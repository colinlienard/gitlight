<script lang="ts">
	import { listen, type UnlistenFn } from '@tauri-apps/api/event';
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { NotificationList, ScrollbarContainer } from '~/lib/components';
	import type { NotificationData } from '~/lib/types';

	let notifications: NotificationData[] = [];
	let unlisten: UnlistenFn = () => null;

	$: isTrayApp = browser && window.__TAURI__ && window.location.pathname === '/tray';

	onMount(async () => {
		if (isTrayApp) {
			unlisten = await listen<{ notifications: NotificationData[] }>('notification', (event) => {
				notifications = event.payload.notifications;
			});
		}
	});

	onDestroy(() => {
		if (isTrayApp) {
			unlisten();
		}
	});
</script>

<main class="main">
	<ScrollbarContainer margin="0.25rem">
		<NotificationList {notifications} />
	</ScrollbarContainer>
</main>

<style lang="scss">
	.main {
		height: 100vh;
		padding: 2rem 0 0;
	}
</style>
