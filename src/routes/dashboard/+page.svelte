<script lang="ts">
	import { sendNotification } from '@tauri-apps/api/notification';
	import { invoke } from '@tauri-apps/api/tauri';
	import { onDestroy, onMount } from 'svelte';
	import { Error, Main, Sidebar } from '~/lib/components';
	import { createNotificationData, fetchGithub, storage } from '~/lib/helpers';
	import {
		error,
		githubNotifications,
		loading,
		savedNotifications,
		settings,
		watchedPersons,
		watchedRepos
	} from '~/lib/stores';
	import type {
		GithubNotification,
		NotificationData,
		WatchedPerson,
		WatchedRepo
	} from '~/lib/types';

	let synced = false;
	let mounted = false;
	let fetched = false;

	let interval = setInterval(() => {
		setNotifications();
	}, 60000);

	// Clear notifications and refetch when notification number changes
	$: notificationNumber = $settings.notificationNumber;
	$: if (mounted) {
		notificationNumber;
		if (!fetched) {
			fetched = true;
		} else {
			$githubNotifications = [];
			setNotifications();
			clearInterval(interval);
			interval = setInterval(() => {
				setNotifications();
			}, 60000);
		}
	}

	async function setNotifications() {
		synced = false;

		let newNotifications: NotificationData[] = [];

		try {
			// Fetch notifications from Github with multiple pages
			const { notificationNumber } = $settings;
			const exceed: number | false = notificationNumber > 50 ? notificationNumber - 50 : false;
			let [notifications, page2] = await Promise.all([
				fetchGithub<GithubNotification[]>(
					`notifications?all=true&page=1&per_page=${Math.min(notificationNumber, 50)}`,
					{ noCache: true }
				),
				exceed
					? fetchGithub<GithubNotification[]>(`notifications?all=true&page=2`, { noCache: true })
					: undefined
			]);
			if (page2 && exceed) {
				notifications.push(...page2.slice(0, exceed));
			}

			// Keep only new or modified notifications
			if ($githubNotifications.length) {
				notifications = notifications.filter(({ id, updated_at }) => {
					const current = $githubNotifications.find((item) => item.id === id);
					return current ? updated_at !== current.time : true;
				});
			}

			if (!notifications.length) return;

			newNotifications = (
				await Promise.all(
					notifications.map((notification) =>
						createNotificationData(notification, $savedNotifications, !$githubNotifications.length)
					)
				)
			).filter((item): item is NotificationData => !!item);
		} catch (e) {
			$error =
				'An error occurred while fetching notifications. Please try to reload the page or log out and log in again.';
			console.error(e);
		} finally {
			synced = true;
		}

		if (!newNotifications.length) return;

		// Send push notification and update tray icon
		const pushNotification = newNotifications[0];
		if (
			window.__TAURI__ &&
			$githubNotifications.length &&
			pushNotification.unread &&
			$settings.activateNotifications
		) {
			const { author, title, description, repo } = pushNotification;
			sendNotification({
				title: `${repo}: ${author ? `${author.login} ` : ''}${description}`,
				body: title
			});
			invoke('update_tray', { newIcon: true });
		}

		// Remove duplicates and add new notifications to the store
		$githubNotifications = [
			...newNotifications,
			...$githubNotifications.filter((item) => !newNotifications.find((n) => n.id === item.id))
		];

		// Update watched repos
		const savedWatchedRepos = storage.get('github-watched-repos');
		$watchedRepos = $githubNotifications.reduce<WatchedRepo[]>((previous, current) => {
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
		}, []);

		// Update watched persons
		const savedWatchedPersons = storage.get('github-watched-persons');
		$watchedPersons = $githubNotifications
			.reduce<WatchedPerson[]>((previous, current) => {
				if (!current.author) return previous;
				const index = previous.findIndex((person) => person.login === current?.author?.login);
				if (index > -1) {
					const person = previous.splice(index, 1)[0];
					return [...previous, { ...person, number: person.number + 1 }];
				}
				return [
					...previous,
					{
						login: current.author?.login ?? '',
						avatar: current.author?.avatar ?? '',
						number: 1,
						bot: current.author.bot,
						active:
							savedWatchedPersons?.find((person) => person.login === current.author?.login)
								?.active ?? true
					}
				];
			}, [])
			.sort((a, b) => b.number - a.number);
	}

	$: if (mounted && $githubNotifications.length) {
		// Save events ids to storage
		const toSave = $githubNotifications.map(
			({ id, description, author, pinned, unread, done, time, previously }) => ({
				id,
				description,
				author,
				pinned,
				unread,
				done,
				time,
				previously
			})
		);
		$savedNotifications = toSave;
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
		$savedNotifications = storage.get('github-notifications') || [];

		mounted = true;

		await setNotifications();
		$loading = false;
	});

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<svelte:head>
	<title>GitLight • Dashboard</title>
</svelte:head>

<div class="container" class:sidebar-hidden={$settings.sidebarHidden}>
	<Sidebar />
	<Main {synced} />
	<Error />
</div>

<style lang="scss">
	:global(body) {
		overflow: hidden;
	}

	.container {
		display: flex;
		width: 100vw;
		transition: ease-in-out 0.3s;

		&.sidebar-hidden {
			width: calc(100vw + 20rem);
			translate: -20rem;
		}
	}
</style>
