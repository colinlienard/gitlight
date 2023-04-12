<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Notifications, Sidebar } from '~/lib/components';
	import { createEventData, fetchGithub } from '~/lib/helpers';
	import { githubEvents, loading, savedEventIds } from '~/lib/stores';
	import type { TEventSources, TGithubEvent } from '~/lib/types';

	let eventSources: TEventSources = [];
	let synced = false;
	let mounted = false;

	const interval = setInterval(() => {
		setEvents();
	}, 60000);

	async function setEvents() {
		synced = false;
		const promises = eventSources
			.filter(({ active }) => active)
			.map(({ name }) => fetchGithub(`repos/${name}/events?per_page=25`));
		const response = (await Promise.all(promises)).flat() as TGithubEvent[];
		const sorted = response.sort(
			(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		);
		githubEvents.set(
			sorted.map((event) => {
				const pinned = $savedEventIds?.pinned.includes(event.id) || false;
				const read = $savedEventIds?.read.includes(event.id) || false;
				const isNew = (!read && !$savedEventIds?.unread.includes(event.id)) || false;
				return createEventData(event, pinned, read, isNew);
			})
		);
		synced = true;
	}

	// Save events ids to localStorage
	$: if (mounted && $githubEvents.length) {
		const pinned = $githubEvents.filter((event) => event.pinned).map((event) => event.id);
		const unread = $githubEvents.filter((event) => !event.read).map((event) => event.id);
		const read = $githubEvents.filter((event) => event.read).map((event) => event.id);
		const toSave = { pinned, unread, read };
		savedEventIds.set(toSave);
		localStorage.setItem('githubEvents', JSON.stringify(toSave));
	}

	$: if (mounted) {
		// Save event sources to localStorage
		localStorage.setItem('eventSources', JSON.stringify(eventSources));

		// Refetch events
		(async () => {
			await setEvents();
			loading.set(false);
		})();
	}

	onMount(() => {
		// Get events ids from localStorage
		savedEventIds.set(
			JSON.parse(
				localStorage.getItem('githubEvents') || '{ "pinned": [], "unread": [], "read": [] }'
			)
		);

		// Get event sources from localStorage
		eventSources = JSON.parse(localStorage.getItem('eventSources') || '[]');

		mounted = true;
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
