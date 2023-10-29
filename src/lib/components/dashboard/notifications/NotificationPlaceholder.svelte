<script lang="ts">
	import type { ComponentType } from 'svelte';
	import { fade } from 'svelte/transition';

	export let icon: ComponentType;
	export let text: string | undefined = undefined;
</script>

<div class="placeholder" in:fade={{ duration: 300 }}>
	<div class="icon-container">
		<svelte:component this={icon} />
	</div>
	<h4 class="title">No notifications to display</h4>
	{#if text}
		<p class="text">{text}</p>
	{/if}
</div>

<style lang="scss">
	.placeholder {
		display: flex;
		height: 100%;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1rem 0;
		color: variables.$bg-4;
		gap: 0.5rem;
		text-align: center;

		.icon-container {
			position: relative;
			padding: 0.5rem;
			border: 1px solid;
			border-radius: variables.$radius;
			margin-bottom: 0.5rem;

			:global(svg) {
				height: 1rem;
			}

			&::before {
				position: absolute;
				background-image: linear-gradient(transparent, rgba(variables.$bg-1, 0.75));
				content: '';
				inset: -1px;
			}
		}

		.title {
			@include typography.bold;
		}

		.text {
			@include typography.small;
			@include typography.base;

			max-width: 12rem;
		}
	}
</style>
