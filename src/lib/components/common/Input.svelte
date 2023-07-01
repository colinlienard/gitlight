<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { CrossIcon } from '~/lib/icons';

	export let label: string | undefined = undefined;
	export let icon: ComponentType | undefined = undefined;
	export let value: string;
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
			type="text"
			bind:value
			{placeholder}
			{disabled}
			bind:this={input}
			on:focus={() => (focused = true)}
			on:blur={() => (focused = false)}
		/>
		<slot />
		{#if clearable && value}
			<button class="clear" on:click={() => (value = '')}>
				<CrossIcon />
			</button>
		{/if}
	</div>
</label>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
		width: 100%;

		&.disabled {
			opacity: 0.5;

			* {
				cursor: not-allowed !important;
			}
		}
	}

	.input-wrapper {
		background-color: variables.$grey-2;
		border-radius: variables.$radius;
		border: 1px solid variables.$grey-3;
		position: relative;
		display: flex;
		align-items: center;
		gap: 0.5em;
		padding: 0.75em 1em;
		border-radius: 0.5rem;
		cursor: text;

		&.empty :global(svg) {
			color: variables.$grey-4;
		}

		&.focused {
			border-color: variables.$blue-3;
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
