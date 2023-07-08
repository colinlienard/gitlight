<script lang="ts">
	import { onDestroy, onMount, type ComponentType, SvelteComponent } from 'svelte';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import { Modal, ScrollbarContainer, Separator } from '~/lib/components';
	import { fetchGithub, getAppVersion, storage } from '~/lib/helpers';
	import { GearIcon } from '~/lib/icons';
	import { settings, settingsTab, updateAvailable } from '~/lib/stores';
	import type { GithubRelease } from '~/lib/types';
	import Accounts from './Accounts.svelte';
	import GithubSettings from './GithubSettings.svelte';
	import Permissions from './permissions';
	import Preferences from './Preferences.svelte';
	import Update from './Update.svelte';

	let mounted = false;
	let forceOpenSettings = false;
	let scrollContainer: SvelteComponent;
	let imageLoaded = false;

	$: tabs = [
		{ name: 'Preferences', component: Preferences },
		{ name: 'GitHub settings', component: GithubSettings },
		{ name: 'Permissions', component: Permissions },
		{ name: 'Accounts', component: Accounts },
		...(browser && window.__TAURI__
			? [{ name: 'Update', strong: !!$updateAvailable, component: Update }]
			: [])
	] satisfies Array<{ name: string; strong?: boolean; component: ComponentType }>;

	const user = $page.data.session?.user;

	// Check if an update is available every hour
	const interval = setInterval(async () => {
		if (!window.__TAURI__) return;

		const release = await fetchGithub<GithubRelease>('repos/colinlienard/gitlight/releases/latest');
		const latest = release.tag_name.split('v')[1];
		if (latest !== getAppVersion()) {
			$updateAvailable = latest;
		}
	}, 3600000);

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
			$settingsTab = tab;
			forceOpenSettings = true;
		};
	}

	onMount(async () => {
		const saved = storage.get('settings');
		if (saved) {
			$settings = { ...$settings, ...saved };
		} else {
			forceOpenSettings = true;
			$settingsTab = 1;
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
		$settingsTab;
		scrollContainer?.scrollTo && scrollContainer?.scrollTo(0, 0);
	}
</script>

<div class="triggers">
	<button
		class="preferences-trigger"
		on:click={handleTrigger(($settingsTab = $updateAvailable ? 4 : 0))}
	>
		<GearIcon />
		{#if $updateAvailable}
			<div class="indicator" />
		{/if}
	</button>
	<button class="account-trigger" on:click={handleTrigger(($settingsTab = 3))}>
		<img
			class="image"
			class:loaded={imageLoaded}
			src={user?.avatar}
			alt=""
			on:load={() => (imageLoaded = true)}
		/>
	</button>
</div>

<Modal title="Settings" bind:open={forceOpenSettings}>
	<div class="content" slot="content">
		<ul class="tabs">
			{#each tabs as tab, index}
				<li class="tab" class:strong={tab.strong} class:active={$settingsTab === index}>
					<button on:click={() => ($settingsTab = index)}>
						{tab.name}
					</button>
				</li>
			{/each}
		</ul>
		<Separator vertical />
		<ScrollbarContainer bind:this={scrollContainer}>
			<div class="tab-content">
				<svelte:component this={tabs[$settingsTab].component} />
			</div>
		</ScrollbarContainer>
	</div>
</Modal>

<style lang="scss">
	.triggers {
		display: flex;
		gap: 1rem;

		.preferences-trigger {
			position: relative;
			display: flex;
			width: 2rem;
			height: 2rem;
			align-items: center;
			justify-content: center;
			border-radius: 50%;
			transition: background-color variables.$transition;

			&:hover {
				background-color: variables.$grey-3;
			}

			:global(svg) {
				height: 1.25rem;
			}

			.indicator {
				position: absolute;
				width: 0.75rem;
				height: 0.75rem;
				border-radius: 50%;
				background-color: variables.$blue-2;
				inset: 0 auto auto 0;
			}
		}

		.account-trigger {
			transition: opacity variables.$transition;

			&:hover {
				opacity: 0.75;
			}

			.image {
				width: 2rem;
				height: 2rem;
				border-radius: 50%;
				transition: opacity variables.$transition;

				&:not(.loaded) {
					opacity: 0;
				}
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
