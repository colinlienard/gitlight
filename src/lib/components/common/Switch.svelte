<script lang="ts">
	import { Check, Cross } from '~/lib/icons';

	export let label: string | undefined;
	export let active: boolean;
</script>

<label class="switch-container">
	<span class="switch" class:active>
		<input class="input" type="checkbox" bind:checked={active} />
		<div class="icon-container">
			{#if active}
				<Check />
			{:else}
				<Cross />
			{/if}
		</div>
	</span>
	<p class="label">{label}</p>
</label>

<style lang="scss">
	.switch-container {
		display: flex;
		align-items: center;
		gap: 0.75em;
		width: fit-content;
		cursor: pointer;
	}

	.input {
		display: none;
	}

	.switch {
		@include mixins.shadow;
		width: 2.25rem;
		padding: 2px;

		.icon-container {
			@include mixins.shadow;
			width: 1.25rem;
			height: 1.25rem;
			border-radius: 50%;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: variables.$transition;

			:global(svg) {
				height: 0.75rem;
			}
		}

		&.active {
			@include mixins.shiny(variables.$blue-2, 9rem);

			.icon-container {
				background-color: variables.$white;
				translate: 0.75rem 0;

				:global(svg) {
					color: variables.$blue-2;
				}
			}
		}

		&:not(.active) {
			@include mixins.shiny(variables.$grey-3, 9rem);

			.icon-container {
				background-color: variables.$grey-4;
				rotate: -90deg;

				:global(svg) {
					color: variables.$grey-3;
				}
			}
		}
	}
</style>
