<script lang="ts">
	import { onMount, type ComponentType, onDestroy } from 'svelte';
	import {
		fetchGithub,
		formatRelativeDate,
		getHex,
		getIconColor,
		getIssueIcon,
		getPullRequestIcon,
		onScrollVisible
	} from '~/lib/helpers';
	import { Check, ExternalLink, Pin, Commit, Discussion, Release, Mail, Unpin } from '~/lib/icons';
	import type {
		Colors,
		GithubCommit,
		GithubIssue,
		GithubLabel,
		GithubNotification,
		GithubPullRequest,
		GithubRelease,
		GithubUser
	} from '~/lib/types';
	import { Button, Tooltip } from '../common';

	export let data: GithubNotification;

	let { repository, subject, unread, updated_at } = data;
	let [owner, repo] = repository.full_name.split('/');
	let time = formatRelativeDate(updated_at);
	let author: GithubUser | undefined;
	let description = '';
	let icon: ComponentType;
	let iconColor: Colors = 'blue';
	let { title } = subject;
	let number: number | undefined;
	let labels: GithubLabel[] | undefined;
	let url: string;
	let isNew = true;
	let pinned = false;
	let element: HTMLElement;
	let loaded = false;

	const interval = setInterval(() => {
		time = formatRelativeDate(updated_at);
	}, 60000);

	onMount(() => {
		onScrollVisible(element, async () => {
			// Handle discussion
			if (!subject.url) {
				loaded = true;
				if (subject.type === 'Discussion') {
					description = 'New activity on discussion';
					icon = Discussion;
				}
				return;
			}

			// Fetch additional data
			const data = (await fetchGithub(subject.url)) as
				| GithubCommit
				| GithubIssue
				| GithubPullRequest
				| GithubRelease;

			loaded = true;
			url = data.html_url;

			// Set data based on type
			switch (subject.type) {
				case 'Commit': {
					author = (data as GithubCommit).author;
					description = 'made a commit';
					icon = Commit;
					break;
				}

				case 'Issue': {
					const { labels: l, number: n } = data as GithubIssue;
					description = 'New activity on issue';
					icon = getIssueIcon(data as GithubIssue);
					iconColor = getIconColor(data as GithubIssue);
					number = n;
					labels = l;
					break;
				}

				case 'PullRequest': {
					const { user, merged, number: n, labels: l, state } = data as GithubPullRequest;
					author = user;
					description = `${
						merged ? 'merged' : state === 'open' ? 'opened' : 'closed'
					} this pull request`;
					icon = getPullRequestIcon(data as GithubPullRequest);
					iconColor = getIconColor(data as GithubPullRequest);
					number = n;
					labels = l;
					break;
				}

				case 'Release': {
					const { author: a, tag_name, prerelease } = data as GithubRelease;
					author = a;
					description = 'made a release';
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

	function handleToggle(key: 'read' | 'pinned') {
		return () => {
			// 	githubEvents.update((previous) =>
			// 		previous.map((event) => {
			// 			if (event.id !== id) {
			// 				return event;
			// 			}
			// 			if (key === 'pinned' && $settings.readWhenPin) {
			// 				return { ...event, [key]: !event[key], read: true };
			// 			}
			// 			return { ...event, [key]: !event[key] };
			// 		})
			// 	);
			// 	if (pinned) {
			// 		read = !read;
			// 	}
		};
	}

	function handleOpenInBrowser() {
		// if ($settings.readWhenOpenInBrowser) {
		// 	githubEvents.update((previous) =>
		// 		previous.map((event) => (event.id === id ? { ...event, read: true } : event))
		// 	);
		// }
	}

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="event" on:mouseenter={isNew ? () => (isNew = false) : undefined} bind:this={element}>
	{#if isNew && unread}
		<div class="new" />
	{/if}
	<div class="top">
		<p class="repo">{owner}/<span class="bold">{repo}</span></p>
		<p class="time">{time}</p>
	</div>
	{#if loaded}
		<p class="description">
			{#if author}
				{author.login}
				<img class="image" src={author.avatar_url} alt="" />
				<span class="subtle">
					{description}
				</span>
			{:else}
				{description}
			{/if}
		</p>
	{:else}
		<div class="loader" />
	{/if}
	<div class="main">
		<span class="icon-container" style:color={getHex(iconColor)}>
			<svelte:component this={icon} />
		</span>
		<h3 class="title">{title}</h3>
		{#if number}
			<span class="number">#{number}</span>
		{/if}
	</div>
	{#if labels && labels.length}
		<ul class="labels">
			{#each labels as label}
				<li class="label" style:color={`#${label.color}`}>{label.name}</li>
			{/each}
		</ul>
	{/if}
	<div class="over">
		<Tooltip content="Mark as {unread ? '' : 'un'}read" position="left">
			<Button type={unread ? 'primary' : 'secondary'} small on:click={handleToggle('read')}>
				{#if unread}
					<Check />
				{:else}
					<Mail />
				{/if}
			</Button>
		</Tooltip>
		{#if url}
			<Tooltip content="Open in GitHub" position="left">
				<Button type="secondary" small href={url} external on:click={handleOpenInBrowser}
					><ExternalLink /></Button
				>
			</Tooltip>
		{/if}
		<Tooltip content={pinned ? 'Unpin' : 'Pin'} position="left">
			<Button type="secondary" small on:click={handleToggle('pinned')}>
				{#if pinned}
					<Unpin />
				{:else}
					<Pin />
				{/if}
			</Button>
		</Tooltip>
	</div>
</div>

<style lang="scss">
	.event {
		background-color: variables.$grey-2;
		border: 1px solid variables.$grey-3;
		border-radius: variables.$radius;
		padding: 1rem;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;

		&:not(:hover) {
			.over {
				opacity: 0;
			}
		}
	}

	.new {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background-color: variables.$blue-2;
		position: absolute;
		inset: 0.25rem 0 0 0.25rem;
		box-shadow: 0 0 0.5rem variables.$grey-2;
	}

	.top {
		@include typography.small;
		display: flex;
		justify-content: space-between;
		color: variables.$grey-4;

		.repo .bold {
			@include typography.bold;
		}
	}

	.description {
		.subtle {
			color: variables.$grey-4;
		}

		.image {
			display: inline-block;
			width: 1.25rem;
			height: 1.25rem;
			translate: 0 0.25rem;
		}

		.image {
			border-radius: 50%;
		}
	}

	.loader {
		width: 1.5rem;
		height: 1.5rem;
		background-image: conic-gradient(transparent, variables.$grey-4);
		border-radius: 50%;
		position: relative;
		animation: spin 1s linear infinite;

		&::before {
			content: '';
			position: absolute;
			inset: 0.25rem;
			background-color: variables.$grey-2;
			border-radius: 50%;
		}

		@keyframes spin {
			0% {
				transform: rotate(0deg);
			}
			100% {
				transform: rotate(360deg);
			}
		}
	}

	.main {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;

		.icon-container {
			flex: 0 0 2rem;

			:global(svg) {
				width: 2rem;
				height: 2rem;
			}
		}

		.title {
			@include typography.bold;
			flex: 0 1 auto;
			white-space: nowrap;
			overflow-x: hidden;
			text-overflow: ellipsis;
			padding-bottom: 2px;
		}

		.number {
			color: variables.$blue-3;
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
		inset: 0 0 0 auto;
		width: 12rem;
		background-image: linear-gradient(to right, transparent, variables.$grey-1);
		border-radius: 0 calc(variables.$radius - 1px) calc(variables.$radius - 1px) 0;
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
		align-items: end;
		justify-content: start;
		gap: 0.5rem;
		transition: opacity variables.$transition;
	}
</style>
