<script lang="ts">
	import { Notification } from '~/lib/components';
	import { Commit } from '~/lib/icons';
	import IssueOpen from '~/lib/icons/IssueOpen.svelte';
	import PullRequestMerged from '~/lib/icons/PullRequestMerged.svelte';
	import PullRequestOpen from '~/lib/icons/PullRequestOpen.svelte';
	import type { NotificationData } from '~/lib/types';

	const common = {
		id: '',
		unread: true,
		pinned: false,
		isNew: false,
		repoId: '',
		ownerAvatar: '',
		url: ''
	};

	const commonAuthor = {
		display_login: '',
		name: '',
		url: ''
	};

	const fakeNotifications: NotificationData[] = [
		{
			...common,
			type: 'Commit',
			author: {
				...commonAuthor,
				login: 'colinlienard',
				avatar_url: 'https://avatars.githubusercontent.com/u/64312634?v=4'
			},
			title: 'feat(back): tauri functionnalities',
			description: 'made a commit',
			time: new Date().toString(),
			icon: Commit,
			iconColor: 'blue',
			owner: 'colinlienard',
			repo: 'gitlight'
		},
		{
			...common,
			type: 'PullRequest',
			author: {
				...commonAuthor,
				login: 'QuiiBz',
				avatar_url: 'https://avatars.githubusercontent.com/u/43268759?v=4'
			},
			title: 'feat(astro): write config if not present when building',
			description: 'merged this pull request',
			time: new Date().toString(),
			icon: PullRequestMerged,
			iconColor: 'purple',
			owner: 'lagonapp',
			repo: 'lagon',
			number: 845,
			labels: [
				{ name: 'feature', color: 'a2eeef' },
				{ name: 'integration', color: 'b3878f' }
			]
		},
		{
			...common,
			type: 'PullRequest',
			author: {
				...commonAuthor,
				login: 'lucasfernog',
				avatar_url: 'https://avatars.githubusercontent.com/u/20051258?v=4'
			},
			title: 'feat(cli): add rustls as default Cargo feature',
			description: 'merged this pull request',
			time: new Date(new Date().getTime() - 1000000).toString(),
			icon: PullRequestMerged,
			iconColor: 'purple',
			owner: 'tauri-apps',
			repo: 'tauri',
			number: 6900
		},
		{
			...common,
			type: 'Issue',
			title: 'TS to JSDoc Conversion',
			description: 'New activity on issue',
			time: new Date(new Date().getTime() - 10000000).toString(),
			icon: IssueOpen,
			iconColor: 'green',
			owner: 'sveltejs',
			repo: 'svelte',
			number: 8569,
			labels: [{ name: 'breaking change', color: 'd73a4a' }]
		},
		{
			...common,
			type: 'PullRequest',
			isNew: true,
			author: {
				...commonAuthor,
				login: 'colinlienard',
				avatar_url: 'https://avatars.githubusercontent.com/u/64312634?v=4'
			},
			title: 'feat(front): add the landing page',
			description: 'opened this pull request',
			time: new Date(new Date().getTime() - 23000).toString(),
			icon: PullRequestOpen,
			iconColor: 'green',
			owner: 'colinlienard',
			repo: 'gitlight',
			number: 44,
			labels: [
				{ name: 'feature', color: '4AF574' },
				{ name: 'front', color: '57EEE7' }
			]
		}
	];
</script>

<article class="container">
	{#each fakeNotifications as notification}
		<div class="notification-container">
			<Notification data={notification} interactive={false} />
		</div>
	{/each}
</article>

<style lang="scss">
	.container {
		margin-top: 4rem;
		margin-bottom: auto;
		position: relative;

		@include screens.mobile {
			display: none;
		}

		.notification-container {
			background-color: variables.$grey-1;
			border-radius: variables.$radius;
			width: 23rem;
			transition: translate variables.$transition;

			&:not(:nth-child(5)) {
				position: absolute;
			}

			@keyframes slide {
				from {
					opacity: 0;
					translate: 0 4rem;
					transform: perspective(500px) rotate3d(1, 0, 0, -45deg);
				}
				to {
					opacity: 1;
					translate: 0;
					transform: perspective(500px) rotate3d(1, 0, 0, 0deg);
				}
			}

			@mixin notification($top, $left, $rotate, $opacity, $animation-stagger) {
				top: $top;
				left: $left;
				rotate: $rotate;
				animation: slide 0.5s calc(#{$animation-stagger} * 0.2s + 0.6s) ease-in-out backwards;

				& > :global(div) {
					opacity: $opacity;
					transition: opacity variables.$transition;
				}
			}

			&:nth-child(1) {
				@include notification(8rem, calc(-200% + 8rem), -15deg, 0.25, 2);
			}

			&:nth-child(2) {
				@include notification(2rem, calc(-100% + 4rem), -5deg, 0.5, 1);
			}

			&:nth-child(3) {
				@include notification(8rem, calc(200% - 8rem), 15deg, 0.25, 2);
			}

			&:nth-child(4) {
				@include notification(2rem, calc(100% - 4rem), 5deg, 0.5, 1);
			}

			&:nth-child(5) {
				animation: slide 0.5s 0.6s ease-in-out backwards;
			}

			&:hover {
				translate: 0 -1rem;

				& > :global(div) {
					opacity: 1;
				}
			}
		}
	}
</style>
