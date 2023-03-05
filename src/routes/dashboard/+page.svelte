<script lang="ts">
	import { page } from '$app/stores';
	import type { TGithubEvent } from '~/lib/types';

	let githubEvents = $page.data.githubEvents as TGithubEvent[];
	console.log(githubEvents);
</script>

<ul class="notification-container">
	{#each githubEvents as githubEvent}
		<li />
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
