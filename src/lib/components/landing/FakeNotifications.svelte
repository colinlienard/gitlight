<script lang="ts">
	import { Notification } from '~/lib/components';
	import PullRequestOpen from '~/lib/icons/PullRequestOpen.svelte';
	import type { NotificationData } from '~/lib/types';

	const fakeNotifications: NotificationData[] = [
		{
			id: '1',
			type: 'PullRequest',
			unread: true,
			pinned: false,
			isNew: true,
			author: {
				login: 'ColinLienard',
				display_login: 'Colin Lienard',
				name: 'ColinLienard',
				url: '',
				avatar_url: 'https://avatars.githubusercontent.com/u/64312634?v=4'
			},
			title: 'feat(front): add the landing page',
			description: 'opened this pull request',
			time: '2023-05-01T15:00:00Z',
			icon: PullRequestOpen,
			iconColor: 'green',
			owner: 'ColinLienard',
			repo: 'gitlight',
			repoId: '1',
			ownerAvatar: 'https://avatars.githubusercontent.com/u/64312634?v=4',
			number: 44,
			labels: [
				{ name: 'feature', color: '4AF574' },
				{ name: 'front', color: '57EEE7' }
			],
			url: ''
		}
	];
</script>

<article class="container">
	{#each fakeNotifications as notification}
		<Notification data={notification} interactive={false} />
	{/each}
</article>

<style lang="scss">
	.container {
		margin-top: 4rem;
	}
</style>
