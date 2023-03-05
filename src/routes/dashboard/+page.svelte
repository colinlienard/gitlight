<script lang="ts">
	import { Notification } from '~/lib/components';
	import type { TNotification } from '~/lib/types';
	import { page } from '$app/stores';

	let notifications: TNotification[] = $page.data.notifications;
</script>

<ul class="notification-container">
	{#each notifications as notification}
		<li>
			<Notification {notification} />
		</li>
	{/each}
</ul>

<style lang="scss">
	.notification-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 3rem;
		gap: 1rem;
	}
</style>
