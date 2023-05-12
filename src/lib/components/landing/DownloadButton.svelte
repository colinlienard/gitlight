<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { sineInOut } from 'svelte/easing';
	import { Apple, ArrowRight, Linux, Windows } from '~/lib/icons';
	import { Button, Tooltip } from '~/lib/components';

	type Releases = {
		assets: Array<{
			name: string;
			browser_download_url: string;
		}>;
	}[];

	type OS = 'mac' | 'win' | 'linux';

	let open = false;
	let releases: Record<OS, string> = { mac: '', win: '', linux: '' };

	onMount(async () => {
		const response = await fetch('https://api.github.com/repos/ColinLienard/gitlight/releases');
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
			window.open(releases[os], '_blank');
		};
	}
</script>

<div class="container" on:mouseleave={() => (open = false)}>
	<Button on:click={() => (open = !open)}>
		<ArrowRight />
		Download the app
	</Button>
	{#if open}
		<div class="tooltip" transition:fade={{ duration: 150, easing: sineInOut }}>
			<Tooltip content="Download for Mac">
				<Button type="secondary" small on:click={handleDownload('mac')}><Apple /></Button>
			</Tooltip>
			<Tooltip content="Download for Windows">
				<Button type="secondary" small on:click={handleDownload('win')}><Windows /></Button>
			</Tooltip>
			<Tooltip content="Download for Linux">
				<Button type="secondary" small on:click={handleDownload('linux')}><Linux /></Button>
			</Tooltip>
		</div>
	{/if}
</div>

<style lang="scss">
	.container {
		position: relative;
	}

	.tooltip {
		@include mixins.shadow;
		background-color: variables.$grey-1;
		padding: 0.5rem;
		border: 1px solid variables.$grey-3;
		border-radius: variables.$radius;
		white-space: nowrap;
		position: absolute;
		top: calc(100% + 0.25rem);
		left: 50%;
		translate: -50% 0;
		display: flex;
		gap: 0.5rem;
		width: max-content;

		&::before {
			content: '';
			position: absolute;
			inset: -0.5rem;
		}
	}
</style>
