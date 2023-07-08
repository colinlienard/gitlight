<script context="module" lang="ts">
	export type TooltipContent = Array<{
		text: string;
		disabled?: boolean;
		active?: boolean;
		onClick?(): void;
		onToggle?(active: boolean): void;
	}>;
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { sineInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { CheckIcon } from '~/lib/icons';

	export let content: string | TooltipContent;
	export let position:
		| 'top'
		| 'bottom'
		| 'left'
		| 'right'
		| `${'top' | 'bottom'} ${'left' | 'right'}` = 'top';
	export let hover = false;
	export let width = 'auto';

	let open = false;
	let timeout: ReturnType<typeof setTimeout>;
	let container: HTMLDivElement;

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

	function handleWindowClick(event: MouseEvent) {
		if (open && !container.contains(event.target as Node)) {
			open = false;
		}
	}

	function handleToggleActive(text: string, callback: (active: boolean) => void) {
		return () => {
			if (typeof content === 'string') return;
			content = content.map((item) => {
				if (item.text === text) {
					callback(!item.active);
					return { ...item, active: !item.active };
				}
				return item;
			});
		};
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

<div class="container" bind:this={container}>
	{#if open}
		<div
			class="tooltip {position}"
			class:no-wrap={width === 'auto'}
			class:fit-content={typeof content === 'string'}
			transition:fade={{ duration: 150, easing: sineInOut }}
			style:width
		>
			{#if typeof content === 'string'}
				<div class="tooltip-item">
					{content}
				</div>
			{:else}
				{#each content as { text, disabled, active, onClick, onToggle }}
					{#if onClick}
						<button class="tooltip-button" class:disabled on:click={onClick}>
							{text}
						</button>
					{:else if onToggle}
						<button
							class="tooltip-button"
							class:disabled
							on:click={handleToggleActive(text, onToggle)}
						>
							<div class="checkbox" class:active>
								<CheckIcon />
							</div>
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
		<div
			class="trigger"
			on:mouseenter={handleMouseEnter}
			on:mouseleave={handleMouseLeave}
			role="presentation"
		>
			<slot />
		</div>
	{:else}
		<button class="trigger" on:click={handleClick}>
			<slot />
		</button>
	{/if}
</div>

<style lang="scss">
	.container {
		position: relative;
		z-index: 1;
	}

	.tooltip {
		@include mixins.modal-shadow;

		position: absolute;
		display: flex;
		flex-direction: column;
		border: 1px solid variables.$grey-3;
		border-radius: variables.$radius;
		background-color: variables.$grey-1;

		&.fit-content {
			max-width: fit-content;
		}

		&.no-wrap {
			white-space: nowrap;
		}

		&:not(.no-wrap) {
			@include typography.base;
		}

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
				right: unset;
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

			display: flex;
			align-items: center;
			gap: 0.5rem;
			text-align: left;
			transition: background-color variables.$transition;

			&:hover {
				background-color: variables.$grey-3;
			}

			.checkbox {
				@include mixins.shiny(variables.$blue-2, true, 0.25rem);

				display: flex;
				height: 1rem;
				flex: 0 0 1rem;
				align-items: center;
				justify-content: center;

				:global(svg) {
					height: 0.75rem;
				}

				&:not(.active) {
					@include mixins.shiny(variables.$grey-3, true, 0.25rem);

					& > :global(svg) {
						color: variables.$grey-4;
					}
				}
			}
		}
	}

	.trigger {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
</style>
