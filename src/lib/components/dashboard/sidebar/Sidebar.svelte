<script lang="ts">
	import { ExternalLink, Github, Logo } from '~/lib/icons';
	import { Button, Separator, Switch, WatchedRepos } from '~/lib/components';
	import { onMount } from 'svelte';
	import { getAppVersion } from '~/lib/helpers';
	import { filteredNotifications, githubNotifications, loading } from '~/lib/stores';
	import { browser } from '$app/environment';
	import SidebarSearch from './SidebarSearch.svelte';
	import type { TypeFilters, WatchedRepo } from '~/lib/types';

	let search = '';
	let typeFilters: TypeFilters = [
		{ name: 'Pull requests', type: 'PullRequest', active: true, number: 0 },
		{ name: 'Issues', type: 'Issue', active: true, number: 0 },
		{ name: 'Commits', type: 'Commit', active: true, number: 0 },
		{ name: 'Discussions', type: 'Discussion', active: true, number: 0 },
		{ name: 'Releases', type: 'Release', active: true, number: 0 }
	];
	let watchedRepos: WatchedRepo[] = [];
	let others = true;

	$: mostAreSelected = typeFilters.filter((filter) => filter.active).length > 3;

	// Save type filters to localStorage
	$: if (browser && !$loading) {
		localStorage.setItem('typeFilters', JSON.stringify(typeFilters.map((filter) => filter.active)));
	}

	// Set watched repos
	$: if (browser && !watchedRepos.length) {
		const savedWatchedRepos = JSON.parse(localStorage.getItem('githubWatchedRepos') || '[]') as {
			id: string;
			active: boolean;
		}[];
		watchedRepos = $githubNotifications.reduce<WatchedRepo[]>((previous, current) => {
			const index = previous.findIndex((repo) => repo.id === current.repoId);
			if (index > -1) {
				const repo = previous.splice(index, 1)[0];
				return [...previous, { ...repo, number: repo.number + 1 }];
			}
			return [
				...previous,
				{
					id: current.repoId,
					name: current.repo,
					ownerName: current.owner,
					ownerAvatar: current.ownerAvatar,
					number: 1,
					active: savedWatchedRepos.find((repo) => repo.id === current.repoId)?.active ?? true
				}
			];
		}, []);
	}

	// Save watched repos to localStorage
	$: if (browser && !$loading) {
		localStorage.setItem(
			'githubWatchedRepos',
			JSON.stringify(watchedRepos.map(({ id, active }) => ({ id, active })))
		);
	}

	// Apply filters and search
	$: filteredNotifications.set(
		$githubNotifications.filter((notification) => {
			const subscription = watchedRepos.find(
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

	function changeSelectAll(active: boolean) {
		return () => {
			typeFilters = typeFilters.map((filter) => ({ ...filter, active }));
		};
	}

	onMount(async () => {
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
			<h1 class="hero">GitLight</h1>
		</header>
		{#if !$loading}
			<div class="wrapper">
				<h2 class="title">Filters</h2>
				<SidebarSearch bind:search />
				<Separator />
				{#if mostAreSelected}
					<button class="button" on:click={changeSelectAll(false)}>Deselect all</button>
				{:else}
					<button class="button" on:click={changeSelectAll(true)}>Select all</button>
				{/if}
				{#each typeFilters as filter (filter.name)}
					<div class="switch-wrapper">
						<Switch bind:active={filter.active} label={filter.name} />
						<p class="filter-number">{filter.number}</p>
					</div>
				{/each}
			</div>
			<div class="wrapper">
				<h2 class="title">Watching</h2>
				<WatchedRepos bind:watchedRepos />
				<Button type="secondary" small href="https://github.com/watching" external>
					<ExternalLink />
					Manage watched
				</Button>
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

	.scrollable {
		width: 20rem;
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

		.hero {
			@include typography.heading-1;
		}
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		.title {
			@include typography.bold;
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

	.switch-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		.filter-number {
			color: variables.$grey-4;
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
