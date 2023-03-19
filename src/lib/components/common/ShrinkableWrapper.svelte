<script lang="ts">
	import { onMount } from 'svelte';
	import { SmallArrow } from '~/lib/icons';

	export let title: string;

	let shrinked = false;
	let content: HTMLDivElement;
	let contentHeight: string = 'auto';

	onMount(() => {
		contentHeight = `${content.scrollHeight}px`;
	});
</script>

<div class="wrapper">
	<button class="header" class:shrinked on:click={() => (shrinked = !shrinked)}>
		<SmallArrow />
		<p class="title">{title}</p>
	</button>
	<div
		class="content"
		class:shrinked
		style:height={shrinked ? 0 : contentHeight}
		bind:this={content}
	>
		<slot />
	</div>
</div>

<style lang="scss">
	.wrapper,
	.content {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.content {
		overflow: hidden;
		transition: variables.$transition;

		&.shrinked {
			opacity: 0;
			translate: 0 -2rem;

			& > :global(svg) {
				rotate: -90deg;
			}
		}
	}

	.header {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		width: fit-content;

		&.shrinked :global(svg) {
			rotate: -90deg;
		}

		:global(svg) {
			height: 1.25rem;
			transition: rotate variables.$transition;
		}

		.title {
			@include typography.bold;
		}
	}
</style>
