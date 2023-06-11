<script lang="ts">
	import { page } from '$app/stores';
	import { Modal, ScrollbarContainer, Separator } from '~/lib/components';
	import { onDestroy, onMount, type ComponentType } from 'svelte';
	import { settings, updateAvailable } from '~/lib/stores';
	import { fetchGithub, getAppVersion, storage } from '~/lib/helpers';
	import { browser } from '$app/environment';
	import Accounts from './Accounts.svelte';
	import GithubSettings from './GithubSettings.svelte';
	import Preferences from './Preferences.svelte';
	import Update from './Update.svelte';
	import type { GithubRelease } from '~/lib/types';

	let mounted = false;
	let forceOpenSettings = false;
	let currentTab = 0;
	$: tabs = [
		{ name: 'Preferences', component: Preferences },
		{ name: 'GitHub settings', component: GithubSettings },
		{ name: 'Accounts', component: Accounts },
		{ name: 'Update', indicator: !!$updateAvailable, component: Update }
	] satisfies Array<{ name: string; indicator?: boolean; component: ComponentType }>;

	const user = $page.data.session?.user;

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

	onMount(async () => {
		const saved = storage.get('settings');
		if (saved) {
			settings.set(saved);
		} else {
			forceOpenSettings = true;
			currentTab = 1;
		}
		mounted = true;

		window.addEventListener('keydown', handleKeyDown);
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('keydown', handleKeyDown);
		}
	});

	$: if (mounted) {
		storage.set('settings', $settings);
	}

	$: if (forceOpenSettings) {
		currentTab = storage.has('settings') ? 0 : 1;

		(async () => {
			if (!window.__TAURI__) return;

			const release = await fetchGithub<GithubRelease>(
				'https://api.github.com/repos/colinlienard/gitlight/releases/latest'
			);
			const latest = release.tag_name.split('v')[1];
			if (latest !== getAppVersion()) {
				$updateAvailable = latest;
			}
		})();
	}
</script>

<Modal title="Settings" bind:open={forceOpenSettings}>
	<button class="trigger" slot="trigger">
		<img class="image" src={user?.avatar} alt="" />
		{#if $updateAvailable}
			<div class="indicator" />
		{/if}
	</button>
	<div class="content" slot="content">
		<ul class="tabs">
			{#each tabs as tab, index}
				<li class="tab" class:active={currentTab === index}>
					<button on:click={() => (currentTab = index)}>
						{tab.name}
						{#if tab.indicator}
							<div class="indicator">1</div>
						{/if}
					</button>
				</li>
			{/each}
		</ul>
		<Separator vertical />
		<ScrollbarContainer>
			<div class="tab-content">
				<svelte:component this={tabs[currentTab].component} />
			</div>
		</ScrollbarContainer>
	</div>
</Modal>

<style lang="scss">
	.trigger {
		position: relative;
		transition: opacity variables.$transition;

		&:hover {
			opacity: 0.75;
		}

		.image {
			width: 2rem;
			height: 2rem;
			border-radius: 50%;
			background-color: variables.$grey-2;
		}

		.indicator {
			width: 1rem;
			height: 1rem;
			border-radius: 50%;
			background-color: variables.$blue-2;
			position: absolute;
			inset: -0.25rem auto auto -0.25rem;
			box-shadow: 0 0 0.5rem variables.$grey-2;
			animation: pulse 1s infinite ease-in-out;

			@keyframes pulse {
				0% {
					scale: 0.75;
				}
				50% {
					scale: 1;
				}
				100% {
					scale: 0.75;
				}
			}
		}
	}

	.content {
		display: flex;
		gap: 2rem;
		height: 100%;

		.tabs {
			display: flex;
			flex-direction: column;
			gap: 1.5rem;
			width: 10rem;

			.tab {
				transition: color variables.$transition;

				&:not(:hover, .active) {
					color: variables.$grey-4;
				}

				button {
					position: relative;

					.indicator {
						@include typography.small;
						@include typography.bold;
						width: 1.5rem;
						height: 1.5rem;
						border-radius: 50%;
						background-color: variables.$blue-2;
						display: flex;
						align-items: center;
						justify-content: center;
						color: variables.$white;
						position: absolute;
						inset: -0.2rem auto auto calc(100% + 0.5rem);
					}
				}
			}
		}

		.tab-content {
			display: flex;
			flex-direction: column;
			gap: 1rem;

			:global(h3) {
				@include typography.bold;
			}
		}
	}
</style>
