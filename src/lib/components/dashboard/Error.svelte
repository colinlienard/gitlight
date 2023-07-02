<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { CrossIcon } from '~/lib/icons';
	import { error } from '~/lib/stores';

	let dontShowAgain = false;

	function appear(_: HTMLElement) {
		return {
			delay: 0,
			duration: 300,
			css: (t: number) => {
				const eased = cubicInOut(t);
				return `
          translate: 0 ${(1 - eased) * 50}%;
          opacity: ${eased};
        `;
			}
		};
	}
</script>

{#if $error && !dontShowAgain}
	<section class="snackbar" transition:appear>
		<p class="text">{$error}</p>
		<button class="button" on:click={() => (dontShowAgain = true)}>Don't show again</button>
		<button class="close" on:click={() => ($error = '')}>
			<CrossIcon />
		</button>
	</section>
{/if}

<style lang="scss">
	.snackbar {
		@include mixins.modal-shadow;
		@include typography.base;
		background-color: variables.$yellow;
		color: variables.$grey-1;
		border-radius: variables.$radius;
		padding: 1rem;
		max-width: 24rem;
		position: absolute;
		inset: auto auto 1rem 1rem;
		z-index: 998;

		.button {
			@include typography.bold;
			margin-top: 0.5em;

			&:hover {
				text-decoration: underline;
			}
		}

		.close {
			position: absolute;
			inset: 0 0 auto auto;
			padding: 0.25rem;

			:global(svg) {
				height: 1rem;
			}
		}
	}
</style>
