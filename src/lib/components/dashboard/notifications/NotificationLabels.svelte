<script lang="ts">
	import { afterUpdate, tick } from 'svelte';
	import { lightenColor } from '$lib/helpers';
	import type { GithubLabel } from '$lib/types';

	export let labels: GithubLabel[] = [];

	let list: HTMLUListElement;
	let removed = 0;

	afterUpdate(async () => {
		await tick();
		const height = list?.offsetHeight;
		if (height > 50) {
			labels = labels.slice(0, labels.length - 1);
			removed++;
		}
	});
</script>

{#if labels && labels.length}
	<ul class="labels" bind:this={list}>
		{#each labels as label}
			<li class="label" style:color={lightenColor(label.color)}>
				{label.name}
				<div class="label-background" style:background-color={`#${label.color}`} />
			</li>
		{/each}
		{#if removed}
			<li class="label" style:color="white">
				+{removed}
				<div class="label-background" style:background-color="white" />
			</li>
		{/if}
	</ul>
{/if}

<style lang="scss">
	.labels {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;

		&:global(.labels-hover) {
			max-height: unset;
			transition: height 1s 1s ease-in-out;

			&::before {
				opacity: 0;
			}
		}

		.label {
			@include typography.small;

			position: relative;
			overflow: hidden;
			padding: 0.25rem 0.5rem;
			text-overflow: ellipsis;
			white-space: nowrap;

			.label-background {
				position: absolute;
				border-radius: variables.$small-radius;
				inset: 0;
				opacity: 0.1;
			}
		}
	}
</style>
