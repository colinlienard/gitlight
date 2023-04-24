<script lang="ts">
	import { createEventDispatcher, type SvelteComponent } from 'svelte';
	import { Button, Input, Modal } from '~/lib/components';
	import { fetchGithub } from '~/lib/helpers';
	import { ExclamationMark, Plus } from '~/lib/icons';
	import type { GithubRepository, Subscription } from '~/lib/types';

	export let subscriptions: Subscription[];

	let owner = '';
	let repo = '';
	let error = '';
	let loading = false;
	let firstInput: SvelteComponent;
	let modal: SvelteComponent;

	const dispatch = createEventDispatcher();

	async function handleSubmit() {
		if (!owner || !repo) {
			error = 'You must enter an owner and a repository.';
			return;
		}

		const name = `${owner}/${repo}`;
		if (
			subscriptions.find(
				(subscription) => subscription.repo.full_name.toLowerCase() === name.toLowerCase()
			)
		) {
			error = `"${name}" is already being watched.`;
			return;
		}

		try {
			loading = true;
			const repo = (await fetchGithub(`repos/${name}`)) as GithubRepository;
			dispatch('add', { repo });
			modal.close();
		} catch {
			error = `"${name}" is not a valid repository.`;
			return;
		} finally {
			loading = false;
		}
	}

	function onClose() {
		error = '';
		owner = '';
		repo = '';
	}

	$: if (firstInput || error) {
		firstInput.focus();
	}
</script>

<Modal title="Add a repository to watch" bind:this={modal} on:close={onClose} small>
	<Button type="secondary" small slot="trigger"><Plus />Add a repository</Button>
	<div class="content" slot="content">
		<form class="inputs-wrapper" on:submit={handleSubmit}>
			<Input bind:value={owner} label="Owner" placeholder="sveltejs" bind:this={firstInput} />
			<p class="slash">/</p>
			<Input bind:value={repo} label="Repository" placeholder="kit" />
			<input type="submit" hidden />
		</form>
		{#if error}
			<div class="error-wrapper">
				<ExclamationMark />
				<p>{error}</p>
			</div>
		{/if}
		<div class="button-wrapper">
			<Button on:click={handleSubmit} {loading}><Plus />Add</Button>
		</div>
	</div>
</Modal>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.inputs-wrapper {
		display: flex;
		gap: 1rem;
		align-items: flex-end;

		.slash {
			padding-bottom: 0.75rem;
		}
	}

	.error-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: variables.$red;

		:global(svg) {
			height: 1.5rem;
		}
	}

	.button-wrapper {
		display: flex;
		justify-content: flex-end;
	}
</style>
