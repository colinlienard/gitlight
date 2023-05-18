<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { page } from '$app/stores';
	import { Cross } from '~/lib/icons';
	import { browser } from '$app/environment';
	import { DownloadButton } from '../landing';

	let show = false;
	let hasFocus = true;
	let canDownload = false;

	function slide(_: HTMLElement) {
		return {
			delay: 0,
			duration: 300,
			css: (t: number) => `height: ${cubicInOut(t) * 2.5}rem`
		};
	}

	function handleClick() {
		const accessToken = $page.data.session?.accessToken;
		if (accessToken) {
			setTimeout(() => {
				if (hasFocus) {
					canDownload = true;
				}
			}, 500);

			// Open the app with the access token
			window.location.href = `gitlight://access_token=${accessToken}`;
		}
	}

	function handleClose() {
		canDownload = false;
		show = false;
	}

	function handleFocus() {
		hasFocus = true;
	}

	function handleBlur() {
		hasFocus = false;
	}

	onMount(() => {
		show = !window.__TAURI__;

		window.addEventListener('focus', handleFocus);
		window.addEventListener('blur', handleBlur);
	});

	onDestroy(() => {
		if (!browser) return;
		window.removeEventListener('focus', handleFocus);
		window.removeEventListener('blur', handleBlur);
	});
</script>

{#if show}
	<DownloadButton show={canDownload} position="bottom">
		<div class="banner" transition:slide>
			<button class="content" on:click={handleClick}>✨ Download or open the desktop app</button>
			<button class="close" on:click={handleClose}>
				<Cross />
			</button>
		</div>
	</DownloadButton>
{/if}

<style lang="scss">
	.banner {
		position: relative;
		height: 2.5rem;
		background-color: variables.$blue-2;
		box-shadow: 0 0 1rem variables.$blue-2;
		overflow: hidden;
		transition: filter variables.$transition;

		&:hover {
			filter: brightness(130%);
		}

		.content {
			@include typography.bold;
			position: absolute;
			inset: 0;
			width: 100%;
			height: 2.5rem;
		}

		.close {
			position: absolute;
			inset: 0 0 0 auto;
			padding: 0 0.5rem;

			:global(svg) {
				height: 1.25rem;
			}
		}
	}
</style>
