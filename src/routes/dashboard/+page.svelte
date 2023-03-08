<script lang="ts">
	import { page } from '$app/stores';
	import { Notification } from '~/lib/components';
	import { createNotificationData } from '~/lib/helpers';
	import type { TGithubEvent } from '~/lib/types';

	let githubEvents = ($page.data.githubEvents as TGithubEvent[]).map((event) =>
		createNotificationData(event)
	);
	console.log($page.data.githubEvents, githubEvents);
</script>

<ul class="notification-container">
	{#each githubEvents as githubEvent}
		<li>
			<Notification data={githubEvent} />
		</li>
	{/each}
</ul>

<style lang="scss">
	.notification-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 3rem;
		gap: 1rem;
	}
</style>
