<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { CheckIcon, CrossIcon } from '~/lib/icons';

	export let label: string | undefined;
	export let active: boolean;

	const dispatch = createEventDispatcher();

	function handleClick(event: MouseEvent) {
		if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
			event.preventDefault();
			dispatch('meta-click', event);
		}
	}
</script>

<label class="switch-container" on:click={handleClick} role="presentation">
	<span class="switch" class:active>
		<input class="input" type="checkbox" bind:checked={active} />
		<div class="icon-container">
			{#if active}
				<CheckIcon />
			{:else}
				<CrossIcon />
			{/if}
		</div>
	</span>
	<p class="label">{label}</p>
</label>

<style lang="scss">
	.switch-container {
		display: flex;
		overflow: hidden;
		width: fit-content;
		max-width: 100%;
		align-items: center;
		cursor: pointer;
		gap: 0.75em;
	}

	.input {
		display: none;
	}

	.switch {
		@include mixins.shadow;

		width: 2.25rem;
		flex: 0 0 2.25rem;
		padding: 2px;

		.icon-container {
			@include mixins.shadow;

			display: flex;
			width: 1.25rem;
			height: 1.25rem;
			align-items: center;
			justify-content: center;
			border-radius: 50%;
			transition: variables.$transition;

			:global(svg) {
				height: 0.75rem;
			}
		}

		&.active {
			@include mixins.shiny(variables.$blue-2, true, 9rem);

			.icon-container {
				background-color: variables.$white;
				translate: 0.65rem 0;

				:global(svg) {
					color: variables.$blue-2;
				}
			}
		}

		&:not(.active) {
			@include mixins.shiny(variables.$grey-3, true, 9rem);

			.icon-container {
				background-color: variables.$grey-4;
				rotate: -90deg;

				:global(svg) {
					color: variables.$grey-3;
				}
			}
		}
	}

	.label {
		@include typography.base;

		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
