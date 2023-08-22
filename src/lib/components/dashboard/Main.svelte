<script lang="ts">
	import { invoke } from '@tauri-apps/api/tauri';
	import { onDestroy, onMount } from 'svelte';
	import { cubicInOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { Separator, ScrollbarContainer, NotificationColumn } from '$lib/components';
	import { fetchGithub } from '$lib/features';
	import { CheckIcon, UnreadIcon, PinIcon, DoubleCheckIcon } from '$lib/icons';
	import { filteredNotifications, githubNotifications, largeScreen, settings } from '$lib/stores';

	// Sort by priority
	$: prioritySorting = $settings.prioritySorting;
	$: notifications = (
		prioritySorting
			? $filteredNotifications.sort((a, b) => (b.priority?.value || 0) - (a.priority?.value || 0))
			: $filteredNotifications
	).filter((item) => !item.done);

	// Filter events
	$: pinned = notifications.filter((item) => item.pinned && !item.done);
	$: unread = notifications.filter((item) => !item.pinned && item.unread && !item.done);
	$: read = notifications.filter((item) => !item.pinned && !item.unread && !item.done);

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

	$: if (browser && window.__TAURI__ && $filteredNotifications.some((item) => item.isNew)) {
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

<ScrollbarContainer margin="0.25rem">
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
		<Separator vertical={$largeScreen} marginX={$largeScreen ? 0 : 1.5} />
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
		<Separator vertical={$largeScreen} marginX={$largeScreen ? 0 : 1.5} />
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

<style lang="scss">
	.columns-container {
		position: relative;
		padding: 2rem 0.5rem;

		&.horizontal {
			display: flex;
			overflow: visible;
			flex-direction: column;
			gap: 2rem;
		}

		&:not(.horizontal) {
			display: grid;
			overflow: hidden;
			height: 100%;
			grid-template-columns: 1fr 1px 1fr 1px 1fr;
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
