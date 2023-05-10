<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { invoke } from '@tauri-apps/api/tauri';
	import { sendNotification } from '@tauri-apps/api/notification';
	import { Main, Sidebar } from '~/lib/components';
	import { createNotificationData, fetchGithub, storage } from '~/lib/helpers';
	import {
		githubNotifications,
		loading,
		savedEventIds,
		settings,
		watchedRepos
	} from '~/lib/stores';
	import type {
		GithubItem,
		GithubNotification,
		SavedNotifications,
		WatchedRepo
	} from '~/lib/types';

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

			const savedDates = storage.get('github-notification-dates') || {};
			const newNotifications = notifications.map((notification, index) =>
				createNotificationData(
					notification,
					datas[index],
					$savedEventIds as SavedNotifications,
					savedDates[notification.id]
				)
			);

			// Send push notification
			if (window.__TAURI__ && $githubNotifications.length && $settings.activateNotifications) {
				const { author, title, description, repo, ownerAvatar } = newNotifications[0];
				sendNotification({
					title: `${repo}: ${author ? `${author.login} ` : ''}${description}`,
					body: title,
					icon: ownerAvatar
				});
			}

			// Add new notifications to the store
			githubNotifications.update((previous) => [...newNotifications, ...previous]);

			// Save notification dates to storage
			storage.set(
				'github-notification-dates',
				Object.fromEntries(newNotifications.map((item) => [item.id, item.time]))
			);

			// Update watched repos
			const savedWatchedRepos = storage.get('github-watched-repos');
			watchedRepos.set(
				$githubNotifications.reduce<WatchedRepo[]>((previous, current) => {
					const index = previous.findIndex((repo) => repo.id === current.repoId);
					if (index > -1) {
						const repo = previous.splice(index, 1)[0];
						return [...previous, { ...repo, number: repo.number + 1 }];
					}
					return [
						...previous,
						{
							id: current.repoId,
							name: current.repo,
							ownerName: current.owner,
							ownerAvatar: current.ownerAvatar,
							number: 1,
							active: savedWatchedRepos?.find((repo) => repo.id === current.repoId)?.active ?? true
						}
					];
				}, [])
			);
		}

		synced = true;
	}

	$: if (mounted && $githubNotifications.length) {
		const pinned = $githubNotifications.filter((item) => item.pinned).map((item) => item.id);
		const unread = $githubNotifications.filter((item) => item.unread).map((item) => item.id);

		// Save events ids to storage
		const toSave = { pinned, unread };
		savedEventIds.set(toSave);
		storage.set('github-notifications', toSave);

		// Update menu bar
		if (window.__TAURI__) {
			invoke('update_tray', {
				title: `${pinned.length + unread.length}`,
				description: `${pinned.length} pinned • ${unread.length} unread`
			});
		}
	}

	onMount(async () => {
		// Get events ids from storage
		savedEventIds.set(storage.get('github-notifications') || { pinned: [], unread: [] });

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
