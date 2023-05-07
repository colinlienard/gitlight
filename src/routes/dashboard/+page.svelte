<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { Main, Sidebar } from '~/lib/components';
	import { createNotificationData, fetchGithub } from '~/lib/helpers';
	import { githubNotifications, loading, savedEventIds } from '~/lib/stores';
	import type { GithubItem, GithubNotification, SavedNotifications } from '~/lib/types';
	import { sendNotification } from '@tauri-apps/api/notification';

	let synced = false;
	let mounted = false;

	const interval = setInterval(() => {
		setNotifications();
	}, 60000);

	async function setNotifications() {
		synced = false;

		let notifications = (await fetchGithub('notifications?all=true', {
			noCache: true
		})) as GithubNotification[];

		// Keep only new notifications
		if ($githubNotifications.length) {
			notifications = notifications.filter(
				(item) => !$githubNotifications.find((notification) => notification.id === item.id)
			);
		}

		if (notifications.length) {
			// Fetch additional data
			const datas = (await Promise.all(
				notifications.map((item) => (item.subject.url ? fetchGithub(item.subject.url) : null))
			)) as GithubItem[];

			const newNotifications = notifications.map((notification, index) =>
				createNotificationData(notification, datas[index], $savedEventIds as SavedNotifications)
			);

			// Send push notification
			if ($githubNotifications.length) {
				const { author, title, description } = newNotifications[0];
				sendNotification({
					title: `${author?.login}${author ? ' ' : ''}${description}`,
					body: title
				});
			}

			// Add new notifications to the store
			githubNotifications.update((previous) => [...newNotifications, ...previous]);
		}

		synced = true;
	}

	// Save events ids to localStorage
	$: if (mounted && $githubNotifications.length) {
		const pinned = $githubNotifications.filter((item) => item.pinned).map((item) => item.id);
		const unread = $githubNotifications.filter((item) => item.unread).map((item) => item.id);
		const toSave = { pinned, unread };
		savedEventIds.set(toSave);
		localStorage.setItem('githubNotifications', JSON.stringify(toSave));
	}

	onMount(async () => {
		// Get events ids from localStorage
		savedEventIds.set(
			JSON.parse(localStorage.getItem('githubNotifications') || '{ "pinned": [], "unread": [] }')
		);

		mounted = true;

		await setNotifications();
		loading.set(false);
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="container">
	<Sidebar />
	<Main {synced} />
</div>

<style lang="scss">
	.container {
		display: flex;
	}
</style>
