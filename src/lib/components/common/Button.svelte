<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let type: 'primary' | 'secondary' = 'primary';
	export let small = false;
	export let href: string | undefined = undefined;
	export let external: true | undefined = undefined;
	export let loading = false;

	const dispatch = createEventDispatcher();

	function handleClick(event: MouseEvent) {
		dispatch('click', { event });
	}
</script>

{#if href}
	<a
		class="button {type}"
		class:small
		class:loading
		{href}
		target={external && '_blank'}
		rel={external && 'noreferrer'}
	>
		<span class="content">
			<slot />
		</span>
	</a>
{:else}
	<button class="button {type}" class:small class:loading on:click={handleClick}>
		<span class="content">
			<slot />
		</span>
		{#if loading}
			<span class="spinner" />
		{/if}
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

		&.loading {
			opacity: 0.5;
			pointer-events: none;

			.content {
				opacity: 0;
			}
		}

		&:active .content {
			scale: 95%;
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

		.spinner {
			position: absolute;
			inset: 50%;
			width: 1.5rem;
			height: 1.5rem;
			border-top: 2px solid;
			border-left: 2px solid;
			border-radius: 50%;
			animation: spin 1s linear infinite;

			@keyframes spin {
				0% {
					transform: translate(-50%, -50%) rotate(0deg);
				}
				100% {
					transform: translate(-50%, -50%) rotate(360deg);
				}
			}
		}
	}
</style>
