<script lang="ts">
	import { Github, Logo } from '~/lib/icons';
	import { Separator, Switch } from '~/lib/components';
	import { onMount } from 'svelte';
	import { getAppVersion, storage } from '~/lib/helpers';
	import { filteredNotifications, githubNotifications, loading, watchedRepos } from '~/lib/stores';
	import { browser } from '$app/environment';
	import SidebarSearch from './SidebarSearch.svelte';
	import WatchedRepos from './WatchedRepos.svelte';
	import type { TypeFilters } from '~/lib/types';

	let search = '';
	let typeFilters: TypeFilters = [
		{ name: 'Pull requests', type: 'PullRequest', active: true, number: 0 },
		{ name: 'Issues', type: 'Issue', active: true, number: 0 },
		{ name: 'Commits', type: 'Commit', active: true, number: 0 },
		{ name: 'Discussions', type: 'Discussion', active: true, number: 0 },
		{ name: 'Releases', type: 'Release', active: true, number: 0 }
	];
	let others = true;

	$: mostFiltersAreSelected = typeFilters.filter((filter) => filter.active).length > 3;
	$: mostReposAreSelected = $watchedRepos.filter((filter) => filter.active).length > 3;

	// Save type filters to storage
	$: if (browser && !$loading) {
		storage.set(
			'type_filters',
			typeFilters.map((filter) => filter.active)
		);
	}

	// Save watched repos to storage
	$: if (browser && !$loading) {
		storage.set(
			'github_watched_repos',
			$watchedRepos.map(({ id, active }) => ({ id, active }))
		);
	}

	// Apply filters and search
	$: filteredNotifications.set(
		$githubNotifications.filter((notification) => {
			const subscription = $watchedRepos.find(
				(subscription) => subscription.id === notification.repoId
			);
			const searched = notification.title.toLowerCase().includes(search.toLowerCase());
			const isOfType = typeFilters.some(
				(filter) => filter.active && filter.type === notification.type
			);
			return (subscription ? subscription.active : others) && searched && isOfType;
		})
	);

	// Set notification numbers for each type
	$: {
		typeFilters = typeFilters.map((filter) => {
			filter.number = $githubNotifications.filter((n) => n.type === filter.type).length;
			return filter;
		});
	}

	function changeSelectAllFilters(active: boolean) {
		return () => {
			typeFilters = typeFilters.map((filter) => ({ ...filter, active }));
		};
	}

	function changeSelectAllWatchedRepos(active: boolean) {
		return () => {
			watchedRepos.update((previous) => previous.map((item) => ({ ...item, active })));
		};
	}

	onMount(async () => {
		// Get type filters from storage
		const savedTypeFilters = storage.get('type_filters');
		typeFilters = typeFilters.map((filter, index) => ({
			...filter,
			active: savedTypeFilters ? savedTypeFilters[index] : true
		}));
	});
</script>

<article class="sidebar">
	<img src="/images/sidebar-gradient.png" alt="" class="gradient" />
	<header class="header">
		<Logo />
		<h1 class="hero">GitLight</h1>
	</header>
	<div class="scrollable">
		{#if !$loading}
			<div class="wrapper">
				<SidebarSearch bind:search />
			</div>
			<Separator />
			<div class="wrapper">
				<div class="row">
					<h2 class="title">Filters</h2>
					{#if mostFiltersAreSelected}
						<button class="button" on:click={changeSelectAllFilters(false)}>Deselect all</button>
					{:else}
						<button class="button" on:click={changeSelectAllFilters(true)}>Select all</button>
					{/if}
				</div>
				{#each typeFilters as filter (filter.name)}
					<div class="switch-wrapper">
						<Switch bind:active={filter.active} label={filter.name} />
						<p class="filter-number">{filter.number}</p>
					</div>
				{/each}
			</div>
			<Separator />
			<div class="wrapper">
				<div class="row">
					<h2 class="title">Watching</h2>
					{#if mostReposAreSelected}
						<button class="button" on:click={changeSelectAllWatchedRepos(false)}
							>Deselect all</button
						>
					{:else}
						<button class="button" on:click={changeSelectAllWatchedRepos(true)}>Select all</button>
					{/if}
				</div>
				<WatchedRepos />
			</div>
			<Separator />
			<div class="wrapper">
				<h2 class="title">Manage</h2>
				<div class="double-button">
					<a href="https://github.com/watching" target="_blank" rel="noreferrer">Watching</a>
					<div />
					<a href="https://github.com/notifications/subscriptions" target="_blank" rel="noreferrer">
						Subscriptions
					</a>
				</div>
			</div>
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

	.header {
		padding: 3rem 2rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;

		:global(svg) {
			height: 2rem;
		}

		.hero {
			@include typography.heading-1;
		}
	}

	.scrollable {
		width: 20rem;
		padding: 0 2rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		height: 100%;
		overflow: auto;
		position: relative;
	}

	.gradient {
		position: absolute;
		inset: 0;
		z-index: -1;
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		.title {
			@include typography.bold;
		}
	}

	.row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
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

	.switch-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		.filter-number {
			color: variables.$grey-4;
		}
	}

	.double-button {
		@include mixins.shiny(variables.$grey-3, false);
		display: flex;
		justify-content: space-evenly;

		a {
			width: 100%;
			padding: 0.5rem;
			margin: 1px;
			border-radius: inherit;
			text-align: center;
			background-color: variables.$grey-3;
			transition: filter variables.$transition;

			&:nth-of-type(1) {
				border-top-right-radius: 0;
				border-bottom-right-radius: 0;
			}

			&:nth-of-type(2) {
				border-top-left-radius: 0;
				border-bottom-left-radius: 0;
			}

			&:hover {
				filter: brightness(130%);
			}
		}

		div {
			width: 1px;
			margin: 0.5rem 0;
			background-color: rgba(white, 0.1);
			z-index: 1;
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
