<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Notifications, Sidebar } from '~/lib/components';
	import { createEventData, fetchGithub } from '~/lib/helpers';
	import { githubEvents, loading, savedEventIds } from '~/lib/stores';
	import type { TEventSources, TGithubEvent } from '~/lib/types';

	let eventSources: TEventSources = [];
	let synced = false;

	const interval = setInterval(() => {
		setEvents();
	}, 60000);

	async function setEvents() {
		synced = false;
		const promises = eventSources.map(({ name }) =>
			fetchGithub(`repos/${name}/events?per_page=50`)
		);
		const response = (await Promise.all(promises)).flat() as TGithubEvent[];
		const sorted = response.sort(
			(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		);
		githubEvents.set(
			sorted.map((event) => {
				const isPinned = $savedEventIds?.pinned.includes(event.id) || false;
				const isRead = $savedEventIds?.read.includes(event.id) || false;
				return createEventData(event, isPinned, isRead);
			})
		);
		synced = true;
	}

	$: if (eventSources?.length) {
		(async () => {
			await setEvents();
			loading.set(false);
		})();
	}

	onMount(async () => {
		// Get event sources from localStorage
		eventSources = JSON.parse(localStorage.getItem('eventSources') || '[]');
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="container">
	<Sidebar bind:eventSources />
	<Notifications {synced} />
</div>

<style lang="scss">
	.container {
		display: flex;
	}
</style>
