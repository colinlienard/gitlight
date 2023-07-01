<script lang="ts">
	import { SvelteComponent, createEventDispatcher, onMount } from 'svelte';
	import { Button, Input } from '~/lib/components';
	import { CheckIcon, TrashIcon } from '~/lib/icons';
	import { settings } from '~/lib/stores';

	export let pat: { owner: string; token: string } = { owner: '', token: '' };
	export let editing = false;

	const dispatch = createEventDispatcher();

	let showToken = false;
	let error = '';
	let firstInput: SvelteComponent;

	function handleDelete() {
		$settings.pats = $settings.pats.filter((p) => p.owner !== pat.owner);
	}

	function handleSave() {
		if (!pat.owner || !pat.token) {
			error = 'Please fill all the fields.';
			return;
		}
		if ($settings.pats.find((p) => p.owner === pat.owner)) {
			error = 'This owner already exists.';
			return;
		}
		$settings.pats.push(pat);
		$settings.pats = $settings.pats;
		dispatch('save');
	}

	onMount(() => {
		if (firstInput) {
			firstInput.focus();
		}
	});
</script>

<div class="pat-wrapper">
	{#if editing}
		<div class="content">
			<p class="text">Repository owner: <strong>{pat.owner}</strong></p>
			<p class="text">
				Personal Access Token:
				{#if showToken}
					<strong>{pat.token}</strong>
				{:else}
					<button class="show-token" on:click={() => (showToken = true)}>Show</button>
				{/if}
			</p>
		</div>
		<button class="delete-button" on:click={handleDelete}><TrashIcon /></button>
	{:else}
		<div class="inputs-container">
			<Input
				label="Repositories owner"
				placeholder="The user or organization login"
				{editing}
				bind:value={pat.owner}
				bind:this={firstInput}
			/>
			<Input
				label="Personal Access Token"
				placeholder="Copy here the PAT with correct permissions"
				{editing}
				bind:value={pat.token}
			/>
			{#if error}
				<p class="error">{error}</p>
			{/if}
			<Button small on:click={handleSave}>
				<CheckIcon />
				Save
			</Button>
		</div>
	{/if}
</div>

<style lang="scss">
	.pat-wrapper {
		background-color: variables.$grey-2;
		border-radius: variables.$radius;
		border: 1px solid variables.$grey-3;
		display: flex;

		.content {
			display: flex;
			flex-direction: column;
			gap: 0.5rem;
			padding: 1rem;
			word-break: break-all;
			width: 100%;

			strong {
				@include typography.base;
				@include typography.bold;
				user-select: text;
			}

			.show-token {
				@include typography.bold;
				color: variables.$blue-3;

				&:hover {
					filter: brightness(130%);
				}
			}
		}

		.delete-button {
			padding: 0.5rem;
			display: flex;
			align-items: center;
			border-left: inherit;
			flex: 0 0 auto;

			&:hover {
				background-color: lighten(variables.$grey-2, 1%);
			}

			&:active {
				background-color: lighten(variables.$grey-2, 2%);
			}

			:global(svg) {
				height: 1.25rem;
			}
		}

		.inputs-container {
			display: flex;
			flex-direction: column;
			align-items: end;
			gap: 1rem;
			padding: 1rem;
			width: 100%;

			.error {
				color: variables.$red;
				width: 100%;
			}
		}
	}
</style>
