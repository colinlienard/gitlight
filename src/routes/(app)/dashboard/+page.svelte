<script lang="ts">
	import { sendNotification } from '@tauri-apps/api/notification';
	import { invoke } from '@tauri-apps/api/tauri';
	import { onDestroy, onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
	import { setInterval, clearInterval } from 'worker-timers';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import {
		Banner,
		DoneModal,
		GithubLoginButton,
		GitlabLoginButton,
		GitlabRepos,
		IconButton,
		LoadingScreen,
		Main,
		Priorities,
		Settings,
		Sidebar,
		SyncPill,
		Tooltip
	} from '$lib/components';
	import {
		createGithubNotificationData,
		createGitlabNotificationData,
		fetchGithub,
		fetchGitlab,
		fetchGitlabLabels,
		isIrrelevant,
		prepareGitlabNotificationData,
		storage,
		type StorageMap
	} from '$lib/features';
	import { DoubleArrowIcon, GithubIcon, GitlabIcon } from '$lib/icons';
	import {
		error,
		filteredNotifications,
		githubNotifications,
		gitlabNotifications,
		globalNotifications,
		loading,
		settings
	} from '$lib/stores';
	import type {
		GithubNotification,
		GitlabEvent,
		GitlabEventWithRepoData,
		NotificationData,
		SavedNotifications
	} from '$lib/types';

	const githubUser = $page.data.session?.githubUser;
	const gitlabUser = $page.data.session?.gitlabUser;

	let synced = false;
	let isMacos = false;
	let syncTime = 0;
	let interval = 0;

	function loop() {
		syncTime += 1;
		if (syncTime > 60) {
			syncTime = 0;
			fetchAll();
		}
	}

	function notificationIsMuted(
		{ author, creator, repository, muted }: NotificationData,
		persons: StorageMap['watched-persons'],
		repos: StorageMap['watched-repos']
	) {
		const currentAuthor = persons.find(({ login }) => login === author?.login);
		const currentCreator = persons.find(({ login }) => login === creator?.login);
		const repo = repos.find(({ id }) => id === repository.id);
		return (currentAuthor ? currentAuthor.muted : currentCreator?.muted) || repo?.muted || muted;
	}

	$: providerView = $settings.providerView;
	$: {
		let notifications = [
			...(providerView !== 'gitlab' ? $githubNotifications : []),
			...(providerView !== 'github' ? $gitlabNotifications : [])
		];
		if (providerView !== 'github') {
			if ($settings.gitlabOnlyInvolved) {
				notifications = notifications.filter((item) => !item.notInvolved);
			}
			notifications = notifications.sort(
				(a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
			);
		}
		$globalNotifications = notifications;
	}

	function refetch() {
		// Clear and refetch notifications
		$githubNotifications = [];
		$gitlabNotifications = [];
		fetchAll();

		// Reset interval
		clearInterval(interval);
		interval = setInterval(loop, 1000);
	}

	async function fetchAll() {
		synced = false;
		$error = null;

		const firstFetch = !$githubNotifications.length && !$gitlabNotifications.length;

		const newNotifications = (
			await Promise.all([fetchGithubNotifications(), fetchGitlabNotifications()])
		).flat();

		synced = true;

		if (
			!window.__TAURI__ ||
			!newNotifications.length ||
			firstFetch ||
			!$settings.activateNotifications
		)
			return;

		// Send push notification and update tray icon
		const { author, title, description } = newNotifications[0];
		sendNotification({
			title,
			body: `${author ? `${author.login} ` : ''}${description.replace(/(\*|_)/g, '')}`
		});
		invoke('update_tray', { newIcon: true });
	}

	async function fetchGithubNotifications(): Promise<NotificationData[]> {
		if (!githubUser) return [];

		let newNotifications: NotificationData[] = [];
		const savedNotifications = storage.get('github-notifications') || [];
		const persons = storage.get('watched-persons') || [];
		const repos = storage.get('watched-repos') || [];
		const firstFetch = !$githubNotifications.length;

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
			if (!firstFetch) {
				notifications = notifications.filter(({ id, updated_at }) => {
					if (isIrrelevant(id)) return false;
					const current = $githubNotifications.find((item) => item.id === id);
					return current ? updated_at !== current.time : true;
				});
			}

			if (!notifications.length) return [];

			newNotifications = (
				await Promise.all(
					notifications.map((notification) =>
						createGithubNotificationData(notification, savedNotifications, firstFetch)
					)
				)
			)
				.filter((item): item is NotificationData => !!item)
				// If the notification is muted, do not update its status
				.map((item) => {
					const previous = savedNotifications.find((n) => n.id === item.id);
					if (shouldNotificationBeDone(item, previous)) {
						return { ...item, status: 'done' };
					}
					if (notificationIsMuted(item, persons, repos)) {
						return { ...item, status: previous ? previous.status : 'read' };
					}
					return item;
				});
		} catch (e) {
			$error =
				'An error occurred while fetching notifications. Please try to reload the page or log out and log in again.';
			console.error(e);
		}

		if (newNotifications.length) {
			// Remove duplicates and add new notifications to the store
			$githubNotifications = [
				...newNotifications,
				...$githubNotifications.filter((item) => !newNotifications.find((n) => n.id === item.id))
			];
		}

		return newNotifications.filter((item) => !notificationIsMuted(item, persons, repos));
	}

	async function fetchGitlabNotifications(): Promise<NotificationData[]> {
		if (!gitlabUser || !$settings.gitlabRepos.length) return [];

		let newNotifications: NotificationData[] = [];
		const savedNotifications = storage.get('gitlab-notifications') || [];
		const ignoredNotificationTypes: GitlabEvent['action_name'][] = ['created', 'deleted', 'joined'];
		const persons = storage.get('watched-persons') || [];
		const repos = storage.get('watched-repos') || [];
		const firstFetch = !$gitlabNotifications.length;

		const repositories: GitlabEventWithRepoData['repository'][] = $settings.gitlabRepos.map(
			({ url, id }) => {
				const u = new URL(url);
				const pathname = u.pathname.substring(1);
				const splited = pathname.split('/');
				const namespace = `${splited[0]}/${splited[splited.length - 1]}`;
				const encoded = pathname.replaceAll('/', '%2F');
				return { id, url, domain: u.host, namespace, encoded };
			}
		);

		try {
			// Get labels colors
			if (firstFetch) {
				await fetchGitlabLabels(repositories);
			}

			// Fetch all repos and add repository data to each event
			let notifications = (
				await Promise.all(
					repositories.map(
						(repository) =>
							// eslint-disable-next-line no-async-promise-executor
							new Promise<GitlabEvent[]>(async (resolve) => {
								const response = await fetchGitlab<GitlabEvent[]>(
									`projects/${repository.encoded}/events?per_page=50`,
									{ domain: repository.domain }
								);
								resolve(response.map((item) => ({ ...item, repository })));
							})
					)
				)
			)
				.flat()
				.filter((n): n is GitlabEventWithRepoData => {
					if (!n) return false;
					if (n.target_type === 'Milestone') return false;
					if (ignoredNotificationTypes.includes(n.action_name)) return false;
					if ('push_data' in n && n.push_data.ref_type === 'tag') return false;
					return true;
				});

			// Keep only new or modified notifications
			if (!firstFetch) {
				notifications = notifications.filter((n) => {
					const current = $gitlabNotifications.find((item) => {
						switch (true) {
							case n.target_type === 'Note' || n.target_type === 'DiffNote':
								return 'note' in n && n.note.noteable_id?.toString() === item.id;
							case !!n.target_id:
								return 'target_id' in n && n.target_id?.toString() === item.id;
							case 'push_data' in n:
								return !('push_data' in n && n.push_data.ref === item.ref);
							default:
								return item.id === n.id?.toString();
						}
					});
					return current
						? new Date(n.created_at).getTime() > new Date(current.time).getTime()
						: true;
				});
			}

			const prepared = await prepareGitlabNotificationData(notifications);
			newNotifications = (
				await Promise.all(
					prepared.map((item) => createGitlabNotificationData(item, savedNotifications))
				)
			)
				.filter((item): item is NotificationData => !!item)
				.map((item) => {
					const previous = savedNotifications.find((n) => n.id === item.id);
					if (shouldNotificationBeDone(item, previous)) {
						return { ...item, status: 'done' };
					}
					if (notificationIsMuted(item, persons, repos)) {
						return { ...item, status: previous ? previous.status : 'read' };
					}
					return item;
				});
		} catch (e) {
			$error =
				'An error occurred while fetching notifications. Please try to reload the page or log out and log in again.';
			console.error(e);
		}

		// Remove duplicates and add new notifications to the store
		if (newNotifications.length) {
			$gitlabNotifications = [
				...newNotifications,
				...$gitlabNotifications.filter((item) => !newNotifications.find((n) => n.id === item.id))
			];
		}

		return newNotifications.filter((item) =>
			!notificationIsMuted(item, persons, repos) && $settings.gitlabOnlyInvolved
				? !item.notInvolved
				: true
		);
	}

	function shouldNotificationBeDone(
		notification: NotificationData,
		previous?: SavedNotifications[number]
	) {
		// If the notification is a pull/merge request or an issue and is closed, and the notification is not pinned,
		// and the notification is not already marked as done, mark it as done
		return (
			$settings.markClosedAsDone &&
			notification.status.includes('read') &&
			(notification.type === 'pr' || notification.type === 'issue') &&
			!notification.opened &&
			previous?.status !== 'done'
		);
	}

	function updateTrayTitle() {
		if (browser && window.__TAURI__) {
			const unread = $filteredNotifications.filter(({ status }) => status === 'unread');
			let title = '';
			if (unread.length) {
				title = `${unread.length} unread`;
			}
			invoke('update_tray', { title });
		}
	}

	$: if (browser && $githubNotifications.length) {
		// Save notifications to storage
		const toSave = $githubNotifications.map(
			({ id, description, author, status, muted, time, previously }) => ({
				id,
				description,
				author,
				status,
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

	$: if (browser && $gitlabNotifications.length) {
		// Save notifications to storage
		const toSave = $gitlabNotifications.map(
			({ id, description, author, status, muted, time, previously }) => ({
				id,
				description,
				author,
				status,
				muted,
				time,
				previously
			})
		);
		storage.set('gitlab-notifications', toSave);
	}

	onMount(async () => {
		window.addEventListener('refetch', refetch);

		if (window.__TAURI__) {
			const { platform } = await import('@tauri-apps/api/os');
			const platformName = await platform();
			isMacos = platformName === 'darwin';
		}

		await fetchAll();
		interval = setInterval(loop, 1000);
		$loading = false;
	});

	onDestroy(() => {
		if (browser) {
			clearInterval(interval);
			window.removeEventListener('refetch', refetch);
		}
	});
</script>

<svelte:head>
	<title>GitLight • Dashboard</title>
</svelte:head>

{#if $loading}
	<LoadingScreen />
{/if}
<div class="container" class:sidebar-hidden={$settings.sidebarHidden}>
	<Sidebar {isMacos} />
	<main class="main">
		<Banner />
		<header class="header" data-tauri-drag-region>
			<div class="wrapper" class:macos={isMacos && $settings.sidebarHidden}>
				<h1 class="title">Notifications</h1>
				<SyncPill {syncTime} {synced} />
				{#if $settings.sidebarHidden}
					<div
						class="show-sidebar"
						transition:slide={{ axis: 'x', duration: 300, easing: cubicInOut }}
					>
						<Tooltip content="Show sidebar" position="bottom" hover>
							<IconButton on:click={() => ($settings.sidebarHidden = false)}>
								<DoubleArrowIcon />
							</IconButton>
						</Tooltip>
					</div>
				{/if}
			</div>
			<div class="settings-wrapper">
				<DoneModal />
				<Priorities />
				<Settings />
			</div>
		</header>
		{#if providerView === 'github' && !githubUser}
			<div class="center-container">
				<div class="text">Manage your GitHub and GitLab notifications at the same time.</div>
				<GithubLoginButton>
					<GithubIcon />
					Log in to GitHub
				</GithubLoginButton>
			</div>
		{:else if providerView === 'gitlab' && !gitlabUser}
			<div class="center-container">
				<div class="text">Manage your GitHub and GitLab notifications at the same time.</div>
				<GitlabLoginButton>
					<GitlabIcon />
					Log in to Gitlab
				</GitlabLoginButton>
			</div>
		{:else if providerView === 'gitlab' && !$settings.gitlabRepos.length}
			<div class="center-container to-top">
				<GitlabRepos />
			</div>
		{:else}
			<Main />
		{/if}
	</main>
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
			padding: 1rem;
			border-bottom: 1px solid variables.$bg-3;

			.wrapper {
				display: flex;
				align-items: center;
				transition: padding variables.$transition;

				.show-sidebar {
					:global(svg) {
						rotate: 180deg;
					}
				}

				&.macos {
					padding-left: 4rem;
				}
			}

			.title {
				@include typography.heading-2;
			}

			.settings-wrapper {
				display: flex;
				align-items: center;
				gap: 1rem;
			}
		}

		.center-container {
			display: flex;
			height: 100%;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 2rem;
			gap: 1.5rem;

			&.to-top {
				justify-content: start;
			}

			.text {
				@include typography.heading-2;
				@include typography.base;

				max-width: 20rem;
				text-align: center;
			}
		}
	}
</style>
