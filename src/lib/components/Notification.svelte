<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchGithub, formatRelativeDate } from '../helpers';
	import {
		Check,
		ExternalLink,
		Pin,
		PullRequestOpen,
		PullRequestClosed,
		PullRequestMerged,
		Commit
	} from '../icons';
	import type {
		TNotification,
		TNotificationCommit,
		TNotificationPullRequest,
		TPullRequestLabel
	} from '../types';

	export let notification: TNotification;

	let loaded = false;
	let imageUrl: string;
	let title: string;
	let time: string;
	let icon: ConstructorOfATypedSvelteComponent;
	let repo: string;
	let message: string;
	let id: string | null = null;
	let labels: TPullRequestLabel[] | null = null;

	onMount(async () => {
		const data = await fetchGithub(notification.subject.url);
		if (!data) {
			return;
		}

		loaded = true;
		time = formatRelativeDate(notification.updated_at);
		repo = notification.repository.full_name;
		message = notification.subject.title;

		console.log(notification, data);

		switch (notification.subject.type) {
			case 'Commit':
				const { author } = data as TNotificationCommit;
				imageUrl = author.avatar_url;
				title = `${author.login} made a commit`;
				icon = Commit;
				break;

			case 'Issue':
				break;

			case 'PullRequest':
				const {
					user,
					merged,
					number,
					labels: labelsData,
					state
				} = data as TNotificationPullRequest;
				imageUrl = user.avatar_url;
				title = `${user.login} ${merged ? 'merged' : '?'} this PR`;
				icon = merged ? PullRequestMerged : PullRequestClosed;
				id = `#${number}`;
				labels = labelsData;
				break;

			case 'Release':
				break;

			default:
				break;
		}
	});
</script>

{#if loaded}
	<div class="notification">
		<span class="time">{time}</span>
		<div class="main">
			<img class="image" src={imageUrl} alt="" />
			<h3 class="message">{title}</h3>
		</div>
		<div class="thread">
			<svelte:component this={icon} />
			<div class="thread-content">
				<small class="repo">{repo}</small>
				<div class="name-container">
					<h4 class="thread-name">{message}</h4>
					{#if id}
						<p class="thread-id">{id}</p>
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
			<button class="button"><ExternalLink /></button>
			<button class="button"><Check /></button>
			<button class="button"><Pin /></button>
		</div>
	</div>
{/if}

<style lang="scss">
	.notification {
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

		&::before {
			content: '';
			position: absolute;
			inset: 1px;
			border-radius: calc(variables.$radius - 1px);
			background-color: variables.$grey-2;
			z-index: -1;
		}

		&:not(&:hover) {
			.over {
				opacity: 0;
			}
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

	.thread {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;

		:global(svg) {
			flex: 0 0 2rem;
			height: 2rem;
		}

		.thread-content {
			display: flex;
			flex-direction: column;
			gap: 0.25rem;
			flex: 0 1 auto;
			overflow: hidden;

			.repo {
				@include typography.small;
				color: variables.$grey-4;
			}

			.name-container {
				display: flex;
				align-items: baseline;
				gap: 0.25rem;

				.thread-name {
					flex: 0 1 auto;
					white-space: nowrap;
					overflow-x: hidden;
					text-overflow: ellipsis;
					padding-bottom: 2px;
				}

				.thread-id {
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
		background-image: radial-gradient(variables.$grey-1 10%, transparent);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: opacity 0.1s ease-in-out;

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
</style>
