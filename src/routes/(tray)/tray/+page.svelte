<script lang="ts">
	import { listen, type UnlistenFn } from '@tauri-apps/api/event';
	import { onDestroy, onMount, SvelteComponent } from 'svelte';
	import { browser } from '$app/environment';
	import { NotificationList, ScrollbarContainer } from '$lib/components';
	import { settings, theme } from '$lib/stores';
	import type { NotificationData, Settings } from '$lib/types';

	let notifications: NotificationData[] = [];
	let scrollContainer: SvelteComponent;
	let unlistenNotification: UnlistenFn = () => null;
	let unlistenSettings: UnlistenFn = () => null;
	let unlistenTheme: UnlistenFn = () => null;

	function scrollToTop() {
		setTimeout(() => {
			scrollContainer?.scrollTo({ top: 0 });
		}, 10);
	}

	onMount(async () => {
		if (window.__TAURI__) {
			window.addEventListener('blur', scrollToTop);

			const [a, b, c] = await Promise.all([
				listen<{ notifications: NotificationData[] }>('notifications', (event) => {
					notifications = event.payload.notifications;
				}),
				listen<{ settings: Settings }>('settings', (event) => {
					$settings = event.payload.settings;
				}),
				listen<{ theme: 'light' | 'dark' }>('theme', (event) => {
					$theme = event.payload.theme;
					document.documentElement.setAttribute('data-theme', $theme);
				})
			]);
			unlistenNotification = a;
			unlistenSettings = b;
			unlistenTheme = c;

			const baseTheme = document.documentElement.getAttribute('data-theme');
			if (baseTheme == 'light' || baseTheme == 'dark') {
				$theme = baseTheme;
			}
		}
	});

	onDestroy(() => {
		if (browser && window.__TAURI__) {
			window.removeEventListener('blur', scrollToTop);

			unlistenNotification();
			unlistenSettings();
			unlistenTheme();
		}
	});
</script>

<main class="main">
	<ScrollbarContainer margin="1rem 0.25rem" bind:this={scrollContainer}>
		<NotificationList {notifications} />
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
