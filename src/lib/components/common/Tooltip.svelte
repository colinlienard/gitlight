<script lang="ts">
	import { fade } from 'svelte/transition';
	import { sineInOut } from 'svelte/easing';

	export let content: string;
	export let position: 'top' | 'bottom' | 'left' | 'right' = 'top';
	export let instant = false;

	let visible = false;
	let timeout: ReturnType<typeof setTimeout>;

	function handleMouseEnter() {
		if (instant) {
			visible = true;
			return;
		}
		timeout = setTimeout(() => {
			visible = true;
		}, 500);
	}

	function handleMouseLeave() {
		visible = false;
		if (timeout) {
			clearTimeout(timeout);
		}
	}
</script>

<span class="tooltip-trigger" on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}>
	{#if visible}
		<div class="tooltip {position}" transition:fade={{ duration: 150, easing: sineInOut }}>
			{content}
		</div>
	{/if}
	<slot />
</span>

<style lang="scss">
	.tooltip-trigger {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tooltip {
		@include mixins.shadow;
		background-color: variables.$grey-1;
		padding: 0.5rem;
		border: 1px solid variables.$grey-3;
		border-radius: variables.$radius;
		white-space: nowrap;
		position: absolute;

		&.top {
			bottom: calc(100% + 0.25rem);
			left: 50%;
			translate: -50% 0;
		}

		&.bottom {
			top: calc(100% + 0.25rem);
			left: 50%;
			translate: -50% 0;
		}

		&.left {
			top: 50%;
			right: calc(100% + 0.25rem);
			translate: 0 -50%;
		}

		&.right {
			top: 50%;
			left: calc(100% + 0.25rem);
			translate: 0 -50%;
		}
	}
</style>
