<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Notifications, Sidebar } from '~/lib/components';
	import { fetchGithub } from '~/lib/helpers';
	import { githubNotifications, loading, savedEventIds } from '~/lib/stores';
	import type { EventSources, GithubNotification } from '~/lib/types';

	let eventSources: EventSources = [];
	let synced = false;
	let mounted = false;

	const interval = setInterval(() => {
		setEvents();
	}, 60000);

	async function setEvents() {
		synced = false;
		const response = (await fetchGithub('notifications?all=true', true)) as GithubNotification[];
		githubNotifications.set(
			response.map((notification) => {
				const pinned = $savedEventIds?.pinned.includes(notification.id) || false;
				const isNew =
					(notification.unread && !$savedEventIds?.unread.includes(notification.id)) || false;
				return { ...notification, pinned, isNew };
			})
		);
		synced = true;
	}

	// Save events ids to localStorage
	// $: if (mounted && $githubNotifications.length) {
	// 	const pinned = $githubNotifications.filter((event) => event.pinned).map((event) => event.id);
	// 	const unread = $githubNotifications.filter((event) => !event.read).map((event) => event.id);
	// 	const read = $githubNotifications.filter((event) => event.read).map((event) => event.id);
	// 	const toSave = { pinned, unread, read };
	// 	savedEventIds.set(toSave);
	// 	localStorage.setItem('githubNotifications', JSON.stringify(toSave));
	// }

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
				localStorage.getItem('githubNotifications') || '{ "pinned": [], "unread": [], "read": [] }'
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
