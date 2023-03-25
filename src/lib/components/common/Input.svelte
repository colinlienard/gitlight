<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { Cross } from '~/lib/icons';

	export let label: string | undefined = undefined;
	export let icon: ComponentType | undefined = undefined;
	export let value: string;
	export let placeholder: string;
	export let clearable = false;

	let input: HTMLInputElement;

	export function focus() {
		input.focus();
	}
</script>

<label class="container">
	{#if label}
		<p class="label">{label}</p>
	{/if}
	<div class="input-wrapper" class:empty={!value}>
		{#if icon}
			<svelte:component this={icon} />
		{/if}
		<input class="input" type="text" bind:value {placeholder} bind:this={input} />
		<slot />
		{#if clearable && value}
			<button class="clear" on:click={() => (value = '')}>
				<Cross />
			</button>
		{/if}
	</div>
</label>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.input-wrapper {
		@include mixins.shiny(variables.$grey-2);
		@include mixins.shadow;
		display: flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.75em 1em;
		border-radius: 0.5rem;
		cursor: text;

		&.empty :global(svg) {
			color: variables.$grey-4;
		}

		:global(svg) {
			flex: 0 0 1.25rem;
			height: 1.25rem;
		}

		.input {
			width: 100%;

			&::placeholder {
				color: variables.$grey-4;
			}
		}

		.clear {
			flex: 0 0 0.75rem;

			:global(svg) {
				height: 0.75rem;
			}

			&:not(:hover) {
				color: variables.$grey-4;
			}
		}
	}
</style>
