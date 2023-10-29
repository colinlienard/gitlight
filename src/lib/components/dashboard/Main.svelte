<script lang="ts">
	import { emit } from '@tauri-apps/api/event';
	import { cubicInOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { ScrollbarContainer, NotificationColumn } from '$lib/components';
	import { fetchGithub } from '$lib/features';
	import { CheckIcon, UnreadIcon, PinIcon, DoubleCheckIcon } from '$lib/icons';
	import {
		filteredNotifications,
		githubNotifications,
		gitlabNotifications,
		loading,
		settings
	} from '$lib/stores';
	import { NotificationList } from './notifications';

	// Sort by priority
	$: prioritySorting = $settings.prioritySorting;
	$: notifications = (
		prioritySorting
			? [...$filteredNotifications].sort(
					(a, b) => (b.priority?.value || 0) - (a.priority?.value || 0)
			  )
			: $filteredNotifications
	).filter((item) => item.status !== 'done');

	// Send data to tray app
	$: if (browser && window.__TAURI__) {
		emit('notifications', { notifications });
	}
	$: if (browser && window.__TAURI__) {
		emit('loading', { loading: $loading });
	}
	$: if (browser && window.__TAURI__) {
		emit('settings', { settings: $settings });
	}

	// Filter events
	$: pinned = notifications.filter((item) => item.status === 'pinned');
	$: unread = notifications.filter((item) => item.status === 'unread');
	$: read = notifications.filter((item) => item.status === 'read');

	$: verticalKanban = $settings.viewMode === 'Kanban (vertical)';

	function readAllInGithub() {
		fetchGithub('notifications', {
			method: 'PUT',
			body: { read: true }
		});
	}

	function markAllAs(status: 'read' | 'done') {
		if ($settings.providerView !== 'gitlab') {
			$githubNotifications = $githubNotifications.map((notifications) =>
				(status === 'read' ? unread : read).includes(notifications)
					? { ...notifications, status }
					: notifications
			);
			readAllInGithub();
		}
		if ($settings.providerView !== 'github') {
			$gitlabNotifications = $gitlabNotifications.map((notifications) =>
				(status === 'read' ? unread : read).includes(notifications)
					? { ...notifications, status }
					: notifications
			);
		}
	}

	// Animations settings
	const animationSettings = { duration: 400, easing: cubicInOut };
	const [send, receive] = crossfade(animationSettings);
	const transitions = { send, receive, settings: animationSettings };
</script>

<ScrollbarContainer margin="0.25rem">
	{#if $settings.viewMode === 'List'}
		<NotificationList {notifications} />
	{:else}
		<section class="columns-container" class:horizontal={verticalKanban}>
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
			<div class="separator" />
			<NotificationColumn
				icon={UnreadIcon}
				title="Unread"
				notifications={unread}
				placeholder={{ icon: UnreadIcon, text: 'New and unread notifications will appear here.' }}
				{transitions}
			>
				<div slot="header-addon">
					{#if unread.length}
						<button class="read-all" on:click={() => markAllAs('read')}>
							<CheckIcon />
							All
						</button>
					{/if}
				</div>
			</NotificationColumn>
			<div class="separator" />
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
						<button class="read-all" on:click={() => markAllAs('done')}>
							<DoubleCheckIcon />
							All
						</button>
					{/if}
				</div>
			</NotificationColumn>
		</section>
	{/if}
</ScrollbarContainer>

<style lang="scss">
	.columns-container {
		position: relative;

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

		.separator {
			border-left: 1px solid variables.$bg-3;
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
