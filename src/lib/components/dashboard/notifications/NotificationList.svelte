<script lang="ts">
	import { CheckIcon } from '$lib/icons';
	import { loading } from '$lib/stores';
	import type { NotificationData } from '$lib/types';
	import { Notification, NotificationPlaceholder, SkeletonNotification } from '.';

	export let notifications: NotificationData[];

	$: displayNotifications = [
		...notifications.filter((n) => n.status === 'pinned'),
		...notifications.filter((n) => n.status === 'unread'),
		...notifications.filter((n) => n.status === 'read')
	];
</script>

<ul class="list" style:height={notifications.length ? 'auto' : '100%'}>
	{#if $loading}
		<li><SkeletonNotification /></li>
		<li><SkeletonNotification /></li>
	{:else if notifications.length}
		{#each displayNotifications as notification (notification)}
			<li>
				<Notification data={notification} />
			</li>
		{/each}
	{:else}
		<NotificationPlaceholder icon={CheckIcon} text="Well done!" />
	{/if}
</ul>

<style lang="scss">
	.list {
		position: relative;
		display: flex;
		height: 100%;
		flex-direction: column;
		padding: 1rem;
		gap: 1rem;
	}
</style>
