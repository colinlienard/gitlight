<script lang="ts">
	import { page } from '$app/stores';
	import { Modal, Separator } from '~/lib/components';
	import { onDestroy, onMount, type ComponentType } from 'svelte';
	import { settings } from '~/lib/stores';
	import { storage } from '~/lib/helpers';
	import { browser } from '$app/environment';
	import Accounts from './Accounts.svelte';
	import GithubSettings from './GithubSettings.svelte';
	import Preferences from './Preferences.svelte';

	let mounted = false;
	let forceOpenSettings = false;
	let currentTab = 0;

	const user = $page.data.session?.user;
	const tabs: Array<{ name: string; component: ComponentType }> = [
		{ name: 'Preferences', component: Preferences },
		{ name: 'Accounts', component: Accounts },
		{ name: 'GitHub settings', component: GithubSettings }
	];

	function handleKeyDown(event: KeyboardEvent) {
		if (browser && event.key === ',' && event.metaKey) {
			event.preventDefault();
			forceOpenSettings = !forceOpenSettings;
		}
	}

	onMount(() => {
		const saved = storage.get('settings');
		if (saved) {
			settings.set(saved);
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
</script>

<Modal title="Settings" bind:open={forceOpenSettings}>
	<button slot="trigger">
		<img class="trigger" src={user?.avatar} alt="" />
	</button>
	<div class="content" slot="content">
		<ul class="tabs">
			{#each tabs as tab, index}
				<li class="tab" class:active={currentTab === index}>
					<button on:click={() => (currentTab = index)}>
						{tab.name}
					</button>
				</li>
			{/each}
		</ul>
		<Separator vertical />
		<svelte:component this={tabs[currentTab].component} />
	</div>
</Modal>

<style lang="scss">
	.trigger {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background-color: variables.$grey-2;
		transition: opacity variables.$transition;

		&:hover {
			opacity: 0.75;
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
			}
		}
	}
</style>
