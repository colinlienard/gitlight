<script lang="ts">
	import {
		Button,
		IconButton,
		Modal,
		ScrollbarContainer,
		Separator,
		Switch,
		Tooltip
	} from '~/lib/components';
	import { PlusIcon, PriorityIcon } from '~/lib/icons';
	import { settings } from '~/lib/stores';
	import type { Priority } from '~/lib/types';
	import PriorityItem from './PriorityItem.svelte';

	let editing = false;
	let priorities: Priority[] = [
		{ criteria: 'assigned', value: 1 },
		{ criteria: 'review-request', value: 2 },
		{ criteria: 'mentionned', value: -1 }
	];

	function handleSave(e) {
		console.log(e);
		editing = false;
	}

	function handleDelete() {}
</script>

<Modal title="Priorities">
	<Tooltip slot="trigger" content="Priorities" hover position="bottom">
		<IconButton large rounded>
			<PriorityIcon />
		</IconButton>
	</Tooltip>

	<ScrollbarContainer slot="content" margin="2rem 1rem">
		<div class="content">
			<Switch label="Enable priority sorting" bind:active={$settings.prioritySorting} />
			<p class="paragraph">
				By enabling priority sorting and specifying priority criteria, you can customize the
				importance of notifications and manage them in your own way.
			</p>
			<div class="buttons">
				<Button small>Reset to default</Button>
				<Button type="secondary" small>Clear</Button>
			</div>
			<Separator marginY={1} />
			{#each priorities as priority}
				<PriorityItem item={priority} on:delete={handleDelete} />
			{/each}
			{#if editing}
				<PriorityItem editing on:save={handleSave} on:exit={() => (editing = false)} />
			{/if}
			<Button type="secondary" on:click={() => (editing = true)}>
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

		color: variables.$grey-4;
	}

	.buttons {
		display: flex;
		gap: 1rem;
	}
</style>
