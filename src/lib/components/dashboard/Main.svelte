<script lang="ts">
	import { cubicInOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';
	import { Separator, ScrollbarContainer, NotificationColumn } from '$lib/components';
	import { fetchGithub } from '$lib/features';
	import { CheckIcon, UnreadIcon, PinIcon, DoubleCheckIcon } from '$lib/icons';
	import { filteredNotifications, githubNotifications, loading, settings } from '$lib/stores';
	import { Notification, SkeletonEvent } from './notifications';

	// Sort by priority
	$: prioritySorting = $settings.prioritySorting;
	$: notifications = (
		prioritySorting
			? [...$filteredNotifications].sort(
					(a, b) => (b.priority?.value || 0) - (a.priority?.value || 0)
			  )
			: $filteredNotifications
	).filter((item) => !item.done);

	// Filter events
	$: pinned = notifications.filter((item) => item.pinned && !item.done);
	$: unread = notifications.filter((item) => !item.pinned && item.unread && !item.done);
	$: read = notifications.filter((item) => !item.pinned && !item.unread && !item.done);

	$: verticalKanban = $settings.viewMode === 'Kanban (vertical)';

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
</script>

<ScrollbarContainer margin="0.25rem">
	{#if $settings.viewMode === 'List'}
		<ul class="list">
			{#if $loading}
				<li><SkeletonEvent /></li>
				<li><SkeletonEvent /></li>
			{:else}
				{#each notifications as notification (notification)}
					<li>
						<Notification data={notification} />
					</li>
				{/each}
			{/if}
		</ul>
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
			<Separator vertical={!verticalKanban} marginX={!verticalKanban ? 0 : 1.5} />
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
			<Separator vertical={!verticalKanban} marginX={!verticalKanban ? 0 : 1.5} />
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
	{/if}
</ScrollbarContainer>

<style lang="scss">
	.list {
		position: relative;
		display: flex;
		flex-direction: column;
		padding: 0 2rem 2rem;
		gap: 1rem;

		&::before {
			position: sticky;
			z-index: 1;
			height: 2rem;
			margin-bottom: -1rem;
			background-image: linear-gradient(variables.$grey-1 1rem, transparent);
			content: '';
			inset: 0 0 auto;
		}
	}

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
