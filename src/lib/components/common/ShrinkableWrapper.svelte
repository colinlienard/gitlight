<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { SmallArrow } from '~/lib/icons';

	export let title: string;

	let shrinked = false;

	function shrink(node: HTMLElement) {
		const { scrollHeight } = node;
		return {
			delay: 0,
			duration: 150,
			css: (t: number) => {
				const eased = cubicInOut(t);
				return `
          height: ${eased * scrollHeight}px;
          opacity: ${eased};
          overflow: hidden;
        `;
			}
		};
	}
</script>

<div class="wrapper">
	<button class="header" class:shrinked on:click={() => (shrinked = !shrinked)}>
		<SmallArrow />
		<p class="title">{title}</p>
	</button>
	{#if !shrinked}
		<div class="content" transition:shrink>
			<slot />
		</div>
	{/if}
</div>

<style lang="scss">
	.wrapper,
	.content {
		display: flex;
		flex-direction: column;
	}

	.content {
		gap: 1rem;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		width: fit-content;
		transition: margin variables.$transition;

		&.shrinked :global(svg) {
			rotate: -90deg;
		}

		&:not(.shrinked) {
			margin-bottom: 1rem;
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
