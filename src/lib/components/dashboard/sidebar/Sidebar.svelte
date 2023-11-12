<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Tooltip, ScrollbarContainer, IconButton } from '$lib/components';
	import { Logo, DoubleArrowIcon } from '$lib/icons';
	import {
		filteredNotifications,
		loading,
		watchedRepos,
		settings,
		watchedPersons,
		typeFilters,
		globalNotifications
	} from '$lib/stores';
	import SidebarProviders from './SidebarProviders.svelte';
	import SidebarSearch from './SidebarSearch.svelte';
	import TypeFilters from './TypeFilters.svelte';
	import WatchedPersons from './WatchedPersons.svelte';
	import WatchedRepos from './WatchedRepos.svelte';

	let search = '';
	let isMacos = false;

	$: showOnlyOpen = $settings.showOnlyOpen;

	// Apply filters and search
	$: $filteredNotifications = $globalNotifications.filter((notification) => {
		const repo = $watchedRepos.find((item) => item.id === notification.repository.id);
		const person = $watchedPersons.find(
			(item) => item.login === (notification.creator?.login || notification.author?.login)
		);

		const searched = notification.title.toLowerCase().includes(search.toLowerCase());
		const isOfType = $typeFilters.some(
			(filter) => filter.active && filter.type === notification.type
		);
		const onlyOpen = showOnlyOpen
			? notification.type === 'pr' || notification.type === 'issue'
				? notification.opened
				: true
			: true;
		return (
			(repo ? repo?.active : true) &&
			(person ? person?.active : true) &&
			searched &&
			isOfType &&
			onlyOpen
		);
	});

	// Toggle sidebar when Cmd+S or ctrl+S is pressed
	function toogleSidebar(event: KeyboardEvent) {
		if ((event.metaKey || event.ctrlKey) && event.key === 's') {
			event.preventDefault();
			$settings.sidebarHidden = !$settings.sidebarHidden;
		}
	}

	onMount(async () => {
		window.addEventListener('keydown', toogleSidebar);

		if (window.__TAURI__) {
			const { platform } = await import('@tauri-apps/api/os');
			const platformName = await platform();
			isMacos = platformName === 'darwin';
		}
	});

	onDestroy(() => {
		if (!browser) return;
		window.removeEventListener('keydown', toogleSidebar);
	});
</script>

<article class="sidebar">
	<header class="header" data-tauri-drag-region>
		<div class="logo-container" class:macos={isMacos}>
			<Logo />
			<h1 class="hero">GitLight</h1>
		</div>
		<Tooltip content="Hide sidebar" position="bottom right" hover>
			<IconButton on:click={() => ($settings.sidebarHidden = true)}>
				<DoubleArrowIcon />
			</IconButton>
		</Tooltip>
	</header>
	<div class="wrapper">
		<SidebarSearch bind:search />
	</div>
	<SidebarProviders />
	<div class="scrollable">
		{#if !$loading}
			<ScrollbarContainer margin="0.1rem">
				<TypeFilters />
				<WatchedRepos />
				<WatchedPersons />
				{#if $settings.providerView !== 'gitlab'}
					<div class="wrapper with-border">
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
				{/if}
			</ScrollbarContainer>
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
</article>

<style lang="scss">
	.sidebar {
		position: relative;
		display: flex;
		height: 100vh;
		flex: 0 0 20rem;
		flex-direction: column;
		border-right: 1px solid variables.$bg-3;

		&:not(:hover) .header :global(div):nth-last-child(1) {
			opacity: 0;
		}
	}

	.header {
		z-index: 1;
		display: flex;
		justify-content: space-between;
		padding: 1.1rem 1rem 0;

		.logo-container {
			display: flex;
			align-items: center;
			gap: 0.5rem;

			&.macos {
				padding-top: 1.5rem;
			}

			:global(svg) {
				height: 2rem;
			}

			.hero {
				@include typography.heading-2;
			}
		}

		:global(div):nth-last-child(1) {
			height: fit-content;
		}
	}

	.scrollable {
		position: relative;
		display: flex;
		overflow: hidden;
		width: 20rem;
		flex-direction: column;
		border-top: 1px solid variables.$bg-3;

		&:nth-child(1) {
			:global(div) {
				background-color: red;
			}
		}
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		padding: 1rem;
		gap: 1rem;

		&.with-border {
			padding: 2rem 1rem;
			border-top: 1px solid variables.$bg-3;
		}

		.title {
			@include typography.bold;
		}
	}

	.skeletons-container {
		display: flex;
		flex-direction: column;
		padding: 1rem;
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
		@include mixins.shiny('secondary');

		display: flex;
		justify-content: space-evenly;

		@include themes.light {
			&:hover::before {
				background-color: variables.$bg-2;
			}
		}

		@include themes.dark {
			&:hover::before {
				background-image: linear-gradient(variables.$bg-3, variables.$bg-2);
			}
		}

		a {
			z-index: 1;
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
				@include themes.light {
					background-color: variables.$bg-1;
				}

				@include themes.dark {
					background: variables.$bg-2;
				}
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
