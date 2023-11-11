<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { CheckIcon, CrossIcon } from '$lib/icons';

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
		<input
			class="input"
			type="checkbox"
			bind:checked={active}
			on:change={(event) => dispatch('change', event)}
		/>
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
		width: 2.25rem;
		flex: 0 0 2.25rem;
		padding: 2px;
		box-shadow: variables.$shadow;

		.icon-container {
			display: flex;
			width: 1.25rem;
			height: 1.25rem;
			align-items: center;
			justify-content: center;
			border-radius: 50%;
			box-shadow: variables.$shadow;
			transition: variables.$transition;

			:global(svg) {
				height: 0.75rem;
			}
		}

		&.active {
			@include mixins.shiny('primary', 9rem);

			.icon-container {
				background-color: white;
				translate: 0.75rem 0;

				:global(svg) {
					color: variables.$blue;
				}
			}
		}

		&:not(.active) {
			@include mixins.shiny('secondary', 9rem);

			.icon-container {
				@include themes.light {
					background-color: variables.$bg-4;

					:global(svg) {
						color: variables.$bg-6;
					}
				}

				@include themes.dark {
					background-color: variables.$bg-5;

					:global(svg) {
						color: variables.$bg-3;
					}
				}

				rotate: -90deg;
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
