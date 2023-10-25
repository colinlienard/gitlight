<script lang="ts" context="module">
	export type Repo = {
		url: string;
		id: number;
		pending: boolean;
		error: boolean;
	};
</script>

<script lang="ts">
	import { CheckIcon, PlusIcon } from '~/lib/icons';
	import { settings } from '~/lib/stores';
	import { Button } from '$lib/components';
	import RepoInput from './RepoInput.svelte';

	const defaultRepo: Repo = { url: '', id: 0, pending: false, error: true };

	let repos: Array<Repo> = $settings.gitlabRepos.length
		? $settings.gitlabRepos.map(({ url, id }) => ({ url, id, error: false, pending: false }))
		: [{ ...defaultRepo }];
	let saveDisabled: boolean | null | undefined = null;

	$: addDisabled = repos.length >= 10;

	$: if (saveDisabled === null) {
		saveDisabled = undefined;
	} else if (saveDisabled === undefined) {
		saveDisabled = true;
	} else {
		saveDisabled = !repos.length || repos.some(({ error, pending }) => error || pending);
	}

	function handleSave() {
		$settings.gitlabRepos = repos.map(({ url, id }) => ({ url, id }));
		dispatchEvent(new CustomEvent('refetch'));
		saveDisabled = true;
	}

	function handleAdd() {
		repos.push({ ...defaultRepo });
		repos = repos;
	}

	function handleDelete(index: number) {
		return () => {
			repos.splice(index, 1);
			repos = repos;
		};
	}
</script>

<div class="container">
	<p class="text">Enter the url of the repositories you want to receive notifications from:</p>
	{#each repos as repo, index (index)}
		<RepoInput first={index === 0} {repos} bind:repo on:delete={handleDelete(index)} />
	{/each}
	<div class="add-container">
		<Button secondary disabled={addDisabled} on:click={handleAdd}>
			<PlusIcon />
			Add more repositories
		</Button>
	</div>
	<div class="submit-container">
		<Button small disabled={saveDisabled || false} on:click={handleSave}>
			<CheckIcon />
			Save
		</Button>
	</div>
</div>

<style lang="scss">
	.container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.text {
		color: variables.$grey-4;
	}

	.add-container {
		width: 100%;

		:global(button) {
			width: 100%;
		}
	}

	.submit-container {
		display: flex;
		justify-content: end;
	}
</style>
