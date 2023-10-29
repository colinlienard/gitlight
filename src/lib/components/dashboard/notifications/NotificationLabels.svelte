<script lang="ts">
	import type { Action } from 'svelte/action';
	import { delayedHover } from '$lib/features';
	import { lightenColor } from '$lib/helpers';
	import type { GithubLabel } from '$lib/types';

	export let labels: GithubLabel[] = [];

	let clipLabels = false;

	const delayedHoverIfLarge: Action<HTMLElement> = (node) => {
		if (node.offsetHeight > 60) {
			clipLabels = true;
			delayedHover(node, 'labels-hover');
		}
	};
</script>

{#if labels && labels.length}
	<ul class="labels" class:clip={clipLabels} use:delayedHoverIfLarge>
		{#each labels as label}
			<li class="label" style:color={lightenColor(label.color)}>
				{label.name}
				<div class="label-background" style:background-color={`#${label.color}`} />
			</li>
		{/each}
	</ul>
{/if}

<style lang="scss">
	.labels {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;

		&.clip {
			position: relative;
			overflow: hidden;
			max-height: 3.5rem;

			&::before {
				position: absolute;
				z-index: 1;
				height: 1.5rem;
				background-image: linear-gradient(transparent, variables.$bg-2);
				content: '';
				inset: auto 0 0;
				pointer-events: none;
			}
		}

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
			border: 1px solid;
			border-radius: variables.$radius;
			text-overflow: ellipsis;
			white-space: nowrap;

			.label-background {
				position: absolute;
				border-radius: variables.$radius;
				inset: 0;
				opacity: 0.1;
			}
		}
	}
</style>
