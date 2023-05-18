<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { sineInOut } from 'svelte/easing';
	import { Apple, Linux, Windows } from '~/lib/icons';
	import { Button } from '~/lib/components';

	type Releases = {
		assets: Array<{
			name: string;
			browser_download_url: string;
		}>;
	}[];

	type OS = 'mac' | 'win' | 'linux';

	export let show = true;
	export let position: 'center' | 'bottom' = 'center';

	let open = false;
	let releases: Record<OS, string> = { mac: '', win: '', linux: '' };

	onMount(async () => {
		const response = await fetch('https://api.github.com/repos/colinlienard/gitlight/releases');
		const data = (await response.json()) as Releases;
		const { assets } = data[0];
		releases = {
			mac: assets.find(({ name }) => name.endsWith('.dmg'))?.browser_download_url as string,
			win: assets.find(({ name }) => name.endsWith('.msi'))?.browser_download_url as string,
			linux: assets.find(({ name }) => name.endsWith('.deb'))?.browser_download_url as string
		};
	});

	function handleDownload(os: OS) {
		return () => {
			open = false;
			const link = document.createElement('a');
			link.href = releases[os];
			link.click();
		};
	}
</script>

<button class="container" on:click={() => (open = !open)} on:mouseleave={() => (open = false)}>
	<slot />
	{#if show && open}
		<div class="tooltip {position}" transition:fade={{ duration: 150, easing: sineInOut }}>
			<Button on:click={handleDownload('mac')}>
				<Apple />
				Download for Mac
			</Button>
			<Button on:click={handleDownload('win')}>
				<Windows />
				Download for Windows
			</Button>
			<Button on:click={handleDownload('linux')}>
				<Linux />
				Download for Linux
			</Button>
		</div>
	{/if}
</button>

<style lang="scss">
	.container {
		position: relative;
		z-index: 1;
	}

	.tooltip {
		@include mixins.shadow;
		background-color: variables.$grey-1;
		padding: 0.5rem;
		border: 1px solid variables.$grey-3;
		border-radius: variables.$radius;
		white-space: nowrap;
		position: absolute;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		width: max-content;

		&::before {
			content: '';
			position: absolute;
			inset: -0.5rem;
		}

		&.bottom {
			top: calc(100% + 0.25rem);
			translate: -50% 0;
		}
	}
</style>
