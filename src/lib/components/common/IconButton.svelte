<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let large = false;

	const dispatch = createEventDispatcher();
</script>

<button class="button" class:large on:click={(event) => dispatch('click', event)}>
	<slot />
</button>

<style lang="scss">
	.button {
		padding: 0.5rem;
		border-radius: variables.$radius;
		transition: background-color variables.$transition;

		&:hover {
			background-color: rgba(variables.$white, 0.03);
		}

		&:active {
			background-color: rgba(variables.$white, 0.06);
		}

		:global(svg) {
			height: 1rem;
		}

		&.large :global(svg) {
			height: 1.25rem;
		}
	}
</style>
