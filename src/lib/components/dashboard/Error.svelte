<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { CrossIcon } from '~/lib/icons';
	import { error, settings } from '~/lib/stores';

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
	<section class="snackbar" class:translated={$settings.sidebarHidden} transition:appear>
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

		position: absolute;
		z-index: 998;
		max-width: 24rem;
		padding: 1rem;
		border-radius: variables.$radius;
		background-color: variables.$yellow;
		color: variables.$grey-1;
		inset: auto auto 1rem 1rem;
		transition: translate 0.3s ease-in-out;

		&.translated {
			translate: 20rem;
		}

		.button {
			@include typography.bold;

			margin-top: 0.5em;

			&:hover {
				text-decoration: underline;
			}
		}

		.close {
			position: absolute;
			padding: 0.25rem;
			inset: 0 0 auto auto;

			:global(svg) {
				height: 1rem;
			}
		}
	}
</style>
