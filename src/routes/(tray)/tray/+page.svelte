<script lang="ts">
	import { listen, type UnlistenFn } from '@tauri-apps/api/event';
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { NotificationList, ScrollbarContainer } from '~/lib/components';
	import { loading } from '~/lib/stores';
	import type { NotificationData } from '~/lib/types';

	let notifications: NotificationData[] = [];
	let unlistenNotification: UnlistenFn = () => null;
	let unlistenLoading: UnlistenFn = () => null;

	$: isTrayApp = browser && window.__TAURI__ && window.location.pathname === '/tray';

	onMount(async () => {
		if (isTrayApp) {
			unlistenNotification = await listen<{ notifications: NotificationData[] }>(
				'notifications',
				(event) => {
					notifications = event.payload.notifications;
				}
			);
			unlistenLoading = await listen<{ loading: boolean }>('loading', (event) => {
				$loading = event.payload.loading;
			});
		}
	});

	onDestroy(() => {
		if (isTrayApp) {
			unlistenNotification();
			unlistenLoading();
		}
	});
</script>

<main class="main">
	<ScrollbarContainer margin="2rem 1rem">
		<NotificationList {notifications} scrollShadow={false} />
	</ScrollbarContainer>
</main>

<style lang="scss">
	:global(html) {
		font-size: 15px;
	}

	.main {
		height: 100vh;
	}
</style>
