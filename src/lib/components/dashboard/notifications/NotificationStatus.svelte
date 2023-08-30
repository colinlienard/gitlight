<script lang="ts">
	import { onDestroy } from 'svelte';
	import { settings } from '~/lib/stores';
	import { formatRelativeDate } from '$lib/helpers';
	import { PinIcon } from '$lib/icons';
	import type { NotificationData } from '$lib/types';

	export let data: NotificationData;

	let { time, pinned, unread } = data;
	let displayTime = formatRelativeDate(time);

	const interval = setInterval(() => {
		displayTime = formatRelativeDate(time);
	}, 60000);

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="status">
	<p class="time">{displayTime}</p>
	{#if $settings.viewMode === 'List'}
		{#if pinned}
			<span class="pinned">
				<PinIcon />
			</span>
		{/if}
		{#if unread}
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

			color: variables.$grey-4;
		}

		.pinned {
			flex: 0 0 1.25rem;
			color: variables.$yellow;

			:global(svg) {
				height: 1.25rem;
			}
		}

		.unread {
			width: 0.75rem;
			height: 0.75rem;
			flex: 0 0 0.75rem;
			border-radius: 50%;
			background-color: variables.$blue-2;
		}
	}
</style>
