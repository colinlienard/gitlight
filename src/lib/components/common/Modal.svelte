<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { Cross } from '~/lib/icons';

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
				document.body.appendChild(node);
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
				<button class="close" on:click={handleToggle}>
					<Cross />
				</button>
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
		position: fixed;
		inset: 0;
		backdrop-filter: blur(0.25rem);
		-webkit-backdrop-filter: blur(0.25rem);
		background-color: rgba(black, 0.5);
		cursor: not-allowed;
		z-index: 998;
	}

	.modal {
		position: fixed;
		top: 50%;
		left: 50%;
		translate: -50% -50%;
		display: flex;
		flex-direction: column;
		background-color: variables.$grey-1;
		border: 1px solid variables.$grey-2;
		border-radius: variables.$radius;
		width: min(50rem, calc(100vw - 4rem));
		height: min(40rem, calc(100vh - 4rem));
		box-shadow: 0 1rem 2rem rgba(black, 0.25);
		z-index: 999;

		&.small {
			width: 32rem;
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

			.close {
				padding: 0.5rem;
				border-radius: variables.$radius;
				transition: background-color variables.$transition;

				&:hover {
					background-color: variables.$grey-2;
				}

				&:active {
					background-color: variables.$grey-3;
				}

				:global(svg) {
					height: 1rem;
				}
			}
		}

		.content {
			padding: 2rem;
			height: 100%;
			overflow: hidden;
		}
	}
</style>
