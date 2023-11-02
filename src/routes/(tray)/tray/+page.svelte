<script lang="ts">
	import { listen, type UnlistenFn } from '@tauri-apps/api/event';
	import { onDestroy, onMount, SvelteComponent } from 'svelte';
	import { browser } from '$app/environment';
	import { NotificationList, ScrollbarContainer } from '$lib/components';
	import { loading, settings } from '$lib/stores';
	import type { NotificationData, Settings } from '$lib/types';

	let notifications: NotificationData[] = [];
	let scrollContainer: SvelteComponent;
	let unlistenNotification: UnlistenFn = () => null;
	let unlistenLoading: UnlistenFn = () => null;
	let unlistenSettings: UnlistenFn = () => null;

	$: isTrayApp = browser && window.__TAURI__ && window.location.pathname === '/tray';

	function scrollToTop() {
		setTimeout(() => {
			scrollContainer?.scrollTo({ top: 0 });
		}, 10);
	}

	onMount(async () => {
		if (isTrayApp) {
			window.addEventListener('blur', scrollToTop);

			const [a, b, c] = await Promise.all([
				listen<{ notifications: NotificationData[] }>('notifications', (event) => {
					notifications = event.payload.notifications;
				}),
				listen<{ loading: boolean }>('loading', (event) => {
					$loading = event.payload.loading;
				}),
				listen<{ settings: Settings }>('settings', (event) => {
					$settings = event.payload.settings;
				})
			]);
			unlistenNotification = a;
			unlistenLoading = b;
			unlistenSettings = c;
		}
	});

	onDestroy(() => {
		if (isTrayApp) {
			window.removeEventListener('blur', scrollToTop);

			unlistenNotification();
			unlistenLoading();
			unlistenSettings();
		}
	});
</script>

<main class="main">
	<ScrollbarContainer margin="2rem 1rem" bind:this={scrollContainer}>
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
