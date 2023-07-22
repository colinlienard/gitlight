<script lang="ts">
	import { invoke } from '@tauri-apps/api/tauri';
	import { onDestroy, onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { crossfade, slide } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { Settings, Separator, ScrollbarContainer, Tooltip } from '~/lib/components';
	import { fetchGithub } from '~/lib/helpers';
	import {
		CheckIcon,
		GithubIcon,
		GitlabIcon,
		Logo,
		UnreadIcon,
		PinIcon,
		RefreshIcon,
		DoubleCheckIcon
	} from '~/lib/icons';
	import { filteredNotifications, githubNotifications, largeScreen, settings } from '~/lib/stores';
	import Banner from './Banner.svelte';
	import { DoneModal, NotificationColumn } from './notifications';
	import { Priorities } from './priorities';

	export let synced: boolean;

	let syncTime = 0;
	let interval: ReturnType<typeof setInterval>;

	// Sort by priority
	$: notifications = $settings.prioritySorting
		? $filteredNotifications.sort((a, b) => (b.priority?.value || 0) - (a.priority?.value || 0))
		: $filteredNotifications;

	// Filter events
	$: pinned = notifications.filter((item) => item.pinned && !item.done);
	$: unread = notifications.filter((item) => !item.pinned && item.unread && !item.done);
	$: read = notifications.filter((item) => !item.pinned && !item.unread && !item.done);

	$: if (synced && !syncTime) {
		interval = setInterval(() => {
			syncTime += 1;
		}, 1000);
	} else if (!synced) {
		syncTime = 0;
		clearInterval(interval);
	}

	function markAllAsRead() {
		$githubNotifications = $githubNotifications.map((notifications) =>
			unread.includes(notifications) ? { ...notifications, unread: false } : notifications
		);
		fetchGithub('notifications', {
			method: 'PUT',
			body: { read: true }
		});
	}

	function markAllAsDone() {
		$githubNotifications = $githubNotifications.map((notifications) =>
			read.includes(notifications) ? { ...notifications, done: true } : notifications
		);
	}

	// Animations settings
	const animationSettings = { duration: 400, easing: cubicInOut };
	const [send, receive] = crossfade(animationSettings);
	const transitions = { send, receive, settings: animationSettings };

	function handleResize() {
		if (browser && $settings.notificationAxis === 'Auto') {
			$largeScreen = window.innerWidth > 1200;
		}
	}

	$: switch ($settings.notificationAxis) {
		case 'Auto':
			handleResize();
			break;
		case 'Vertical':
			$largeScreen = false;
			break;
		case 'Horizontal':
			$largeScreen = true;
			break;
	}

	$: if (browser && window.__TAURI__ && unread.length === 0) {
		invoke('update_tray', { newIcon: false });
	}

	onMount(() => {
		handleResize();
		window.addEventListener('resize', handleResize);
	});

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('resize', handleResize);
		}
	});
</script>

<main class="main">
	<Banner />
	<header class="header">
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
		<button class="tab selected">
			<GithubIcon />
			<p class="text">GitHub</p>
			<span class="tag">
				<PinIcon />
				{pinned.length}
			</span>
			<span class="tag">
				<UnreadIcon />
				{unread.length}
			</span>
		</button>
		<button class="tab">
			<GitlabIcon />
			<p class="text">GitLab</p>
			<div class="tag soon">Coming soon</div>
		</button>
		<DoneModal />
	</nav>
	<ScrollbarContainer>
		<section class="columns-container" class:horizontal={!$largeScreen}>
			<NotificationColumn
				icon={PinIcon}
				title="Pinned"
				notifications={pinned}
				placeholder={{
					icon: PinIcon,
					text: 'Click on the pin icon to mark a notification as pinned.'
				}}
				{transitions}
			/>
			<Separator vertical={$largeScreen} />
			<NotificationColumn
				icon={UnreadIcon}
				title="Unread"
				notifications={unread}
				placeholder={{ icon: UnreadIcon, text: 'New and unread notifications will appear here.' }}
				{transitions}
			>
				<div slot="header-addon">
					{#if unread.length}
						<button class="read-all" on:click={markAllAsRead}>
							<CheckIcon />
							All
						</button>
					{/if}
				</div>
			</NotificationColumn>
			<Separator vertical={$largeScreen} />
			<NotificationColumn
				icon={CheckIcon}
				title="Read"
				notifications={read}
				placeholder={{
					icon: CheckIcon,
					text: 'Click on the check icon to mark a notification as read.'
				}}
				{transitions}
			>
				<div slot="header-addon">
					{#if read.length}
						<button class="read-all" on:click={markAllAsDone}>
							<DoubleCheckIcon />
							All
						</button>
					{/if}
				</div>
			</NotificationColumn>
		</section>
	</ScrollbarContainer>
</main>

<style lang="scss">
	.main {
		display: flex;
		width: calc(100% - 20rem);
		height: 100vh;
		flex-direction: column;
	}

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
			border-radius: variables.$radius variables.$radius 0 0;
			gap: 0.5rem;
			transition: opacity variables.$transition;

			:global(svg) {
				height: 1.25rem;
			}

			&.selected {
				position: relative;
				border: 1px solid variables.$grey-3;
				border-bottom: none;

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

				&.soon {
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

	.columns-container {
		position: relative;
		display: grid;
		overflow: hidden;
		height: 100%;
		padding: 2rem 0.5rem;
		grid-template-columns: 1fr 1px 1fr 1px 1fr;

		&.horizontal {
			display: flex;
			overflow: visible;
			flex-direction: column;
			gap: 2rem;
		}

		.read-all {
			@include typography.small;
			@include mixins.link;

			z-index: 1;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.25rem;

			:global(svg) {
				height: 1rem;
			}
		}
	}
</style>
