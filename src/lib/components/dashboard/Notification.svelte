<script lang="ts">
	import { onDestroy } from 'svelte';
	import { invoke } from '@tauri-apps/api/tauri';
	import { Button, Tooltip } from '~/lib/components';
	import { CheckIcon, ExternalLinkIcon, PinIcon, UnpinIcon, UnreadIcon } from '~/lib/icons';
	import { fetchGithub, formatRelativeDate, lightenColor } from '~/lib/helpers';
	import { githubNotifications, settings } from '~/lib/stores';
	import type { NotificationData } from '~/lib/types';

	export let data: NotificationData;
	export let interactive = true;

	let {
		id,
		unread,
		pinned,
		isNew,
		author,
		title,
		description,
		time,
		icon,
		owner,
		repo,
		number,
		labels,
		url,
		previously
	} = data;
	let displayTime = formatRelativeDate(time);

	$: repoUrl = `https://github.com/${owner}/${repo}`;
	$: authorUrl = author && !author.bot ? `https://github.com/${author.login}` : '';
	$: previousAuthorUrl =
		previously?.author && !previously?.author.bot
			? `https://github.com/${previously.author.login}`
			: '';

	const interval = setInterval(() => {
		displayTime = formatRelativeDate(time);
	}, 60000);

	onDestroy(() => {
		clearInterval(interval);
	});

	function markAsReadInGitHub() {
		fetchGithub(`notifications/threads/${id}`, { method: 'PATCH' });
	}

	function handleToggle(key: 'unread' | 'pinned') {
		return () => {
			$githubNotifications = $githubNotifications.map((notification) => {
				if (notification.id !== id) {
					return notification;
				}
				if (key === 'pinned' && !notification.pinned && $settings.readWhenPin) {
					return { ...notification, pinned: !notification.pinned, unread: false, isNew: false };
				}
				return { ...notification, [key]: !notification[key], isNew: false };
			});

			if (pinned) {
				unread = !unread;
			}

			if (unread) {
				markAsReadInGitHub();
			}
		};
	}

	function handleOpenInBrowser() {
		if ($settings.readWhenOpenInBrowser) {
			$githubNotifications = $githubNotifications.map((event) => {
				if (event.id === id) {
					if (event.unread) {
						markAsReadInGitHub();
					}
					return { ...event, unread: false };
				}
				return event;
			});
		}
	}

	function handleMouseEnter() {
		isNew = false;
		if (window.__TAURI__) {
			invoke('update_tray', { newIcon: false });
		}
	}
</script>

<div class="container" class:unread>
	<div
		class="notification"
		on:mouseenter={isNew && interactive ? handleMouseEnter : undefined}
		role="presentation"
	>
		{#if isNew && unread}
			<div class="new" />
		{/if}
		<div class="top">
			<a class="repo" href={repoUrl} target="_blank" rel="noreferrer">
				{owner}/<span class="bold">{repo}</span>
			</a>
			<p class="time">{displayTime}</p>
		</div>
		<p class="description">
			{#if author}
				{#if author.avatar}
					<img class="image" src={author.avatar} alt="" width="20px" height="20px" loading="lazy" />
				{/if}
				{#if authorUrl}
					<a class="strong clickable" href={authorUrl} target="_blank" rel="noreferrer">
						{author.login}
					</a>
				{:else}
					<span class="strong">{author.login}</span>
				{/if}
				{description}
			{:else}
				<span class="strong">{description}</span>
			{/if}
		</p>
		<div class="main">
			<span class="icon-container">
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
					<li class="label" style:color={lightenColor(label.color)}>
						{label.name}
						<div class="label-background" style:background-color={`#${label.color}`} />
					</li>
				{/each}
			</ul>
		{/if}
		{#if interactive}
			<div class="over">
				<Tooltip content="Mark as {unread ? '' : 'un'}read" position="left" hover>
					<Button type={unread ? 'primary' : 'secondary'} small on:click={handleToggle('unread')}>
						{#if unread}
							<CheckIcon />
						{:else}
							<UnreadIcon />
						{/if}
					</Button>
				</Tooltip>
				{#if url}
					<Tooltip content="Open in GitHub" position="left" hover>
						<Button type="secondary" small href={url} external on:click={handleOpenInBrowser}>
							<ExternalLinkIcon />
						</Button>
					</Tooltip>
				{:else}
					<Tooltip content="Cannot open in GitHub" position="left" hover>
						<Button type="secondary" small disabled>
							<ExternalLinkIcon />
						</Button>
					</Tooltip>
				{/if}
				<Tooltip content={pinned ? 'Unpin' : 'Pin'} position="left" hover>
					<Button type="secondary" small on:click={handleToggle('pinned')}>
						{#if pinned}
							<UnpinIcon />
						{:else}
							<PinIcon />
						{/if}
					</Button>
				</Tooltip>
			</div>
		{/if}
	</div>
	{#if previously}
		<div class="previously">
			<div class="description">
				<span>Previously: </span>
				{#if previously.author}
					{#if previously.author.avatar}
						<img
							class="image"
							src={previously.author.avatar}
							alt=""
							width="20px"
							height="20px"
							loading="lazy"
						/>
					{/if}
					{#if previousAuthorUrl}
						<a class="strong clickable" href={previousAuthorUrl} target="_blank" rel="noreferrer">
							{previously.author.login}
						</a>
					{:else}
						<span class="strong">{previously.author.login}</span>
					{/if}
				{/if}
				{previously.description}
			</div>
		</div>
	{/if}
</div>

<style lang="scss">
	.container {
		&:not(:hover) {
			.over {
				opacity: 0;
			}
		}

		&:not(.unread) {
			opacity: 0.65;
			transition: opacity variables.$transition;

			&:hover {
				opacity: 1;
			}
		}
	}

	.notification {
		background-color: variables.$grey-2;
		border: 1px solid variables.$grey-3;
		border-radius: variables.$radius;
		padding: 1rem;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
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

		.repo {
			&:hover {
				text-decoration: underline;
			}

			.bold {
				@include typography.bold;
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
			overflow: hidden;
			text-overflow: ellipsis;
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

			.label-background {
				position: absolute;
				inset: 0;
				border-radius: variables.$radius;
				opacity: 0.1;
			}
		}
	}

	.over {
		position: absolute;
		inset: 0 0 0 auto;
		display: flex;
		flex-direction: column;
		padding: 0.5rem;
		align-items: end;
		justify-content: start;
		gap: 0.5rem;
		transition: opacity variables.$transition;

		&::before {
			content: '';
			position: absolute;
			inset: 0 0 0 auto;
			width: 12rem;
			background-image: linear-gradient(to right, transparent, variables.$grey-1);
			border-radius: 0 calc(variables.$radius - 1px) calc(variables.$radius - 1px) 0;
			pointer-events: none;
		}
	}

	.description {
		@include typography.base;
		width: 100%;
		color: variables.$grey-4;
		display: -webkit-box;
		overflow: hidden;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		word-wrap: break-word;

		.strong {
			color: variables.$white;

			&.clickable:hover {
				text-decoration: underline;
			}
		}

		.image {
			display: inline;
			vertical-align: sub;
			border-radius: 50%;
		}
	}

	.previously {
		padding: 0.75rem 1rem;
		position: relative;

		&::before,
		&::after {
			content: '';
			position: absolute;
			inset: -0.5rem 0 0;
			z-index: -1;
		}

		&::before {
			background-color: variables.$grey-2;
			border: 1px solid variables.$grey-3;
			border-radius: 0 0 variables.$radius variables.$radius;
		}

		&::after {
			background-image: linear-gradient(rgba(variables.$grey-1, 0.75), transparent);
		}
	}
</style>
