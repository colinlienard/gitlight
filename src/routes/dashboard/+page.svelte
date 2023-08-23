<script lang="ts">
	import { sendNotification } from '@tauri-apps/api/notification';
	import { invoke } from '@tauri-apps/api/tauri';
	import { onDestroy, onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';
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
	import { createGithubNotificationData, fetchGithub, storage } from '$lib/features';
	import { GithubIcon, GitlabIcon, Logo, RefreshIcon } from '$lib/icons';
	import {
		error,
		filteredNotifications,
		githubNotifications,
		loading,
		savedNotifications,
		settings
	} from '$lib/stores';
	import type { GithubNotification, NotificationData } from '$lib/types';

	const githubUser = $page.data.session?.githubUser;
	const gitlabUser = $page.data.session?.gitlabUser;

	let synced = false;
	let syncTime = 0;
	let syncInterval: ReturnType<typeof setInterval>;
	let mounted = false;

	let interval = setInterval(() => {
		fetchNotifications();
	}, 60000);

	$: if (synced && !syncTime) {
		syncInterval = setInterval(() => {
			syncTime += 1;
		}, 1000);
	} else if (!synced) {
		syncTime = 0;
		clearInterval(syncInterval);
	}

	async function fetchNotifications() {
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
						createGithubNotificationData(
							notification,
							$savedNotifications,
							!$githubNotifications.length
						)
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
			$settings.activateNotifications &&
			($settings.pushNotificationFromUser || pushNotification.author?.login !== githubUser?.login)
		) {
			const { author, title, description } = pushNotification;
			sendNotification({
				title: `${author ? `${author.login} ` : ''}${description.replace(/(\*|_)/g, '')}`,
				body: title
			});
			invoke('update_tray', { newIcon: true });
		}

		// Remove duplicates and add new notifications to the store
		$githubNotifications = [
			...newNotifications,
			...$githubNotifications.filter((item) => !newNotifications.find((n) => n.id === item.id))
		];
	}

	function refetch() {
		// Clear and refetch notifications
		$githubNotifications = [];
		fetchNotifications();

		// Reset interval
		clearInterval(interval);
		interval = setInterval(() => {
			fetchNotifications();
		}, 60000);
	}

	$: if (mounted && $githubNotifications.length) {
		// Save events ids to storage
		const toSave = $githubNotifications.map(
			({ id, description, author, pinned, unread, done, isNew, time, previously }) => ({
				id,
				description,
				author,
				pinned,
				unread,
				done,
				isNew,
				time,
				previously
			})
		);
		$savedNotifications = toSave;
		storage.set('github-notifications', toSave);

		// Update menu bar
		if (window.__TAURI__) {
			const pinned = $filteredNotifications.filter(({ pinned }) => pinned);
			const unread = $filteredNotifications.filter(
				({ pinned, unread, done }) => !pinned && unread && !done
			);
			invoke('update_tray', {
				title: `${unread.length}`,
				description: `${unread.length} unread • ${pinned.length} pinned`
			});
		}
	}

	onMount(async () => {
		window.addEventListener('refetch', refetch);

		$savedNotifications = storage.get('github-notifications') || [];

		mounted = true;

		await fetchNotifications();
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
						<Tooltip content="Show sidebar" position="bottom" hover>
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
				class:selected={$settings.providerView === 'github'}
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
				class:selected={$settings.providerView === 'gitlab'}
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
				class:selected={$settings.providerView === 'both'}
				on:click={() => ($settings.providerView = 'both')}
			>
				<p class="text">Both</p>
			</button>
			<DoneModal />
		</nav>
		{#if $settings.providerView === 'github' && !githubUser}
			<div class="login-container">
				<div class="text">Manage your GitHub and GitLab notifications at the same time.</div>
				<GithubLoginButton>
					<GithubIcon />
					Log in to GitHub
				</GithubLoginButton>
			</div>
		{:else if $settings.providerView === 'gitlab' && !gitlabUser}
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
