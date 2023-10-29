<script lang="ts">
	import { SvelteComponent, onMount } from 'svelte';
	import { Button, Modal, ScrollbarContainer, Switch } from '$lib/components';
	import { storage } from '$lib/features';
	import { defaultPriorities } from '$lib/helpers';
	import { PlusIcon, PriorityIcon } from '$lib/icons';
	import { settings } from '$lib/stores';
	import type { Priority } from '$lib/types';
	import PriorityItem from './PriorityItem.svelte';

	let editing = false;
	let mounted = false;
	let priorities: Priority[] = [];
	let scrollContainer: SvelteComponent;

	function handleSave(e: CustomEvent<Priority>) {
		priorities.push(e.detail);
		priorities.sort((a, b) => b.value - a.value);
		priorities = priorities;

		editing = false;
	}

	function handleDelete(criteria: Priority['criteria']) {
		priorities = priorities.filter((priority) => priority.criteria !== criteria);
	}

	onMount(() => {
		if (storage.has('priorities')) {
			priorities = storage.get('priorities') || [];
		} else {
			priorities = [...defaultPriorities];
			storage.set('priorities', priorities);
		}
	});
	$: if (mounted) {
		storage.set('priorities', priorities);
		dispatchEvent(new CustomEvent('refetch'));
	} else if (priorities.length) {
		mounted = true;
	}

	$: if (editing) {
		setTimeout(() => {
			scrollContainer?.scrollTo({ top: 999, behavior: 'smooth' });
		}, 10);
	}
</script>

<Modal title="Priorities" on:close={() => (editing = false)}>
	<Button slot="trigger" secondary small>
		<PriorityIcon />
		Priorities
	</Button>

	<ScrollbarContainer slot="content" margin="2rem 1rem" bind:this={scrollContainer}>
		<div class="content">
			<Switch label="Enable priority sorting" bind:active={$settings.prioritySorting} />
			<p class="paragraph">
				By enabling priority sorting and specifying priority criterias, you can customize the
				importance of notifications and manage them in your own way.
			</p>
			<Switch label="Show priorities on notifications" bind:active={$settings.showPriority} />
			<div class="buttons">
				<Button small on:click={() => (priorities = defaultPriorities)}>Reset to default</Button>
				<Button secondary small on:click={() => (priorities = [])}>Clear</Button>
			</div>
			<span />
			<span />
			{#each priorities as priority}
				<PriorityItem
					{priorities}
					item={priority}
					on:delete={() => handleDelete(priority.criteria)}
				/>
			{/each}
			{#if editing}
				<PriorityItem {priorities} editing on:save={handleSave} on:exit={() => (editing = false)} />
			{/if}
			{#if !priorities.length && !editing}
				<p class="paragraph">No priority criterias yet.</p>
			{/if}
			<Button secondary on:click={() => (editing = true)}>
				<PlusIcon />
				Add a new priority criteria
			</Button>
		</div>
	</ScrollbarContainer>
</Modal>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		padding: 2rem;
		gap: 1rem;
	}

	.paragraph {
		@include typography.base;

		color: variables.$bg-5;
	}

	.buttons {
		display: flex;
		gap: 1rem;
	}
</style>
