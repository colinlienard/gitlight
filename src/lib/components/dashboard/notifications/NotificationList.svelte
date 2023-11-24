<script lang="ts">
	import { CheckIcon } from '$lib/icons';
	import type { NotificationData } from '$lib/types';
	import { Notification, NotificationPlaceholder } from '.';

	export let notifications: NotificationData[];

	$: displayNotifications = [
		...notifications.filter((n) => n.status === 'pinned'),
		...notifications.filter((n) => n.status === 'unread'),
		...notifications.filter((n) => n.status === 'read')
	];
</script>

<ul class="list" style:height={notifications.length ? 'auto' : '100%'}>
	{#if notifications.length}
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
