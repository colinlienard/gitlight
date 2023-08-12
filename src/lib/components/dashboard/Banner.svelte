<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { openDesktopApp } from '~/lib/helpers';
	import { CrossIcon, ExclamationMarkIcon } from '~/lib/icons';
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
		const githubAccessToken = $page.data.session?.githubAccessToken;
		const gitlabAccessToken = $page.data.session?.gitlabAccessToken;
		if (githubAccessToken || gitlabAccessToken) {
			setTimeout(() => {
				if (hasFocus) {
					canDownload = true;
				}
			}, 500);

			// Open the app with the access token
			openDesktopApp({ githubAccessToken, gitlabAccessToken });
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
			<button class="content" on:click={handleClick}>
				<ExclamationMarkIcon />
				Download or open the desktop app
			</button>
			<button class="close" on:click={handleClose}>
				<CrossIcon />
			</button>
		</div>
	</DownloadButton>
{/if}

<style lang="scss">
	.banner {
		position: relative;
		z-index: 1;
		overflow: hidden;
		height: 2.5rem;
		border-bottom: 1px solid variables.$grey-3;
		background-color: variables.$grey-1;
		transition: background-color variables.$transition;

		&:hover {
			background-color: variables.$grey-2;
		}

		.content {
			@include typography.bold;

			position: absolute;
			display: flex;
			width: 100%;
			height: 2.5rem;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;
			inset: 0;

			:global(svg) {
				height: 1.25rem;
			}
		}

		.close {
			position: absolute;
			padding: 0 0.5rem;
			inset: 0 0 0 auto;
			transition: color variables.$transition;

			&:not(:hover) {
				color: variables.$grey-4;
			}

			:global(svg) {
				height: 1rem;
			}
		}
	}
</style>
