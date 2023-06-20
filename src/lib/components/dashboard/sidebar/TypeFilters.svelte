<script lang="ts">
	import { onMount } from 'svelte';
	import { githubNotifications, loading, settings, typeFilters } from '~/lib/stores';
	import { storage } from '~/lib/helpers';
	import { Switch } from '~/lib/components';
	import { browser } from '$app/environment';
	import SidebarSection from './SidebarSection.svelte';

	// Save type filters to storage
	$: if (browser && !$loading) {
		storage.set(
			'type-filters',
			$typeFilters.map((filter) => filter.active)
		);
	}

	// Set notification numbers for each type
	$: {
		$typeFilters = $typeFilters.map((filter) => {
			filter.number = $githubNotifications.filter((n) => n.type === filter.type).length;
			return filter;
		});
	}

	function handleSelectOne(name: string) {
		return () => {
			$typeFilters = $typeFilters.map((filter) =>
				filter.name === name ? { ...filter, active: true } : { ...filter, active: false }
			);
		};
	}

	onMount(async () => {
		// Get type filters from storage
		const savedTypeFilters = storage.get('type-filters');
		$typeFilters = $typeFilters.map((filter, index) => ({
			...filter,
			active: savedTypeFilters ? savedTypeFilters[index] : true
		}));
	});
</script>

<SidebarSection
	title="Filters"
	description="Filter notifications based on their type."
	bind:items={$typeFilters}
	actions={[
		{
			text: 'Hide closed PRs and issues',
			active: $settings.showOnlyOpen,
			onToggle: (value) => settings.update((previous) => ({ ...previous, showOnlyOpen: value }))
		}
	]}
>
	{#each $typeFilters as filter (filter.name)}
		<div class="switch-wrapper">
			<Switch
				bind:active={filter.active}
				label={filter.name}
				on:meta-click={handleSelectOne(filter.name)}
			/>
			<p class="filter-number">{filter.number}</p>
		</div>
	{/each}
</SidebarSection>

<style lang="scss">
	.switch-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		.filter-number {
			color: variables.$grey-4;
		}
	}
</style>
