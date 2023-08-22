<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { SmallArrowIcon } from '$lib/icons';

	export let shrinked = false;

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
		<button class="arrow-button" on:click={() => (shrinked = !shrinked)} type="button">
			<SmallArrowIcon />
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
		padding-left: 1.5rem;
		gap: 0.5rem;
	}

	.header {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 0.25rem;
		transition: margin variables.$transition;

		&.shrinked :global(svg) {
			rotate: -90deg;
		}

		&:not(.shrinked) {
			margin-bottom: 0.5rem;
		}

		.arrow-button {
			flex: 0 0 1.25rem;

			:global(svg) {
				height: 1.25rem;
				transition: rotate variables.$transition;
			}
		}
	}
</style>
