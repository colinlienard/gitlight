<script lang="ts">
	import type { ComponentType } from 'svelte';

	export let label: string | undefined = undefined;
	export let icon: ComponentType | undefined = undefined;
	export let value: string;
	export let placeholder: string;
</script>

<label class="container">
	{#if label}
		<p class="label">{label}</p>
	{/if}
	<div class="input-wrapper" class:empty={!value}>
		{#if icon}
			<svelte:component this={icon} />
		{/if}
		<input class="input" type="text" bind:value {placeholder} />
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
			height: 1.25rem;
		}

		.input {
			flex: 1;

			&::placeholder {
				color: variables.$grey-4;
			}
		}
	}
</style>
