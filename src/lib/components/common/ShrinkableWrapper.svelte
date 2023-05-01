<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { SmallArrow } from '~/lib/icons';

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
	<div class="header" class:shrinked>
		<button on:click={() => (shrinked = !shrinked)}>
			<SmallArrow />
		</button>
		<slot name="header" />
	</div>
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
		padding-left: 1.5rem;
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
	}
</style>
