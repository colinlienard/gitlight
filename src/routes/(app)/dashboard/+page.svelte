<script lang="ts">
	import { sendNotification } from '@tauri-apps/api/notification';
	import { invoke } from '@tauri-apps/api/tauri';
	import { onDestroy, onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import {
		Banner,
		DoneModal,
		Error,
		GithubLoginButton,
		GitlabLoginButton,
		Main,
		Priorities,
		Settings,
		Sidebar,
		Tooltip
	} from '$lib/components';
	import {
		createGithubNotificationData,
		fetchGithub,
		fetchGitlab,
		createGitlabNotificationData,
		type StorageMap
	} from '$lib/features';
	import { GithubIcon, GitlabIcon, Logo, RefreshIcon } from '$lib/icons';
	import {
		error,
		filteredNotifications,
		githubNotifications,
		gitlabNotifications,
		globalNotifications,
		loading,
		settings
	} from '$lib/stores';
	import type { GithubNotification, GitlabEvent, NotificationData } from '$lib/types';

	const githubUser = $page.data.session?.githubUser;
	const gitlabUser = $page.data.session?.gitlabUser;

	let synced = false;
	let syncTime = 0;
	let syncInterval: ReturnType<typeof setInterval>;
	let mounted = false;

	let interval = setInterval(() => {
		fetchAll();
	}, 60000);

	$: if (synced && !syncTime) {
		syncInterval = setInterval(() => {
			syncTime += 1;
		}, 1000);
	} else if (!synced) {
		syncTime = 0;
		clearInterval(syncInterval);
	}

	function notificationIsMuted(
		{ author, creator, repoId, muted }: NotificationData,
		persons: StorageMap['github-watched-persons'],
		repos: StorageMap['github-watched-repos']
	) {
		const currentAuthor = persons.find(({ login }) => login === author?.login);
		const currentCreator = persons.find(({ login }) => login === creator?.login);
		const repo = repos.find(({ id }) => id === repoId);
		return (currentAuthor ? currentAuthor.muted : currentCreator?.muted) || repo?.muted || muted;
	}

	$: providerView = $settings.providerView;
	$: {
		let notifications = [
			...(providerView !== 'gitlab' ? $githubNotifications : []),
			...(providerView !== 'github' ? $gitlabNotifications : [])
		];
		if (providerView === 'both') {
			notifications = notifications.sort(
				(a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
			);
		}
		$globalNotifications = notifications;
	}

	function refetch() {
		// Clear and refetch notifications
		$githubNotifications = [];
		fetchAll();

		// Reset interval
		clearInterval(interval);
		interval = setInterval(() => {
			fetchAll();
		}, 60000);
	}

	async function fetchAll() {
		synced = false;

		await Promise.all([fetchGithubNotifications(), fetchGitlabNotifications()]);

		synced = true;
	}

	async function fetchGithubNotifications() {
		if (!githubUser) return;

		let newNotifications: NotificationData[] = [];
		const savedNotifications = storage.get('github-notifications') || [];
		const persons = storage.get('github-watched-persons') || [];
		const repos = storage.get('github-watched-repos') || [];

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
						createGithubNotificationData(
							notification,
							savedNotifications,
							!$githubNotifications.length
						)
					)
				)
			)
				.filter((item): item is NotificationData => !!item)
				// If the notification is muted, do not update its status
				.map((item) => {
					const muted = notificationIsMuted(item, persons, repos);
					const previous = savedNotifications.find((n) => n.id === item.id);
					const unread = muted ? previous?.unread || false : item.unread;
					const done = unread ? false : item.done;
					return { ...item, unread, done };
				});
		} catch (e) {
			$error =
				'An error occurred while fetching notifications. Please try to reload the page or log out and log in again.';
			console.error(e);
		}

		if (!newNotifications.length) return;

		const firstFetch = !$githubNotifications.length;

		// Remove duplicates and add new notifications to the store
		$githubNotifications = [
			...newNotifications,
			...$githubNotifications.filter((item) => !newNotifications.find((n) => n.id === item.id))
		];

		if (!window.__TAURI__ || firstFetch || !$settings.activateNotifications) return;

		// Send push notification and update tray icon
		const unmutedNotifications = newNotifications.filter(
			(item) => !notificationIsMuted(item, persons, repos)
		);
		const pushNotification = unmutedNotifications[0];
		if (pushNotification?.unread && !pushNotification?.muted) {
			const { author, title, description } = pushNotification;
			sendNotification({
				title,
				body: `${author ? `${author.login} ` : ''}${description.replace(/(\*|_)/g, '')}`
			});
			invoke('update_tray', { newIcon: true });
		}
	}

	async function fetchGitlabNotifications() {
		if (!gitlabUser) return;

		synced = false;

		let newNotifications: NotificationData[] = [];

		try {
			let notifications = await fetchGitlab<GitlabEvent[]>(
				`projects/colinlienard1%2Fgitlab-test/events`
			);
			console.log('vanilla notifications', notifications);

			// Keep only new or modified notifications
			if ($gitlabNotifications.length) {
				notifications = notifications.filter(({ id, created_at }) => {
					const current = $githubNotifications.find((item) => item.id === id.toString());
					return current ? created_at !== current.time : true;
				});
			}

			newNotifications = (
				await Promise.all(
					notifications.map((event) =>
						createGitlabNotificationData(
							event,
							storage.get('gitlab-notifications') || [],
							!$gitlabNotifications.length
						)
					)
				)
			).filter((item): item is NotificationData => !!item);
			console.log(newNotifications);
		} catch (e) {
			$error =
				'An error occurred while fetching notifications. Please try to reload the page or log out and log in again.';
			console.error(e);
		}

		if (!newNotifications.length) return;

		const firstFetch = !$gitlabNotifications.length;

		// Remove duplicates and add new notifications to the store
		$gitlabNotifications = [
			...newNotifications,
			...$gitlabNotifications.filter((item) => !newNotifications.find((n) => n.id === item.id))
		];
	}

	function updateTrayTitle() {
		if (browser && window.__TAURI__) {
			const pinned = $filteredNotifications.filter(({ pinned }) => pinned);
			const unread = $filteredNotifications.filter(
				({ pinned, unread, done }) => !pinned && unread && !done
			);
			invoke('update_tray', {
				title: `${unread.length} unread${pinned.length ? ` • ${pinned.length} pinned` : ''}`
			});
		}
	}

	$: if (mounted && $githubNotifications.length) {
		// Save notifications to storage
		const toSave = $githubNotifications.map(
			({ id, description, author, pinned, unread, done, muted, time, previously }) => ({
				id,
				description,
				author,
				pinned,
				unread,
				done,
				muted,
				time,
				previously
			})
		);
		storage.set('github-notifications', toSave);
	}

	$: if ($filteredNotifications.length) {
		updateTrayTitle();
	}

	$: activeTray = $settings.activeTray;
	$: if (activeTray) {
		setTimeout(updateTrayTitle, 10);
	}

	$: if (mounted && $gitlabNotifications.length) {
		// Save notifications to storage
		const toSave = $gitlabNotifications.map(
			({ id, description, author, pinned, unread, done, muted, time, previously }) => ({
				id,
				description,
				author,
				pinned,
				unread,
				done,
				muted,
				time,
				previously
			})
		);
		storage.set('gitlab-notifications', toSave);
	}

	onMount(async () => {
		window.addEventListener('refetch', refetch);

		mounted = true;

		await fetchAll();
		$loading = false;
	});

	onDestroy(() => {
		if (mounted) {
			window.removeEventListener('refetch', refetch);
		}

		clearInterval(interval);
	});
</script>

<svelte:head>
	<title>GitLight • Dashboard</title>
</svelte:head>

<div class="container" class:sidebar-hidden={$settings.sidebarHidden}>
	<Sidebar />
	<main class="main">
		<Banner />
		<header class="header" data-tauri-drag-region>
			<div class="wrapper">
				{#if $settings.sidebarHidden}
					<div transition:slide={{ axis: 'x', duration: 300, easing: cubicInOut }}>
						<Tooltip content="Show sidebar" position="bottom left" hover>
							<button class="logo-button" on:click={() => ($settings.sidebarHidden = false)}>
								<Logo />
							</button>
						</Tooltip>
					</div>
				{/if}
				<h1 class="title">Notifications</h1>
				{#if $settings.showNotificationsSyncTimer}
					<div class="sync-pill" class:loading={!synced}>
						<RefreshIcon />
						{#if synced}
							Synced <span class="time">{syncTime}s ago</span>
						{:else}
							Syncing...
						{/if}
					</div>
				{/if}
			</div>
			<div class="settings-wrapper">
				<Priorities />
				<Settings />
			</div>
		</header>
		<nav class="nav">
			<button
				class="tab"
				class:selected={providerView === 'github'}
				on:click={() => ($settings.providerView = 'github')}
			>
				<GithubIcon />
				<p class="text">GitHub</p>
				{#if !githubUser}
					<div class="tag blue">Not logged in</div>
				{/if}
			</button>
			<button
				class="tab"
				class:selected={providerView === 'gitlab'}
				on:click={() => ($settings.providerView = 'gitlab')}
			>
				<GitlabIcon />
				<p class="text">GitLab</p>
				{#if !gitlabUser}
					<div class="tag blue">Coming soon!</div>
				{/if}
			</button>
			<button
				class="tab"
				class:selected={providerView === 'both'}
				on:click={() => ($settings.providerView = 'both')}
			>
				<p class="text">Both</p>
			</button>
			<DoneModal />
		</nav>
		{#if providerView === 'github' && !githubUser}
			<div class="login-container">
				<div class="text">Manage your GitHub and GitLab notifications at the same time.</div>
				<GithubLoginButton>
					<GithubIcon />
					Log in to GitHub
				</GithubLoginButton>
			</div>
		{:else if providerView === 'gitlab' && !gitlabUser}
			<div class="login-container">
				<div class="text">Manage your GitHub and GitLab notifications at the same time.</div>
				<GitlabLoginButton>
					<GitlabIcon />
					Log in to Gitlab
				</GitlabLoginButton>
			</div>
		{:else}
			<Main />
		{/if}
	</main>
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

	.main {
		display: flex;
		width: calc(100% - 20rem);
		height: 100vh;
		flex-direction: column;

		.header {
			z-index: 1;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 3rem 2rem 2rem;

			.wrapper {
				display: flex;
				align-items: center;
			}

			.logo-button {
				margin-right: 1rem;
			}

			.title {
				@include typography.heading-1;
			}

			.sync-pill {
				display: flex;
				align-items: center;
				padding: 0.25rem 0.5rem;
				border-radius: variables.$radius;
				margin: 0 1rem;
				background-color: variables.$grey-3;
				color: variables.$grey-4;
				gap: 0.25rem;

				&:not(:hover) .time {
					display: none;
				}

				:global(svg) {
					height: 1.25rem;
					color: variables.$green;
				}

				&.loading {
					color: variables.$yellow;

					:global(svg) {
						animation: loading 1s linear infinite;
						color: variables.$yellow;

						@keyframes loading {
							0% {
								rotate: 0deg;
							}

							100% {
								rotate: 360deg;
							}
						}
					}
				}
			}

			.settings-wrapper {
				display: flex;
				gap: 1rem;
			}
		}

		.nav {
			display: flex;
			padding: 0 2rem;
			border-bottom: 1px solid variables.$grey-3;

			.tab {
				display: flex;
				align-items: center;
				padding: 0.75em 1em;
				border: 1px solid transparent;
				border-radius: variables.$radius variables.$radius 0 0;
				border-bottom: none;
				gap: 0.5rem;

				:global(svg) {
					height: 1.25rem;
				}

				&.selected {
					position: relative;
					border-color: variables.$grey-3;

					&::before {
						position: absolute;
						height: 1px;
						background-color: variables.$grey-1;
						content: '';
						inset: auto 0 -1px;
					}
				}

				&:not(.selected, :hover) {
					opacity: 0.5;
				}

				.text {
					@include typography.bold;
				}

				.tag {
					@include typography.small;

					display: flex;
					align-items: center;
					padding: 0.25rem 0.5rem;
					border-radius: variables.$radius;
					background-color: variables.$grey-3;
					color: variables.$white;
					gap: 0.25rem;

					&.blue {
						background-color: variables.$blue-1;
						color: variables.$blue-3;
					}

					:global(svg) {
						width: 1rem;
						height: 1rem;
					}
				}
			}
		}

		.login-container {
			display: flex;
			height: 100%;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 1.5rem;

			.text {
				@include typography.heading-2;
				@include typography.base;

				max-width: 20rem;
				text-align: center;
			}
		}
	}
</style>
