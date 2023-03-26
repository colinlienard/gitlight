<script lang="ts">
	import { Trash } from '~/lib/icons';
	import { Separator, ShrinkableWrapper, Switch, Tooltip } from '~/lib/components';
	import { onMount } from 'svelte';
	import { createEventData, fetchGithub } from '~/lib/helpers';
	import type { TEventSources, TGithubEvent, TTypeFilters } from '~/lib/types';
	import { filteredEvents, githubEvents, savedEventIds } from '~/lib/stores';
	import { browser } from '$app/environment';
	import SidebarModal from './SidebarModal.svelte';
	import SidebarSearch from './SidebarSearch.svelte';

	let search = '';
	let typeFilters: TTypeFilters = [
		{ name: 'Pull requests', type: 'pr', active: true },
		{ name: 'Issues', type: 'issue', active: true },
		{ name: 'Commits', type: 'commit', active: true },
		{ name: 'Reviews', type: 'review', active: true },
		{ name: 'Branches & tags', type: 'branch/tag', active: true },
		{ name: 'Repository events', type: 'repo', active: true }
	];
	let eventSources: TEventSources = [
		{ name: 'ColinLienard/gitlight', active: true },
		{ name: 'lagonapp/lagon', active: true }
	];

	$: mostAreSelected = typeFilters.filter((filter) => filter.active).length > 3;

	// Save pinned and read events to localStorage
	$: if (browser && $githubEvents.length && $savedEventIds) {
		const pinned = $githubEvents.filter((event) => event.pinned).map((event) => event.id);
		const read = $githubEvents.filter((event) => event.read).map((event) => event.id);
		localStorage.setItem('githubEvents', JSON.stringify({ pinned, read }));
	}

	// Apply filters and search
	$: filteredEvents.set(
		$githubEvents.filter((event) => {
			const source = eventSources.find((source) => source.name === event.repo);
			const searched = event.title.toLowerCase().includes(search.toLowerCase());
			const isOfType = typeFilters.some((filter) => filter.active && filter.type === event.type);
			return source?.active && searched && isOfType;
		})
	);

	async function setEvents() {
		const promises = eventSources.map(({ name }) =>
			fetchGithub(`repos/${name}/events?per_page=50`)
		);
		const response = (await Promise.all(promises)).flat() as TGithubEvent[];
		const sorted = response.sort(
			(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		);
		githubEvents.set(
			sorted.map((event) => {
				const isPinned = $savedEventIds?.pinned.includes(event.id) || false;
				const isRead = $savedEventIds?.read.includes(event.id) || false;
				return createEventData(event, isPinned, isRead);
			})
		);
	}

	function handleAddSource({ detail }: { detail: { name: string } }) {
		const { name } = detail;
		eventSources = [...eventSources, { name, active: true }];
		setEvents();
	}

	function handleRemoveSource(name: string) {
		return () => {
			eventSources = eventSources.filter((source) => source.name !== name);
			setEvents();
		};
	}

	function changeSelectAll(active: boolean) {
		return () => {
			typeFilters = typeFilters.map((filter) => ({ ...filter, active }));
		};
	}

	onMount(() => {
		// Get events ids from localStorage
		savedEventIds.set(
			JSON.parse(localStorage.getItem('githubEvents') || '{ pinned: [], read: [] }')
		);

		setEvents();
	});
</script>

<article class="sidebar">
	<img src="/images/sidebar-gradient.png" alt="" class="gradient" />
	<header class="header">
		<h1 class="title">GitLight</h1>
	</header>
	<ShrinkableWrapper title="Filters">
		<SidebarSearch bind:search />
		<Separator />
		{#if mostAreSelected}
			<button class="button" on:click={changeSelectAll(false)}>Deselect all</button>
		{:else}
			<button class="button" on:click={changeSelectAll(true)}>Select all</button>
		{/if}
		{#each typeFilters as filter (filter.name)}
			<Switch bind:active={filter.active} label={filter.name} />
		{/each}
	</ShrinkableWrapper>
	<ShrinkableWrapper title="Watching">
		{#each eventSources as source (source.name)}
			<div class="repository">
				<Switch bind:active={source.active} label={source.name} />
				<Tooltip content="Delete" position="top">
					<button class="delete" on:click={handleRemoveSource(source.name)}>
						<Trash />
					</button>
				</Tooltip>
			</div>
		{/each}
		<SidebarModal {eventSources} on:add={handleAddSource} />
	</ShrinkableWrapper>
</article>

<style lang="scss">
	.sidebar {
		flex: 0 0 20rem;
		height: 100vh;
		border-right: 1px solid variables.$grey-3;
		padding: 3rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 3rem;
		position: relative;
		overflow: auto;
	}

	.gradient {
		position: fixed;
		inset: 0;
		z-index: -1;
	}

	.header {
		.title {
			@include typography.heading-1;
		}
	}

	.button {
		color: variables.$blue-3;
		width: fit-content;

		&:hover {
			filter: brightness(130%);
		}
	}

	.repository {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;

		.delete {
			transition: opacity variables.$transition;

			:global(svg) {
				height: 1.25rem;

				&:not(:hover) {
					color: variables.$grey-4;
				}
			}
		}

		&:not(:hover) .delete {
			opacity: 0;
		}
	}
</style>
