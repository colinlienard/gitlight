<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let type: 'primary' | 'secondary' = 'primary';
	export let small = false;
	export let href: string | undefined = undefined;
	export let external: true | undefined = undefined;

	const dispatch = createEventDispatcher();

	function handleClick(event: MouseEvent) {
		dispatch('click', { event });
	}
</script>

{#if href}
	<a
		class="button {type}"
		class:small
		{href}
		target={external && '_blank'}
		rel={external && 'noreferrer'}
	>
		<span class="content">
			<slot />
		</span>
	</a>
{:else}
	<button class="button {type}" class:small on:click={handleClick}>
		<span class="content">
			<slot />
		</span>
	</button>
{/if}

<style lang="scss">
	.button {
		@include mixins.shiny(variables.$blue-2);
		@include mixins.shadow;

		&.secondary {
			@include mixins.shiny(variables.$grey-3);
		}

		&:not(.small) {
			@include typography.bold;
			padding: 0.75em 1em;
		}

		&.small {
			padding: 0.5rem;
		}

		.content {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;
			transition: scale 0.05s ease-in-out;

			:global(svg) {
				width: 1.25rem;
				height: 1.25rem;
			}
		}

		&:active .content {
			scale: 95%;
		}
	}
</style>
