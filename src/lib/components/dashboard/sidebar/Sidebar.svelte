<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Tooltip, ScrollbarContainer, Separator } from '~/lib/components';
	import { Github, Logo, ArrowRight } from '~/lib/icons';
	import { getAppVersion } from '~/lib/helpers';
	import {
		filteredNotifications,
		githubNotifications,
		loading,
		watchedRepos,
		settings,
		watchedPersons,
		typeFilters
	} from '~/lib/stores';
	import SidebarSearch from './SidebarSearch.svelte';
	import WatchedRepos from './WatchedRepos.svelte';
	import WatchedPersons from './WatchedPersons.svelte';
	import TypeFilters from './TypeFilters.svelte';
	import { browser } from '$app/environment';

	let search = '';

	// Apply filters and search
	$: $filteredNotifications = $githubNotifications.filter((notification) => {
		const repo = $watchedRepos.find((item) => item.id === notification.repoId);
		const person = $watchedPersons.find((item) => item.login === notification.author?.login);
		const searched = notification.title.toLowerCase().includes(search.toLowerCase());
		const isOfType = $typeFilters.some(
			(filter) => filter.active && filter.type === notification.type
		);
		const onlyOpen = $settings.showOnlyOpen
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
	<header class="header">
		<div class="logo-container">
			<Logo />
			<h1 class="hero">GitLight</h1>
		</div>
		<Tooltip content="Hide sidebar" position="bottom" hover>
			<button class="hide-button" on:click={() => ($settings.sidebarHidden = true)}>
				<ArrowRight />
			</button>
		</Tooltip>
	</header>
	<ScrollbarContainer>
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
	<footer class="footer">
		<p>v{getAppVersion()}</p>
		<a
			href="https://github.com/colinlienard/gitlight"
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
		padding: 3rem 2rem 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;
		z-index: 1;

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

		.hide-button {
			width: 2.25rem;
			height: 2.25rem;
			display: flex;
			align-items: center;
			justify-content: center;
			border-radius: variables.$radius;
			transition: background-color variables.$transition;

			&:hover {
				background-color: rgba(variables.$white, 0.05);
			}

			&:active {
				background-color: rgba(variables.$white, 0.1);
			}

			:global(svg) {
				height: 1.25rem;
				rotate: 180deg;
			}
		}
	}

	.scrollable {
		width: 20rem;
		padding: 0 2rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
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
			flex: 0 0 1px;
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
		margin-top: auto;

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
