<script lang="ts">
	import { onMount } from 'svelte';
	import { getNotificationIcon } from '~/lib/helpers';
	import { storage } from '$lib/features';
	import { globalNotifications, loading, settings, typeFilters } from '$lib/stores';
	import SidebarSection from './SidebarSection.svelte';

	let mounted = false;

	// Save type filters to storage
	$: if (mounted && !$loading) {
		storage.set(
			'type-filters',
			$typeFilters.map((filter) => filter.active)
		);
	}

	// Set notification numbers for each type
	$: {
		$typeFilters = $typeFilters.map((filter) => {
			filter.number = $globalNotifications.filter(
				(n) => n.type === filter.type && n.status !== 'done'
			).length;
			return filter;
		});
	}

	$: providerView = $settings.providerView;
	$: typeFiltersGitlab = providerView === 'gitlab' ? $typeFilters.slice(0, 3) : $typeFilters;

	function handleToggle(name: string) {
		return (event: MouseEvent) => {
			if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
				$typeFilters = $typeFilters.map((item) =>
					item.name === name ? { ...item, active: true } : { ...item, active: false }
				);
			} else {
				$typeFilters = $typeFilters.map((item) =>
					item.name === name ? { ...item, active: !item.active } : item
				);
			}
		};
	}

	onMount(() => {
		// Get type filters from storage
		const savedTypeFilters = storage.get('type-filters');
		$typeFilters = $typeFilters.map((filter, index) => ({
			...filter,
			active: savedTypeFilters ? savedTypeFilters[index] : true
		}));
		mounted = true;
	});
</script>

<SidebarSection
	title="Types"
	description="Filter notifications based on their type."
	bind:items={$typeFilters}
	actions={[
		{
			text: 'Hide closed PRs and issues',
			active: $settings.showOnlyOpen,
			onToggle: (value) => settings.update((previous) => ({ ...previous, showOnlyOpen: value }))
		}
	]}
	first
>
	{#each typeFiltersGitlab as { name, type, number, active } (name)}
		<button class="switch-wrapper" class:active on:click={handleToggle(name)}>
			<svelte:component this={getNotificationIcon(type)} />
			<p>{name}</p>
			<p class="filter-number">{number}</p>
		</button>
	{/each}
</SidebarSection>

<style lang="scss">
	.switch-wrapper {
		@include mixins.item-list;

		:global(svg) {
			height: 1.25rem;

			// https://codepen.io/sosuke/pen/Pjoqqp
			filter: invert(48%) sepia(65%) saturate(636%) hue-rotate(202deg) brightness(103%)
				contrast(101%);
		}

		.filter-number {
			color: variables.$bg-4;
		}
	}
</style>
