<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Tooltip, ScrollbarContainer, Separator, IconButton } from '$lib/components';
	import { Logo, DoubleArrowIcon } from '$lib/icons';
	import {
		filteredNotifications,
		githubNotifications,
		loading,
		watchedRepos,
		settings,
		watchedPersons,
		typeFilters
	} from '$lib/stores';
	import SidebarSearch from './SidebarSearch.svelte';
	import TypeFilters from './TypeFilters.svelte';
	import WatchedPersons from './WatchedPersons.svelte';
	import WatchedRepos from './WatchedRepos.svelte';

	let search = '';

	$: showPersonsAsCreators = $settings.showPersonsAsCreators;
	$: showOnlyOpen = $settings.showOnlyOpen;

	// Apply filters and search
	$: $filteredNotifications = $githubNotifications.filter((notification) => {
		const repo = $watchedRepos.find((item) => item.id === notification.repoId);
		const person = $watchedPersons.find(
			(item) =>
				item.login ===
				((showPersonsAsCreators && notification.creator?.login) || notification.author?.login)
		);

		const searched = notification.title.toLowerCase().includes(search.toLowerCase());
		const isOfType = $typeFilters.some(
			(filter) => filter.active && filter.type === notification.type
		);
		const onlyOpen = showOnlyOpen
			? notification.type === 'PullRequest' || notification.type === 'Issue'
				? notification.opened
				: true
			: true;
		return repo?.active && (person ? person?.active : true) && searched && isOfType && onlyOpen;
	});

	// Toggle sidebar when Cmd+S or ctrl+S is pressed
	function toogleSidebar(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 's') {
			$settings.sidebarHidden = !$settings.sidebarHidden;
		}
	}

	onMount(async () => {
		window.addEventListener('keydown', toogleSidebar);
	});

	onDestroy(() => {
		if (!browser) return;
		window.removeEventListener('keydown', toogleSidebar);
	});
</script>

<article class="sidebar">
	<img src="/images/small-light.webp" alt="" class="gradient" />
	<header class="header" data-tauri-drag-region>
		<div class="logo-container">
			<Logo />
			<h1 class="hero">GitLight</h1>
		</div>
		<Tooltip content="Hide sidebar" position="bottom" hover>
			<IconButton on:click={() => ($settings.sidebarHidden = true)}>
				<DoubleArrowIcon />
			</IconButton>
		</Tooltip>
	</header>
	<ScrollbarContainer margin="0.25rem">
		<div class="scrollable">
			{#if !$loading}
				<div class="wrapper">
					<SidebarSearch bind:search />
				</div>
				<Separator />
				<TypeFilters />
				<Separator />
				<WatchedRepos />
				<Separator />
				<WatchedPersons />
				<Separator />
				<div class="wrapper">
					<h2 class="title">Manage</h2>
					<div class="double-button">
						<a href="https://github.com/watching" target="_blank" rel="noreferrer">Watching</a>
						<div />
						<a
							href="https://github.com/notifications/subscriptions"
							target="_blank"
							rel="noreferrer"
						>
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
	</ScrollbarContainer>
</article>

<style lang="scss">
	.sidebar {
		position: relative;
		display: flex;
		height: 100vh;
		flex: 0 0 20rem;
		flex-direction: column;
		border-right: 1px solid variables.$grey-3;

		&::before {
			position: absolute;
			z-index: 1;
			height: 2rem;
			background-image: linear-gradient(transparent, variables.$grey-1 1rem);
			content: '';
			inset: auto 0 0;
			pointer-events: none;
		}
	}

	.header {
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 3rem 2rem 2rem;

		.logo-container {
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
	}

	.scrollable {
		position: relative;
		display: flex;
		width: 20rem;
		flex-direction: column;
		padding: 0 2rem 2rem;
		gap: 1.5rem;
	}

	.gradient {
		position: absolute;
		z-index: -1;
		inset: 0;
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
				width: 70%;
				height: 1.5rem;
			}
		}
	}

	.double-button {
		@include mixins.shiny(variables.$grey-3, false);

		display: flex;
		justify-content: space-evenly;

		a {
			width: 100%;
			padding: 0.5rem;
			border-radius: calc(variables.$radius - 1px);
			margin: 1px;
			text-align: center;
			transition: filter variables.$transition;

			&:nth-of-type(1) {
				border-bottom-right-radius: 0;
				border-top-right-radius: 0;
			}

			&:nth-of-type(2) {
				border-bottom-left-radius: 0;
				border-top-left-radius: 0;
			}

			&:hover {
				background-color: color.adjust(variables.$grey-3, $lightness: -2%);
			}
		}

		div {
			z-index: 1;
			flex: 0 0 1px;
			margin: 0.5rem 0;
			background-color: rgba(white, 0.1);
		}
	}
</style>
