<script lang="ts">
	import { onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { formatRelativeDate } from '$lib/helpers';
	import { PinIcon } from '$lib/icons';
	import { settings } from '$lib/stores';
	import type { NotificationData } from '$lib/types';

	export let data: NotificationData;

	let { time, status } = data;
	let displayTime = formatRelativeDate(time);

	$: isTrayApp = browser && window.__TAURI__ && window.location.pathname === '/tray';

	const interval = setInterval(() => {
		displayTime = formatRelativeDate(time);
	}, 60000);

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="status">
	<p class="time">{displayTime}</p>
	{#if $settings.viewMode === 'List' || isTrayApp}
		{#if status === 'pinned'}
			<span class="pinned">
				<PinIcon />
			</span>
		{:else if status === 'unread'}
			<div class="unread" />
		{/if}
	{/if}
</div>

<style lang="scss">
	.status {
		display: flex;
		flex: 0 0 auto;
		align-items: center;
		gap: 0.25rem;

		.time {
			@include typography.small;

			color: variables.$bg-5;
		}

		.pinned {
			flex: 0 0 1rem;
			color: variables.$yellow;

			:global(svg) {
				height: 1rem;
				scale: 1.2;
				translate: 0.05rem 0.05rem;
			}
		}

		.unread {
			width: 0.75rem;
			height: 0.75rem;
			flex: 0 0 0.75rem;
			border-radius: 50%;
			background-color: variables.$blue;
		}
	}
</style>
