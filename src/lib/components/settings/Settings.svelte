<script lang="ts">
	import { invoke } from '@tauri-apps/api/tauri';
	import { onDestroy, onMount, type ComponentType, SvelteComponent } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { IconButton, Modal, ScrollbarContainer, Tooltip } from '$lib/components';
	import { fetchGithub, storage } from '$lib/features';
	import { getAppVersion } from '$lib/helpers';
	import { GearIcon } from '$lib/icons';
	import { settings } from '$lib/stores';
	import type { GithubRelease } from '$lib/types';
	import Accounts from './accounts';
	import App from './App.svelte';
	import GithubSettings from './github-settings';
	import GitlabSettings from './gitlab-settings';
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

	const githubUser = $page.data.session?.githubUser;
	const gitlabUser = $page.data.session?.gitlabUser;

	$: tabs = [
		{ name: 'Preferences', component: Preferences },
		...(githubUser
			? [
					{
						name: 'GitHub settings',
						component: GithubSettings,
						props: {
							onExpand() {
								setTimeout(() => {
									scrollContainer?.scrollTo({ top: 999, behavior: 'smooth' });
								}, 10);
							}
						}
					}
				]
			: []),
		...(gitlabUser ? [{ name: 'GitLab settings', component: GitlabSettings }] : []),
		{ name: 'Accounts', component: Accounts },
		{
			name: 'App',
			strong: !!updateAvailable,
			component: App,
			props: { updateAvailable, checkUpdate }
		}
	] as Tabs;

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
			$settings.providerView = githubUser ? 'github' : 'gitlab';
			forceOpenSettings = true;
			tabIndex = 1;
		}
		mounted = true;

		if (window.__TAURI__) {
			invoke('toggle_tray', { show: $settings.activeTray });
		}

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
		on:click={handleTrigger(updateAvailable ? tabs.length - 1 : 0)}
	>
		<GearIcon />
	</IconButton>
</Tooltip>
<Tooltip content="Accounts" hover position="bottom right">
	<button class="account-trigger" on:click={handleTrigger(tabs.length - 2)}>
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
		<div class="separator" />
		<ScrollbarContainer margin="2rem 1rem" bind:this={scrollContainer}>
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
			@include mixins.broken-img;

			width: 2rem;
			height: 2rem;
			border-radius: 50%;
			transition: opacity variables.$transition;

			&.first {
				z-index: 1;
				margin-right: -0.25rem;
				outline: 0.25rem solid variables.$bg-1;
			}

			&:not(.loaded) {
				opacity: 0;
			}
		}
	}

	.content {
		display: flex;
		height: 100%;

		.tabs {
			display: flex;
			width: 14rem;
			flex-direction: column;
			padding: 2rem;
			gap: 1.5rem;

			.tab {
				transition: color variables.$transition;

				&:not(:hover, .active) {
					color: variables.$bg-5;
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

		.separator {
			width: 1px;
			padding: 2rem 0;
		}

		.tab-content {
			display: flex;
			flex-direction: column;
			padding: 2rem;
			gap: 1rem;

			:global(h3) {
				@include typography.bold;
			}
		}
	}
</style>
