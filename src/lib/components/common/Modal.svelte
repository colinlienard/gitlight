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

	$: dispatch(open ? 'open' : 'close');

	function handleToggle() {
		open = !open;
	}

	function portal(node: HTMLElement, _: boolean) {
		return {
			update() {
				document.querySelector('#id')?.appendChild(node);
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

<button class="trigger" on:click={handleToggle}>
	<slot name="trigger" />
</button>

<div use:portal={open}>
	{#if open}
		<button
			class="background"
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

	.background {
		@include mixins.blurred-background;
		cursor: not-allowed;
	}

	.modal {
		@include mixins.modal-shadow;
		position: fixed;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
		display: flex;
		flex-direction: column;
		background-color: variables.$grey-1;
		border: 1px solid variables.$grey-3;
		border-radius: variables.$radius;
		width: min(50rem, calc(100vw - 4rem));
		height: min(42rem, calc(100vh - 4rem));
		z-index: 999;

		&.small {
			width: 32rem;
			height: 32rem;
		}

		.header {
			padding: 2rem;
			display: flex;
			align-items: center;
			justify-content: space-between;
			border-bottom: inherit;

			.title {
				@include typography.heading-2;
			}
		}

		.content {
			height: 100%;
			overflow: hidden;
		}
	}
</style>
