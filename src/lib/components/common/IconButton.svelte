<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let large = false;
	export let rounded = false;
	export let indicator = false;

	const dispatch = createEventDispatcher();
</script>

<button class="button" class:large class:rounded on:click={(event) => dispatch('click', event)}>
	<slot />
	{#if indicator}
		<div class="indicator" />
	{/if}
</button>

<style lang="scss">
	.button {
		position: relative;
		display: flex;
		width: 2rem;
		align-items: center;
		justify-content: center;
		border-radius: variables.$radius;
		aspect-ratio: 1 / 1;

		&:hover {
			background-color: rgba(variables.$white, 0.04);
		}

		&:active {
			background-color: rgba(variables.$white, 0.08);
		}

		:global(svg) {
			height: 1rem;
		}

		&.large :global(svg) {
			height: 1.25rem;
		}

		&.rounded {
			border-radius: 50%;
		}

		.indicator {
			position: absolute;
			width: 0.75rem;
			height: 0.75rem;
			border-radius: 50%;
			background-color: variables.$blue-2;
			inset: 0 auto auto 0;
		}
	}
</style>
