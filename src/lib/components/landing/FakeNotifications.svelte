<script lang="ts">
	import type { NotificationData } from '$lib/types';
	import Notification from '../dashboard/notifications/Notification.svelte';

	const common = {
		id: '',
		from: 'github',
		status: 'unread',
		repoId: '',
		ownerAvatar: '',
		url: '',
		muted: false
	} as const;

	const commonAuthor = {
		display_login: '',
		name: '',
		url: ''
	};

	const fakeNotifications: NotificationData[] = [
		{
			...common,
			type: 'commit',
			author: {
				...commonAuthor,
				login: 'colinlienard',
				avatar: 'https://avatars.githubusercontent.com/u/64312634?v=4'
			},
			title: 'feat(back): tauri functionnalities',
			description: 'made a commit',
			time: new Date().toString(),
			icon: 'commit',
			repository: {
				id: 1,
				url: 'https://github.com/colinlienard/gitlight',
				namespace: 'colinlienard/gitlight',
				domain: 'github.com'
			}
		},
		{
			...common,
			type: 'pr',
			author: {
				...commonAuthor,
				login: 'QuiiBz',
				avatar: 'https://avatars.githubusercontent.com/u/43268759?v=4'
			},
			title: 'feat(astro): write config if not present when building',
			description: '*merged* this pull request',
			time: new Date().toString(),
			icon: 'merged-pr',
			repository: {
				id: 1,
				url: 'https://github.com/lagonapp/lagon',
				namespace: 'lagonapp/lagon',
				domain: 'github.com'
			},
			number: 845,
			labels: [
				{ name: 'feature', color: 'a2eeef' },
				{ name: 'integration', color: 'b3878f' }
			]
		},
		{
			...common,
			type: 'pr',
			author: {
				...commonAuthor,
				login: 'lucasfernog',
				avatar: 'https://avatars.githubusercontent.com/u/20051258?v=4'
			},
			title: 'feat(cli): add rustls as default Cargo feature',
			description: '*merged* this pull request',
			time: new Date(new Date().getTime() - 1000000).toString(),
			icon: 'merged-pr',
			repository: {
				id: 1,
				url: 'https://github.com/tauri-apps/tauri',
				namespace: 'tauri-apps/tauri',
				domain: 'github.com'
			},
			number: 6900
		},
		{
			...common,
			type: 'issue',
			author: {
				...commonAuthor,
				login: 'Rich-Harris',
				avatar: 'https://avatars.githubusercontent.com/u/1162160?v=4'
			},
			title: 'TS to JSDoc Conversion',
			description:
				'*commented*: _The Svelte repo is currently in the process of heavy restructuring for Svelte 4. After that, work on Svelte 5 will likely change_',
			time: new Date(new Date().getTime() - 10000000).toString(),
			icon: 'open-issue',
			repository: {
				id: 1,
				url: 'https://github.com/sveltejs/svelte',
				namespace: 'sveltejs/svelte',
				domain: 'github.com'
			},
			number: 8569,
			labels: [{ name: 'breaking change', color: 'd73a4a' }]
		},
		{
			...common,
			type: 'pr',
			author: {
				...commonAuthor,
				login: 'colinlienard',
				avatar: 'https://avatars.githubusercontent.com/u/64312634?v=4'
			},
			title: 'feat(front): add the landing page',
			description: '*opened* this pull request',
			time: new Date(new Date().getTime() - 23000).toString(),
			icon: 'open-pr',
			repository: {
				id: 1,
				url: 'https://github.com/colinlienard/gitlight',
				namespace: 'colinlienard/gitlight',
				domain: 'github.com'
			},
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
		position: relative;
		margin-top: 4rem;
		margin-bottom: auto;

		@include screens.mobile {
			display: none;
		}

		.notification-container {
			width: 23rem;
			border-radius: variables.$radius;
			background-color: variables.$bg-1;
			transition: translate variables.$transition;

			&:not(:nth-child(5)) {
				position: absolute;
			}

			& > :global(div) {
				box-shadow: variables.$shadow;
			}

			@keyframes slide {
				from {
					opacity: 0;
					transform: perspective(500px) rotate3d(1, 0, 0, -45deg);
					translate: 0 4rem;
				}

				to {
					opacity: 1;
					transform: perspective(500px) rotate3d(1, 0, 0, 0deg);
					translate: 0;
				}
			}

			@mixin notification($top, $left, $rotate, $opacity, $animation-stagger) {
				top: $top;
				left: $left;
				animation: slide 0.5s calc(#{$animation-stagger} * 0.2s + 0.6s) ease-in-out backwards;
				rotate: $rotate;

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
