<script lang="ts">
	import { sineInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { Button } from '$lib/components';
	import { LinuxIcon, MacosIcon, WindowsIcon } from '$lib/icons';

	export let show = true;
	export let position: 'center' | 'bottom' = 'center';

	let open = false;
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
			<Button href="http://localhost:5173/download/windows" external>
				<WindowsIcon />
				Download for Windows
			</Button>
			<Button href="http://localhost:5173/download/apple-silicon" external>
				<MacosIcon />
				Download for Apple Silicon
			</Button>
			<Button href="http://localhost:5173/download/mac-intel" external>
				<MacosIcon />
				Download for Mac Intel
			</Button>
			<Button href="http://localhost:5173/download/linux" external>
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
