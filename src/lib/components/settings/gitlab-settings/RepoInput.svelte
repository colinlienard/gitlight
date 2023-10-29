<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Input } from '$lib/components';
	import { fetchGitlab } from '$lib/features';
	import { CheckIcon, TrashIcon } from '$lib/icons';
	import type { GitlabRepository } from '$lib/types';
	import type { Repo } from './GitlabRepos.svelte';

	export let repo: Repo;
	export let repos: Repo[];
	export let first: boolean;

	const dispatch = createEventDispatcher();

	let timer: ReturnType<typeof setTimeout>;
	let errorMessage: string;
	let mounted = false;
	let untouched = true;

	$: url = repo.url;
	$: if (mounted) {
		untouched = false;
		check(url);
	} else {
		mounted = true;
	}

	function check(value: string) {
		repo.pending = true;
		repo.error = false;
		clearTimeout(timer);

		timer = setTimeout(async () => {
			if (repos.filter((item) => item.url === value).length > 1) {
				repo.pending = false;
				repo.error = true;
				errorMessage = 'Repository already submitted';
				return;
			}
			const regex = /^https:\/\/(gitlab(\.[a-zA-Z0-9-]+)?)\.com\/([^/?\s]+\/[^/?\s]+)$/i;
			if (regex.test(value)) {
				try {
					const url = new URL(value);
					const response = await fetchGitlab<GitlabRepository>(
						`projects/${url.pathname.substring(1).replace('/', '%2F')}`,
						{ domain: url.host }
					);
					repo.id = response.id;
					repo.error = false;
				} catch {
					repo.error = true;
					errorMessage = 'Repository not found.';
				} finally {
					repo.pending = false;
				}
			} else {
				repo.pending = false;
				repo.error = true;
				errorMessage = 'Invalid URL.';
			}
		}, 500);
	}
</script>

<div class="container">
	<div class="input-container">
		<Input
			bind:value={repo.url}
			error={repo.error && !untouched}
			placeholder={'https://gitlab.com/you/your-repo'}
		/>
		{#if repo.pending}
			<div class="addon pending">
				<div class="spinner" />
			</div>
		{:else}
			{#if !repo.error && first && !untouched}
				<div class="addon success">
					<CheckIcon />
				</div>
			{/if}
			{#if !first}
				<button
					class="addon button"
					class:success={!repo.error && !untouched}
					on:click={() => dispatch('delete')}
				>
					{#if !repo.error && !untouched}
						<CheckIcon />
					{/if}
					<TrashIcon />
				</button>
			{/if}
		{/if}
	</div>
	{#if repo.error && errorMessage}
		<p class="error">{errorMessage}</p>
	{/if}
</div>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.error {
		@include typography.small;

		margin-left: 1rem;
		color: variables.$red;
	}

	.input-container {
		position: relative;

		.addon {
			position: absolute;
			display: flex;
			align-items: center;
			justify-content: center;
			aspect-ratio: 1 / 1;
			inset: 1px 1px 1px auto;

			:global(svg) {
				height: 1rem;
			}

			&.pending .spinner {
				@keyframes spin {
					from {
						transform: rotate(0deg);
					}

					to {
						transform: rotate(360deg);
					}
				}

				width: 1rem;
				height: 1rem;
				border: 2px solid variables.$bg-5;
				border-radius: 50%;
				border-top-color: variables.$bg-3;
				animation: spin 1s linear infinite;
			}

			&.button {
				border-radius: 0 variables.$radius variables.$radius 0;
				border-left: 1px solid variables.$bg-3;

				&:hover {
					background-color: color.adjust(variables.$bg-2, $lightness: 1%);
				}

				&:active {
					background-color: color.adjust(variables.$bg-2, $lightness: 2%);
				}

				:global(svg) {
					height: 1.25rem;
				}
			}

			&.success {
				:global(svg) {
					position: absolute;
					height: 1.25rem;

					&:nth-of-type(1) {
						@keyframes disappear {
							75% {
								scale: 1;
							}

							100% {
								scale: 0;
							}
						}

						animation: disappear 2s ease-in-out forwards;
						color: variables.$green;
					}

					&:nth-of-type(2) {
						@keyframes appear {
							0% {
								scale: 0;
							}

							75% {
								scale: 0;
							}

							100% {
								scale: 1;
							}
						}

						animation: appear 2s ease-in-out;
					}
				}
			}
		}
	}
</style>
