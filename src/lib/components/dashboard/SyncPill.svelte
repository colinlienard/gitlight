<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { clearInterval, setInterval } from 'worker-timers';
	import { browser } from '$app/environment';
	import { Tooltip } from '$lib/components';
	import { ExclamationMarkIcon, RefreshIcon } from '$lib/icons';
	import { error } from '$lib/stores';

	export let synced: boolean;

	let syncTime = 0;
	let interval: ReturnType<typeof setInterval>;
	let noInternet = false;

	$: if (synced && !syncTime) {
		interval = setInterval(() => {
			syncTime += 1;
		}, 1000);
	} else if (!synced) {
		syncTime = 0;
		clearInterval(interval);
	}

	function handleOnline() {
		noInternet = false;
	}

	function handleOffline() {
		noInternet = true;
	}

	onMount(() => {
		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);
	});

	onDestroy(() => {
		clearInterval(interval);
		if (browser) {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		}
	});
</script>

{#if $error}
	{#if noInternet}
		<div class="sync-pill">
			<ExclamationMarkIcon />
			No internet
		</div>
	{:else}
		<Tooltip content={$error} hover position="bottom" width="20rem">
			<div class="sync-pill error">
				<ExclamationMarkIcon />
				An error occurred
			</div>
		</Tooltip>
	{/if}
{:else}
	<div class="sync-pill green" class:loading={!synced}>
		{#if synced}
			<RefreshIcon />
			Synced <span class="time">{syncTime}s ago</span>
		{:else}
			<RefreshIcon />
			Syncing...
		{/if}
	</div>
{/if}

<style lang="scss">
	.sync-pill {
		display: flex;
		align-items: center;
		padding: 0.25rem 0.5rem;
		border-radius: variables.$small-radius;
		margin: 0 1rem;
		background-color: variables.$bg-3;
		color: variables.$bg-5;
		gap: 0.25rem;

		&:not(:hover) .time {
			display: none;
		}

		&:hover {
			background-color: variables.$bg-4;
		}

		:global(svg) {
			height: 1.25rem;
		}

		&.green {
			:global(svg) {
				color: variables.$green;
			}
		}

		&.error {
			color: variables.$red;
		}

		&.loading {
			color: variables.$yellow;

			:global(svg) {
				animation: loading 1s linear infinite;
				color: inherit;

				@keyframes loading {
					0% {
						rotate: 0deg;
					}

					100% {
						rotate: 360deg;
					}
				}
			}
		}
	}
</style>
