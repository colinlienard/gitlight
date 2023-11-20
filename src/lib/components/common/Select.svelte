<script lang="ts">
	import { SmallArrowIcon } from '$lib/icons';
	import Tooltip from './Tooltip.svelte';

	export let label: string | undefined = undefined;
	export let value: string | null;
	export let options: { text: string; value: string }[];
	export let placeholder: string;
	export let position: 'top' | 'bottom' = 'bottom';
	export let disabled = false;

	export let open = false;

	$: tooltipOptions = options.map((option) => ({
		text: option.text,
		onClick() {
			value = option.value;
			open = false;
		}
	}));

	$: displayValue = options.find((option) => option.value === value)?.text;
</script>

<div class="container" class:disabled>
	{#if label}
		<p class="label">{label}</p>
	{/if}
	<Tooltip content={tooltipOptions} width="100%" {position} bind:open>
		<button class="input" class:empty={!value} class:focused={false} type="button">
			{#if value}
				{displayValue}
			{:else}
				{placeholder}
			{/if}
			<SmallArrowIcon />
		</button>
	</Tooltip>
</div>

<style lang="scss">
	.container {
		display: flex;
		width: 100%;
		flex: 1;
		flex-direction: column;
		gap: 0.5rem;

		&.disabled {
			opacity: 0.5;

			* {
				cursor: not-allowed !important;
			}
		}
	}

	.input {
		@include mixins.box(true);

		position: relative;
		display: flex;
		width: 100%;
		align-items: center;
		justify-content: space-between;
		padding: 0.75em 1em;
		border-radius: 0.5rem;
		gap: 0.5em;
		outline: solid 3px transparent;
		outline-offset: -3px;
		transition: outline variables.$transition;

		&.empty {
			color: variables.$bg-5;
		}

		&:focus {
			outline-color: variables.$light-blue;

			:global(svg) {
				rotate: -180deg;
			}
		}

		:global(svg) {
			height: 1.25rem;
			color: variables.$bg-5;
			transition: rotate 0.4s ease-in-out;
		}
	}
</style>
