<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchGithub, formatRelativeDate, onScrollVisible } from '../helpers';
	import {
		Check,
		ExternalLink,
		Pin,
		PullRequestOpen,
		PullRequestClosed,
		PullRequestMerged,
		Commit
	} from '../icons';
	import Release from '../icons/Release.svelte';
	import type {
		TNotification,
		TNotificationCommit,
		TNotificationPullRequest,
		TNotificationRelease,
		TPullRequestLabel
	} from '../types';

	export let notification: TNotification;

	let element: HTMLElement;
	let loaded = false;
	let read: boolean;
	let imageUrl: string;
	let title: string;
	let time: string;
	let icon: ConstructorOfATypedSvelteComponent;
	let owner: string;
	let repo: string;
	let message: string;
	let id: string | null = null;
	let labels: TPullRequestLabel[] | null = null;
	let link: string;

	onMount(() => {
		onScrollVisible(element, async () => {
			// Set common data
			read = !notification.unread;
			time = formatRelativeDate(notification.updated_at);
			owner = notification.repository.full_name.split('/')[0];
			repo = notification.repository.full_name.split('/')[1];
			message = notification.subject.title;

			if (!notification.subject.url) {
				loaded = true;
				return;
			}

			// Fetch additional data
			const data = await fetchGithub(notification.subject.url);
			if (!data) {
				return;
			}

			loaded = true;
			link = data.html_url;

			// Set data based on type
			switch (notification.subject.type) {
				case 'Commit': {
					const { author } = data as TNotificationCommit;
					imageUrl = author.avatar_url;
					title = `${author.login} committed`;
					icon = Commit;
					break;
				}

				case 'Issue':
					break;

				case 'PullRequest': {
					const {
						user,
						merged,
						number,
						labels: labelsData,
						state
					} = data as TNotificationPullRequest;
					imageUrl = user.avatar_url;
					title = `${user.login} ${merged ? 'merged' : state === 'open' ? 'opened' : 'closed'}`;
					icon = merged
						? PullRequestMerged
						: state === 'open'
						? PullRequestOpen
						: PullRequestClosed;
					id = `#${number}`;
					labels = labelsData;
					break;
				}

				case 'Release': {
					const { author, tag_name, prerelease } = data as TNotificationRelease;
					imageUrl = author.avatar_url;
					title = `${author.login} released`;
					icon = Release;
					labels = [
						{ name: tag_name, color: 'white' },
						...(prerelease ? [{ name: 'pre-release', color: 'FFA723' }] : [])
					];
					break;
				}

				default:
					break;
			}
		});
	});
</script>

{#if loaded}
	<div class="notification" class:read>
		<span class="time">{time}</span>
		<div class="main">
			<img class="image" src={imageUrl} alt="" />
			<h3 class="message">{title}</h3>
		</div>
		<div class="target">
			<svelte:component this={icon} />
			<div class="target-content">
				<small class="repo">{owner}/<span class="bold">{repo}</span></small>
				<div class="name-container">
					<h4 class="target-name">{message}</h4>
					{#if id}
						<p class="target-id">{id}</p>
					{/if}
				</div>
			</div>
		</div>
		{#if labels && labels.length > 0}
			<ul class="labels">
				{#each labels as label}
					<li class="label" style:color={`#${label.color}`}>{label.name}</li>
				{/each}
			</ul>
		{/if}
		<div class="over">
			<a class="button" href={link} target="_blank" rel="noreferrer"><ExternalLink /></a>
			<button class="button"><Check /></button>
			<button class="button"><Pin /></button>
		</div>
	</div>
{:else}
	<div class="skeleton" bind:this={element}>
		<div class="main">
			<div class="image" />
			<div class="message" />
		</div>
		<div class="target">
			<div class="icon" />
			<div class="text" />
		</div>
	</div>
{/if}

<style lang="scss">
	.notification,
	.skeleton {
		@include mixins.shadow;
		background-image: linear-gradient(variables.$grey-3, variables.$grey-2);
		border-radius: variables.$radius;
		padding: 1rem;
		position: relative;
		isolation: isolate;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 350px;
		transition: opacity 0.1s ease-in-out;

		&::before {
			content: '';
			position: absolute;
			inset: 1px;
			border-radius: calc(variables.$radius - 1px);
			background-color: variables.$grey-2;
			z-index: -1;
		}
	}

	.notification {
		&:not(&.read) {
			opacity: 0.75;

			&:hover {
				opacity: 1;
			}
		}

		&:not(&:hover) {
			.over {
				opacity: 0;
			}
		}

		.time {
			@include typography.small;
			position: absolute;
			inset: 1rem 1rem auto auto;
			color: variables.$grey-4;
		}

		.main {
			display: flex;
			gap: 0.5rem;
			padding-left: 0.5rem;

			.image {
				width: 1.5rem;
				height: 1.5rem;
				border-radius: 50%;
			}

			.message {
				@include typography.bold;
				max-width: calc(100% - 3.5rem);
				margin-top: 0.25rem;
			}
		}

		.target {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			width: 100%;

			:global(svg) {
				flex: 0 0 2rem;
				height: 2rem;
			}

			.target-content {
				display: flex;
				flex-direction: column;
				gap: 0.25rem;
				flex: 0 1 auto;
				overflow: hidden;

				.repo {
					@include typography.small;
					color: variables.$grey-4;

					.bold {
						@include typography.bold;
					}
				}

				.name-container {
					display: flex;
					align-items: baseline;
					gap: 0.25rem;

					.target-name {
						flex: 0 1 auto;
						white-space: nowrap;
						overflow-x: hidden;
						text-overflow: ellipsis;
						padding-bottom: 2px;
					}

					.target-id {
						color: variables.$blue-3;
					}
				}
			}
		}

		.labels {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5rem;

			.label {
				@include typography.small;
				padding: 0.25rem 0.5rem;
				border-radius: variables.$radius;
				border: 1px solid;
				position: relative;

				&::before {
					content: '';
					position: absolute;
					inset: 0;
					border-radius: variables.$radius;
					background-color: currentColor;
					opacity: 0.1;
				}
			}
		}

		.over {
			position: absolute;
			inset: 0;
			background-image: radial-gradient(variables.$grey-1, rgba(variables.$grey-1, 0.25));
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;
			transition: inherit;

			.button {
				padding: 0.5rem;
				background-color: variables.$grey-3;
				border-radius: variables.$radius;

				:global(svg) {
					width: 1.25rem;
					height: 1.25rem;
				}

				&:hover {
					background-color: variables.$blue-2;
				}
			}
		}
	}

	.skeleton {
		.main {
			display: flex;
			gap: 1rem;
			height: 1.5rem;
			padding-left: 1rem;

			.image {
				@include mixins.skeleton(1.5rem, 1.5rem);
			}

			.message {
				@include mixins.skeleton(60%);
			}
		}

		.target {
			display: flex;
			gap: 1rem;
			height: 2.5rem;

			.icon {
				@include mixins.skeleton(2.5rem, 2.5rem);
			}

			.text {
				@include mixins.skeleton(70%);
			}
		}
	}
</style>
