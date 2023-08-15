<script lang="ts" context="module">
	import { writable } from 'svelte/store';

	export const modalOpen = writable(false);
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { CrossIcon } from '~/lib/icons';
	import { IconButton } from '.';

	export let title: string;
	export let small = false;
	export let open = false;

	const dispatch = createEventDispatcher();

	$: {
		dispatch(open ? 'open' : 'close');
		$modalOpen = open;
	}

	function handleToggle() {
		open = !open;
	}

	function portal(node: HTMLElement, _: boolean) {
		return {
			update() {
				document.querySelector('#root')?.appendChild(node);
			},
			destroy() {
				node.parentNode?.removeChild(node);
			}
		};
	}

	function modalAnimation(_: HTMLElement) {
		return {
			delay: 0,
			duration: 150,
			css: (t: number) => {
				const eased = cubicInOut(t);
				return `
          scale: ${eased * 0.1 + 0.9};
          opacity: ${eased};
        `;
			}
		};
	}

	export function close() {
		open = false;
	}
</script>

{#if $$slots.trigger}
	<div class="trigger" on:click={handleToggle} role="presentation">
		<slot name="trigger" />
	</div>
{/if}

<div class="portal" use:portal={open}>
	{#if open}
		<button
			class="background"
			type="button"
			on:click={handleToggle}
			transition:fade={{ duration: 150, easing: cubicInOut }}
		/>
		<section class="modal" class:small transition:modalAnimation>
			<header class="header">
				<h2 class="title">{title}</h2>
				<IconButton on:click={handleToggle}>
					<CrossIcon />
				</IconButton>
			</header>
			<div class="content">
				<slot name="content" />
			</div>
		</section>
	{/if}
</div>

<style lang="scss">
	.trigger {
		display: grid;
	}

	.portal {
		position: absolute;
	}

	.background {
		@include mixins.blurred-background;

		cursor: not-allowed;
	}

	.modal {
		@include mixins.modal-shadow;

		position: fixed;
		z-index: 999;
		top: 50%;
		left: 50%;
		display: flex;
		width: min(50rem, calc(100vw - 4rem));
		height: min(42rem, calc(100vh - 4rem));
		flex-direction: column;
		border: 1px solid variables.$grey-3;
		border-radius: variables.$radius;
		background-color: variables.$grey-1;
		translate: -50% -50%;

		&.small {
			width: 32rem;
			height: 32rem;
		}

		.header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 2rem;
			border-bottom: inherit;

			.title {
				@include typography.heading-2;
			}
		}

		.content {
			overflow: hidden;
			height: 100%;
		}
	}
</style>
