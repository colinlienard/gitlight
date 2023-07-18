<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Button, Input, Select } from '~/lib/components';
	import { priorityLabels } from '~/lib/helpers';
	import { CheckIcon, PriorityDownIcon, PriorityUpIcon, TrashIcon } from '~/lib/icons';
	import type { GithubIssue, Priority } from '~/lib/types';

	type StateOptions = Array<{
		text: string;
		value: GithubIssue['state'];
	}>;

	export let item: Priority | { criteria: null; value: number } = { criteria: null, value: 1 };
	export let editing = false;
	export let priorities: Priority[];

	const dispatch = createEventDispatcher();
	const criterias: Priority['criteria'][] = [
		'assigned',
		'label',
		'many-comments',
		'many-reactions',
		'mentionned',
		'review-request',
		'state'
	];

	let error = '';

	$: options = criterias
		.filter((value) => !priorities.find((priority) => priority.criteria === value))
		.map((value) => ({ text: priorityLabels[value], value }));
	$: displayValue = `${item.value > 0 ? '+' : ''}${item.value}`;
	$: displayText = (() => {
		if (!item.criteria) return '';
		const label = priorityLabels[item.criteria];
		if ('specifier' in item) {
			return `${label.replace('...', '')} ${item.specifier}`;
		} else {
			return label;
		}
	})();

	const stateOptions: StateOptions = [
		{ text: 'Open', value: 'open' },
		{ text: 'Closed', value: 'closed' }
	];

	function handleDelete() {
		dispatch('delete');
	}

	function handleSave() {
		if (!item.criteria) {
			error = 'Please fill all the fields.';
			return;
		}
		if (priorities.find((p) => p.criteria === item.criteria)) {
			error = 'This criteria already exists.';
			return;
		}
		const value = parseInt(item.value as unknown as string);
		if (value < -10 || value > 10 || value === 0) {
			error = 'Value must be superior to -10, inferior to 10 and different than 0.';
			return;
		}
		dispatch('save', item);
	}

	function handleCancel(event: Event) {
		event.preventDefault();
		dispatch('exit');
	}
</script>

<div class="item-wrapper">
	{#if editing}
		<form class="inputs-container" on:submit|preventDefault={handleSave}>
			<div class="inputs">
				<Select
					label="Criteria"
					placeholder="The user or organization login"
					position="top"
					bind:value={item.criteria}
					{options}
				/>
				{#if item.criteria === 'label'}
					<Input label="Label name" placeholder="Enter a label name" bind:value={item.specifier} />
				{:else if item.criteria === 'state'}
					<Select
						label="State"
						placeholder="Issue/pr state"
						position="top"
						options={stateOptions}
						bind:value={item.specifier}
					/>
				{/if}
				<Input
					label="Value (positive or negative)"
					placeholder="Enter a priority value"
					bind:value={item.value}
					type="number"
				/>
			</div>
			{#if error}
				<p class="error">{error}</p>
			{/if}
			<div class="buttons">
				<Button small type="submit">
					<CheckIcon />
					Save
				</Button>
				<Button secondary small on:click={handleCancel}>Cancel</Button>
			</div>
		</form>
	{:else}
		<div class="content">
			<div class="value-wrapper" class:up={item.value > 0} class:down={item.value < 0}>
				{#if item.value > 0}
					<PriorityUpIcon />
				{:else}
					<PriorityDownIcon />
				{/if}
				<p class="value">{displayValue}</p>
			</div>
			<p class="text">{displayText}</p>
		</div>
		<button class="delete-button" on:click={handleDelete}><TrashIcon /></button>
	{/if}
</div>

<style lang="scss">
	.item-wrapper {
		@include mixins.box;

		display: flex;

		.content {
			display: flex;
			width: 100%;
			align-items: center;
			padding: 1rem;
			gap: 0.5rem;

			.value-wrapper {
				display: flex;
				align-items: center;
				gap: 0.25rem;

				&.up {
					color: variables.$yellow;
				}

				&.down {
					color: variables.$red;
				}

				:global(svg) {
					height: 1.25rem;
				}
			}

			.text {
				@include typography.bold;
			}
		}

		.delete-button {
			display: flex;
			flex: 0 0 3rem;
			align-items: center;
			justify-content: center;
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

			.inputs {
				display: flex;
				gap: 1rem;
			}

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
