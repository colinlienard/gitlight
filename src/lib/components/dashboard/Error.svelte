<script lang="ts">
	import { error } from '~/lib/stores';
	import { Button } from '../common';

	let showError = false;

	function copyError() {
		navigator.clipboard.writeText($error || '');
	}
</script>

<div class="background">
	<section class="modal">
		<h2 class="title">An error occured 🫠</h2>
		<p class="text">
			Please
			<a href="https://twitter.com/colinlienard" class="link" target="_blank">
				contact the developer
			</a>
			or
			<a href="https://github.com/colinlienard/gitlight/issues" class="link" target="_blank">
				create an issue on GitHub
			</a>.
		</p>
		{#if !showError}
			<Button type="secondary" on:click={() => (showError = true)}>Show the error</Button>
		{:else}
			<div class="error">
				{$error}
				<Button type="secondary" small on:click={copyError}>Copy</Button>
			</div>
		{/if}
	</section>
</div>

<style lang="scss">
	.background {
		@include mixins.blurred-background;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.modal {
		@include mixins.modal-shadow;
		width: 40rem;
		padding: 4rem;
		background-color: variables.$grey-1;
		border-radius: variables.$radius;
		border: 1px solid variables.$red;
		display: flex;
		flex-direction: column;
		gap: 1rem;

		.title {
			@include typography.heading-2;
		}

		.text {
			@include typography.base;
			color: variables.$grey-4;

			.link {
				color: variables.$white;

				&:hover {
					text-decoration: underline;
				}
			}
		}

		.error {
			color: variables.$grey-4;
			padding: 1rem;
			border-radius: variables.$radius;
			background-color: variables.$grey-2;
			display: flex;
			align-items: center;
			justify-content: center;
			position: relative;

			:global(button) {
				position: absolute;
				inset: 0.5rem 0.5rem auto auto;
				color: variables.$white;
			}
		}

		* ~ :global(button) {
			width: fit-content;
		}
	}
</style>
