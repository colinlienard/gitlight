<script lang="ts">
	import { onDestroy, onMount, type ComponentType, SvelteComponent } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { IconButton, Modal, ScrollbarContainer, Separator, Tooltip } from '$lib/components';
	import { fetchGithub, storage } from '$lib/features';
	import { getAppVersion } from '$lib/helpers';
	import { GearIcon } from '$lib/icons';
	import { settings } from '$lib/stores';
	import type { GithubRelease } from '$lib/types';
	import Accounts from './accounts';
	import App from './App.svelte';
	import GithubSettings from './GithubSettings.svelte';
	import Permissions from './permissions';
	import Preferences from './Preferences.svelte';

	// Cannot use generic type here
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	type Tabs = Array<{ name: string; strong?: boolean; component: ComponentType; props?: any }>;

	let mounted = false;
	let forceOpenSettings = false;
	let tabIndex = 0;
	let scrollContainer: SvelteComponent;
	let imageLoaded = false;
	let updateAvailable: string | false = false;

	$: tabs = [
		{ name: 'Preferences', component: Preferences },
		{
			name: 'GitHub settings',
			component: GithubSettings,
			props: { onSetTab: (number: number) => (tabIndex = number) }
		},
		{
			name: 'Permissions',
			component: Permissions,
			props: {
				onExpand: () => {
					setTimeout(() => {
						scrollContainer?.scrollTo({ top: 999, behavior: 'smooth' });
					}, 10);
				}
			}
		},
		{ name: 'Accounts', component: Accounts },
		{
			name: 'App',
			strong: !!updateAvailable,
			component: App,
			props: { updateAvailable, checkUpdate }
		}
	] as Tabs;

	const githubUser = $page.data.session?.githubUser;
	const gitlabUser = $page.data.session?.gitlabUser;

	// Check if an update is available every 30 min
	const interval = setInterval(checkUpdate, 1800000);

	async function checkUpdate() {
		if (!window.__TAURI__) return false;

		const release = await fetchGithub<GithubRelease>('repos/colinlienard/gitlight/releases/latest');
		const latest = release.tag_name.split('v')[1];
		const canUpdate = latest !== getAppVersion();
		if (canUpdate) {
			updateAvailable = latest;
		}
		return canUpdate;
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!browser) return;
		if (event.key === ',' && event.metaKey) {
			event.preventDefault();
			forceOpenSettings = !forceOpenSettings;
		} else if (event.key === 'Escape') {
			event.preventDefault();
			forceOpenSettings = false;
		}
	}

	function handleTrigger(tab: number) {
		return () => {
			tabIndex = tab;
			forceOpenSettings = true;
		};
	}

	onMount(async () => {
		const saved = storage.get('settings');
		if (saved) {
			$settings = { ...$settings, ...saved };
		} else {
			forceOpenSettings = true;
			tabIndex = 1;
		}
		mounted = true;

		window.addEventListener('keydown', handleKeyDown);
	});

	onDestroy(() => {
		clearInterval(interval);
		if (browser) {
			window.removeEventListener('keydown', handleKeyDown);
		}
	});

	$: if (mounted) {
		storage.set('settings', $settings);
	}

	$: {
		tabIndex;
		scrollContainer?.scrollTo && scrollContainer?.scrollTo({ top: 0 });
	}
</script>

<Tooltip content="Settings" hover position="bottom">
	<IconButton
		large
		rounded
		indicator={!!updateAvailable}
		on:click={handleTrigger((tabIndex = updateAvailable ? 4 : 0))}
	>
		<GearIcon />
	</IconButton>
</Tooltip>
<Tooltip content="Accounts" hover position="bottom">
	<button class="account-trigger" on:click={handleTrigger((tabIndex = 3))}>
		{#if githubUser}
			<img
				class="image"
				class:first={githubUser && gitlabUser}
				class:loaded={imageLoaded}
				src={githubUser?.avatar}
				alt=""
				on:load={() => (imageLoaded = true)}
			/>
		{/if}
		{#if gitlabUser}
			<img
				class="image"
				class:loaded={imageLoaded}
				src={gitlabUser?.avatar}
				alt=""
				on:load={() => (imageLoaded = true)}
			/>
		{/if}
	</button>
</Tooltip>

<Modal title="Settings" bind:open={forceOpenSettings}>
	<div class="content" slot="content">
		<ul class="tabs">
			{#each tabs as tab, index}
				<li class="tab" class:strong={tab.strong} class:active={tabIndex === index}>
					<button on:click={() => (tabIndex = index)}>
						{tab.name}
					</button>
				</li>
			{/each}
		</ul>
		<Separator vertical />
		<ScrollbarContainer bind:this={scrollContainer}>
			<div class="tab-content">
				<!-- @ts-expect-error -->
				<svelte:component this={tabs[tabIndex].component} {...tabs[tabIndex].props} />
			</div>
		</ScrollbarContainer>
	</div>
</Modal>

<style lang="scss">
	.account-trigger {
		display: flex;
		transition: opacity variables.$transition;

		&:hover {
			opacity: 0.75;
		}

		.image {
			width: 2rem;
			height: 2rem;
			border-radius: 50%;
			transition: opacity variables.$transition;

			&.first {
				z-index: 1;
				margin-right: -0.25rem;
				outline: 0.25rem solid variables.$grey-1;
			}

			&:not(.loaded) {
				opacity: 0;
			}
		}
	}

	.content {
		display: flex;
		height: 100%;
		padding: 2rem;
		gap: 2rem;

		.tabs {
			display: flex;
			width: 10rem;
			flex-direction: column;
			gap: 1.5rem;

			.tab {
				transition: color variables.$transition;

				&:not(:hover, .active) {
					color: variables.$grey-4;
				}

				&.strong button {
					@include mixins.link;
				}

				button {
					position: relative;
					width: 100%;
					text-align: left;
				}
			}
		}

		.tab-content {
			display: flex;
			flex-direction: column;
			padding-right: 1rem;
			gap: 1rem;

			:global(h3) {
				@include typography.bold;
			}
		}
	}
</style>
