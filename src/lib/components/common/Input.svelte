<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { CrossIcon } from '~/lib/icons';

	export let label: string | undefined = undefined;
	export let icon: ComponentType | undefined = undefined;
	export let value: string | number;
	export let type: 'text' | 'number' | 'password' = 'text';
	export let placeholder: string;
	export let clearable = false;
	export let disabled = false;

	let input: HTMLInputElement;
	let focused = false;

	export function focus() {
		input.focus();
	}
</script>

<label class="container" class:disabled>
	{#if label}
		<p class="label">{label}</p>
	{/if}
	<div class="input-wrapper" class:empty={!value} class:focused>
		{#if icon}
			<svelte:component this={icon} />
		{/if}
		<input
			class="input"
			{...{ type }}
			bind:value
			{placeholder}
			{disabled}
			bind:this={input}
			on:focus={() => (focused = true)}
			on:blur={() => (focused = false)}
		/>
		<slot />
		{#if clearable && value}
			<button class="clear" on:click={() => (value = '')} type="button">
				<CrossIcon />
			</button>
		{/if}
	</div>
</label>

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

	.input-wrapper {
		@include mixins.box(true);

		position: relative;
		display: flex;
		align-items: center;
		padding: 0.75em 1em;
		cursor: text;
		gap: 0.5em;
		outline: solid 3px transparent;
		outline-offset: -3px;
		transition: outline variables.$transition;

		&.empty :global(svg) {
			color: variables.$grey-4;
		}

		&.focused {
			outline-color: variables.$blue-3;
		}

		:global(svg) {
			height: 1.25rem;
			flex: 0 0 1.25rem;
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
