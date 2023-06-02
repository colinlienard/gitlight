<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { invoke } from '@tauri-apps/api/tauri';
	import { sendNotification } from '@tauri-apps/api/notification';
	import { Main, Sidebar } from '~/lib/components';
	import { createNotificationData, fetchGithub, storage } from '~/lib/helpers';
	import {
		githubNotifications,
		loading,
		savedNotifications,
		settings,
		watchedRepos
	} from '~/lib/stores';
	import type { GithubItem, GithubNotification, WatchedRepo } from '~/lib/types';

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
				(item) =>
					item.unread || !$githubNotifications.find((notification) => notification.id === item.id)
			);
		}

		if (notifications.length) {
			// Fetch additional data
			const datas = (await Promise.all(
				notifications.map((item) => (item.subject.url ? fetchGithub(item.subject.url) : null))
			)) as GithubItem[];

			const newNotifications = notifications.map((notification, index) =>
				createNotificationData(notification, datas[index], $savedNotifications)
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

			// Add new notifications to the store and remove duplicates
			githubNotifications.update((previous) => [
				...newNotifications,
				...previous.filter((item) => !newNotifications.find((n) => n.id === item.id))
			]);

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
		// Save events ids to storage
		const toSave = $githubNotifications.map(
			({ id, description, author, pinned, unread, time, previously }) => ({
				id,
				description,
				author,
				pinned,
				unread,
				time,
				previously
			})
		);
		savedNotifications.set(toSave);
		storage.set('github-notifications', toSave);

		// Update menu bar
		if (window.__TAURI__) {
			const pinned = $githubNotifications.filter(({ pinned }) => pinned);
			const unread = $githubNotifications.filter(({ pinned, unread }) => !pinned && unread);
			invoke('update_tray', {
				title: `${unread.length}`,
				description: `${unread.length} unread • ${pinned.length} pinned`
			});
		}
	}

	onMount(async () => {
		// Get events ids from storage
		savedNotifications.set(storage.get('github-notifications') || []);

		mounted = true;

		await setNotifications();
		loading.set(false);
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<svelte:head>
	<title>GitLight • Dashboard</title>
</svelte:head>

<div class="container">
	<Sidebar />
	<Main {synced} />
</div>

<style lang="scss">
	:global(body) {
		overflow: hidden;
	}

	.container {
		display: flex;
	}
</style>
