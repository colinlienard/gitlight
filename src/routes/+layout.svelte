<script lang="ts">
	import { onMount } from 'svelte';
	import { listen } from '@tauri-apps/api/event';
	import { goto } from '$app/navigation';

	onMount(() => {
		// Listen for scheme request on desktop app
		if (window.__TAURI__) {
			listen('scheme-request', ({ payload }) => {
				const accessToken = (payload as string).split('=')[1];
				if (accessToken) {
					localStorage.setItem('access_token', accessToken);
					goto('/dashboard');
				}
			});
		}
	});
</script>

<slot />
