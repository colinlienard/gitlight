<script lang="ts">
	import { page } from '$app/stores';
	import { Event } from '~/lib/components';
	import { createEventData } from '~/lib/helpers';
	import type { TGithubEvent } from '~/lib/types';

	let githubEvents = ($page.data.githubEvents as TGithubEvent[]).map((event) =>
		createEventData(event)
	);
</script>

<ul class="event-container">
	{#each githubEvents as githubEvent}
		<li>
			<Event data={githubEvent} />
		</li>
	{/each}
</ul>

<style lang="scss">
	.event-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 3rem;
		gap: 1rem;
	}
</style>
