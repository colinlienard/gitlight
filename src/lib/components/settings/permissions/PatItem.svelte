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
		dispatch('exit');
	}

	function handleCancel(event: Event) {
		event.preventDefault();
		dispatch('exit');
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
			<p class="text">Resource owner: <strong>{pat.owner}</strong></p>
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
		<form class="inputs-container" on:submit|preventDefault={handleSave}>
			<Input
				label="Resource owner"
				placeholder="The user or organization login"
				bind:value={pat.owner}
				bind:this={firstInput}
			/>
			<Input
				label="Personal Access Token"
				placeholder="Copy here the PAT with correct permissions"
				bind:value={pat.token}
			/>
			{#if error}
				<p class="error">{error}</p>
			{/if}
			<div class="buttons">
				<Button small>
					<CheckIcon />
					Save
				</Button>
				<Button type="secondary" small on:click={handleCancel}>Cancel</Button>
			</div>
		</form>
	{/if}
</div>

<style lang="scss">
	.pat-wrapper {
		@include mixins.box;

		display: flex;

		.content {
			display: flex;
			width: 100%;
			flex-direction: column;
			padding: 1rem;
			gap: 0.5rem;
			word-break: break-all;

			strong {
				@include typography.base;
				@include typography.bold;

				user-select: text;
			}

			.show-token {
				@include mixins.link;
			}
		}

		.delete-button {
			display: flex;
			flex: 0 0 auto;
			align-items: center;
			padding: 0.5rem;
			border-left: inherit;

			&:hover {
				background-color: color.adjust(variables.$grey-2, $lightness: 1%);
			}

			&:active {
				background-color: color.adjust(variables.$grey-2, $lightness: 2%);
			}

			:global(svg) {
				height: 1.25rem;
			}
		}

		.inputs-container {
			display: flex;
			width: 100%;
			flex-direction: column;
			padding: 1rem;
			gap: 1rem;

			.error {
				width: 100%;
				color: variables.$red;
			}

			.buttons {
				display: flex;
				flex-direction: row-reverse;
				align-items: center;
				gap: 0.5rem;
			}
		}
	}
</style>
