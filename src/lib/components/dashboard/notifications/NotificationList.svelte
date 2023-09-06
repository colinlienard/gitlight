<script lang="ts">
	import { CheckIcon } from '$lib/icons';
	import { loading } from '$lib/stores';
	import type { NotificationData } from '$lib/types';
	import { Notification, NotificationPlaceholder, SkeletonNotification } from '.';

	export let notifications: NotificationData[];
	export let scrollShadow = true;

	$: displayNotifications = (() => {
		const pinned = notifications.filter((item) => item.pinned);
		const others = notifications.filter((item) => !item.pinned);
		return [...pinned, ...others];
	})();
</script>

<ul
	class="list"
	class:scroll-shadow={scrollShadow}
	style:height={notifications.length ? 'auto' : '100%'}
>
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
		padding: 2rem;
		gap: 1rem;

		&.scroll-shadow {
			padding-top: 0;

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
	}
</style>
