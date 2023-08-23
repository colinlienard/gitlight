<script lang="ts">
	import { onMount } from 'svelte';
	import { sineInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { Button } from '$lib/components';
	import { LinuxIcon, MacosIcon, WindowsIcon } from '$lib/icons';
	import type { GithubRelease } from '$lib/types';

	type OS = 'appleSilicon' | 'macIntel' | 'windows' | 'linux';

	export let show = true;
	export let position: 'center' | 'bottom' = 'center';

	let open = false;
	let releases: Record<OS, string> = { appleSilicon: '', macIntel: '', windows: '', linux: '' };

	onMount(async () => {
		const response = await fetch('https://api.github.com/repos/colinlienard/gitlight/releases');
		const data = (await response.json()) as GithubRelease[];
		const { assets } = data[0];
		releases = {
			appleSilicon: assets.find(({ name }) => name.endsWith('aarch64.dmg'))
				?.browser_download_url as string,
			macIntel: assets.find(({ name }) => name.endsWith('x64.dmg'))?.browser_download_url as string,
			windows: assets.find(({ name }) => name.endsWith('.msi'))?.browser_download_url as string,
			linux: assets.find(({ name }) => name.endsWith('.AppImage'))?.browser_download_url as string
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

<div
	class="container"
	on:click={() => (open = !open)}
	on:mouseleave={() => (open = false)}
	role="presentation"
>
	<slot />
	{#if show && open}
		<div class="tooltip {position}" transition:fade={{ duration: 150, easing: sineInOut }}>
			<Button on:click={handleDownload('appleSilicon')}>
				<MacosIcon />
				Download for Apple Silicon
			</Button>
			<Button on:click={handleDownload('macIntel')}>
				<MacosIcon />
				Download for Mac Intel
			</Button>
			<Button on:click={handleDownload('windows')}>
				<WindowsIcon />
				Download for Windows
			</Button>
			<Button on:click={handleDownload('linux')}>
				<LinuxIcon />
				Download for Linux
			</Button>
		</div>
	{/if}
</div>

<style lang="scss">
	.container {
		position: relative;
		z-index: 99;
	}

	.tooltip {
		@include mixins.shadow;

		position: absolute;
		top: 50%;
		left: 50%;
		display: flex;
		width: max-content;
		flex-direction: column;
		padding: 0.5rem;
		border: 1px solid variables.$grey-3;
		border-radius: variables.$radius;
		background-color: variables.$grey-1;
		gap: 0.5rem;
		translate: -50% -50%;
		white-space: nowrap;

		&::before {
			position: absolute;
			content: '';
			inset: -0.5rem;
		}

		&.bottom {
			top: calc(100% + 0.25rem);
			translate: -50% 0;
		}
	}
</style>
