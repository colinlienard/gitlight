<script lang="ts">
	import { fade } from 'svelte/transition';
	import { sineInOut } from 'svelte/easing';
	import { onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	export let content:
		| string
		| Array<{
				text: string;
				click?(): void;
				disabled?: boolean;
		  }>;
	export let position:
		| 'top'
		| 'bottom'
		| 'left'
		| 'right'
		| `${'top' | 'bottom'} ${'left' | 'right'}` = 'top';
	export let hover = false;

	let open = false;
	let tooltip: HTMLDivElement;
	let timeout: ReturnType<typeof setTimeout>;

	function handleClick() {
		open = !open;
	}

	function handleMouseEnter() {
		timeout = setTimeout(() => {
			open = true;
		}, 500);
	}

	function handleMouseLeave() {
		open = false;
		if (timeout) {
			clearTimeout(timeout);
		}
	}

	function handleWindowClick({ clientX, clientY }: MouseEvent) {
		const { top, left, height, width } = tooltip.getBoundingClientRect();
		if (
			open &&
			!(clientX > left && clientX < left + width && clientY > top && clientY < top + height)
		) {
			open = false;
		}
	}

	$: if (browser && !hover) {
		if (open) {
			window.addEventListener('mouseup', handleWindowClick);
		} else {
			window.removeEventListener('mouseup', handleWindowClick);
		}
	}

	onDestroy(() => {
		if (!browser) return;

		if (!hover) {
			window.removeEventListener('mouseup', handleWindowClick);
		} else if (timeout) {
			clearTimeout(timeout);
		}
	});
</script>

<div class="tooltip-trigger">
	{#if open}
		<div
			class="tooltip {position}"
			transition:fade={{ duration: 150, easing: sineInOut }}
			bind:this={tooltip}
		>
			{#if typeof content === 'string'}
				<div class="tooltip-item">
					{content}
				</div>
			{:else}
				{#each content as { text, click, disabled }}
					{#if click}
						<button class="tooltip-button" class:disabled on:click={click}>
							{text}
						</button>
					{:else}
						<div class="tooltip-item" class:disabled>
							{text}
						</div>
					{/if}
				{/each}
			{/if}
		</div>
	{/if}
	{#if hover}
		<div on:mouseenter={handleMouseEnter} on:mouseleave={handleMouseLeave}>
			<slot />
		</div>
	{:else}
		<button on:click={open ? undefined : handleClick}>
			<slot />
		</button>
	{/if}
</div>

<style lang="scss">
	.tooltip-trigger {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	.tooltip {
		@include mixins.modal-shadow;
		background-color: variables.$grey-1;
		border: 1px solid variables.$grey-3;
		border-radius: variables.$radius;
		white-space: nowrap;
		position: absolute;
		display: flex;
		flex-direction: column;

		&.left {
			top: 50%;
			right: calc(100% + 0.25rem);
			translate: 0 -50%;
		}

		&.right {
			top: 50%;
			left: calc(100% + 0.25rem);
			translate: 0 -50%;
		}

		&.top {
			bottom: calc(100% + 0.25rem);
			left: 50%;
			translate: -50% 0;
		}

		&.bottom {
			top: calc(100% + 0.25rem);
			left: 50%;
			translate: -50% 0;
		}

		&.bottom,
		&.top {
			&.left {
				left: 0;
				translate: 0 0;
			}

			&.right {
				right: 0;
				left: unset;
				translate: 0 0;
			}
		}

		.tooltip-item,
		.tooltip-button {
			padding: 0.5rem;

			&:not(:last-child) {
				border-bottom: inherit;
			}

			&.disabled {
				color: variables.$grey-4;
				pointer-events: none;
			}
		}

		.tooltip-button {
			@include typography.bold;
			text-align: left;
			transition: background-color variables.$transition;

			&:hover {
				background-color: variables.$grey-3;
			}
		}
	}
</style>
