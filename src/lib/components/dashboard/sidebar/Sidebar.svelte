<script lang="ts">
	import { Github, Logo, Trash } from '~/lib/icons';
	import { Separator, ShrinkableWrapper, Switch, Tooltip } from '~/lib/components';
	import { onMount } from 'svelte';
	import { getAppVersion } from '~/lib/helpers';
	import type { EventSources, TypeFilters } from '~/lib/types';
	import { filteredEvents, githubEvents, loading } from '~/lib/stores';
	import { browser } from '$app/environment';
	import SidebarModal from './SidebarModal.svelte';
	import SidebarSearch from './SidebarSearch.svelte';

	export let eventSources: EventSources;

	let search = '';
	let typeFilters: TypeFilters = [
		{ name: 'Pull requests', type: 'pr', active: true },
		{ name: 'Issues', type: 'issue', active: true },
		{ name: 'Commits', type: 'commit', active: true },
		{ name: 'Reviews', type: 'review', active: true },
		{ name: 'Branches & tags', type: 'branch/tag', active: true },
		{ name: 'Repository events', type: 'repo', active: true }
	];

	$: mostAreSelected = typeFilters.filter((filter) => filter.active).length > 3;

	// Save type filters to localStorage
	$: if (browser && !$loading) {
		localStorage.setItem('typeFilters', JSON.stringify(typeFilters.map((filter) => filter.active)));
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

	function handleAddSource({ detail }: { detail: { name: string } }) {
		const { name } = detail;
		eventSources = [...eventSources, { name, active: true }];
	}

	function handleRemoveSource(name: string) {
		return () => {
			eventSources = eventSources.filter((source) => source.name !== name);
		};
	}

	function changeSelectAll(active: boolean) {
		return () => {
			typeFilters = typeFilters.map((filter) => ({ ...filter, active }));
		};
	}

	onMount(() => {
		// Get type filters from localStorage
		const savedTypeFilters = JSON.parse(
			localStorage.getItem('typeFilters') || '[true, true, true, true, true, true, true]'
		);
		typeFilters = typeFilters.map((filter, index) => ({
			...filter,
			active: savedTypeFilters[index]
		}));
	});
</script>

<article class="sidebar">
	<div class="scrollable">
		<img src="/images/sidebar-gradient.png" alt="" class="gradient" />
		<header class="header">
			<Logo />
			<h1 class="title">GitLight</h1>
		</header>
		{#if !$loading}
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
		{:else}
			<div class="skeletons-container">
				<span class="skeleton" />
				<span class="skeleton" />
				<span class="skeleton" />
				<span class="skeleton" />
				<span class="skeleton" />
				<span class="skeleton" />
				<span class="skeleton" />
			</div>
			<div class="skeletons-container">
				<span class="skeleton" />
				<span class="skeleton" />
				<span class="skeleton" />
				<span class="skeleton" />
				<span class="skeleton" />
				<span class="skeleton" />
			</div>
		{/if}
	</div>
	<footer class="footer">
		<p>v{getAppVersion()}</p>
		<a
			href="https://github.com/ColinLienard/gitlight"
			class="link"
			target="_blank"
			rel="noreferrer"
		>
			<Github />
			GitHub repository
		</a>
	</footer>
</article>

<style lang="scss">
	.sidebar {
		flex: 0 0 20rem;
		height: 100vh;
		border-right: 1px solid variables.$grey-3;
		display: flex;
		flex-direction: column;
	}

	.scrollable {
		padding: 3rem 2rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 3rem;
		height: 100%;
		overflow: auto;
		position: relative;
	}

	.gradient {
		position: absolute;
		inset: 0;
		z-index: -1;
	}

	.header {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		:global(svg) {
			height: 2rem;
		}

		.title {
			@include typography.heading-1;
		}
	}

	.skeletons-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		.skeleton {
			@include mixins.skeleton(100%, 2rem);

			&:nth-child(1) {
				height: 1.5rem;
				width: 70%;
			}
		}
	}

	.button {
		@include typography.small;
		@include typography.bold;
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
			flex: 0 0 1.25rem;
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

	.footer {
		position: sticky;
		bottom: 0;
		left: 0;
		padding: 2rem;
		border-top: 1px solid variables.$grey-3;
		display: flex;
		align-items: center;
		justify-content: space-between;
		color: variables.$grey-4;

		.link {
			display: flex;
			align-items: center;
			gap: 0.25rem;
			transition: color variables.$transition;

			&:hover {
				color: variables.$white;
			}

			:global(svg) {
				height: 1.25rem;
			}
		}
	}
</style>
