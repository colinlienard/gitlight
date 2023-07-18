<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Button, Tooltip } from '~/lib/components';
	import { fetchGithub, formatRelativeDate, lightenColor } from '~/lib/helpers';
	import {
		CheckIcon,
		DoubleCheckIcon,
		ExternalLinkIcon,
		PinIcon,
		PriorityDownIcon,
		PriorityUpIcon,
		RestoreIcon,
		UnpinIcon,
		UnreadIcon
	} from '~/lib/icons';
	import { githubNotifications, settings } from '~/lib/stores';
	import type { NotificationData } from '~/lib/types';

	export let data: NotificationData;
	export let dragged = false;
	export let interactive = true;

	let {
		id,
		unread,
		pinned,
		done,
		isNew,
		author,
		title,
		description,
		priority,
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

	function handleToggle(key: 'unread' | 'pinned' | 'done') {
		return () => {
			$githubNotifications = $githubNotifications.map((notification) => {
				if (notification.id !== id) return notification;
				if (key === 'pinned' && !notification.pinned && $settings.readWhenPin) {
					return { ...notification, pinned: !notification.pinned, unread: false, isNew: false };
				}
				return { ...notification, [key]: !notification[key], isNew: false };
			});

			if (pinned) {
				unread = !unread;
			}

			if (key === 'unread' && unread) {
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
		$githubNotifications = $githubNotifications.map((event) =>
			event.id === id ? { ...event, isNew: false } : event
		);
	}
</script>

<div class="container" class:dragged>
	<div
		class="notification"
		class:transparent={!unread && !done}
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
		<Tooltip content={title} position="bottom left" width="calc(100% - 2.5rem)" hover>
			<div class="main">
				<span class="icon-container">
					<svelte:component this={icon} />
				</span>
				<div class="texts">
					<div class="title-container">
						<h3 class="title">{title}</h3>
						{#if number}
							<span class="number">#{number}</span>
						{/if}
					</div>
					{#if $settings.prioritySorting && priority}
						<div class="priority {priority.value > 0 ? 'up' : 'down'}">
							{#if priority.value > 0}
								<PriorityUpIcon />
							{:else}
								<PriorityDownIcon />
							{/if}
							<span>{priority.label}</span>
						</div>
					{/if}
				</div>
			</div>
		</Tooltip>
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
		{#if !dragged && interactive}
			<div class="over">
				{#if !done}
					{#if !unread && !pinned}
						<Tooltip content="Mark as done" position="left" hover>
							<Button icon on:click={handleToggle('done')}>
								<DoubleCheckIcon />
							</Button>
						</Tooltip>
					{/if}
					{#if unread}
						<Tooltip content="Mark as read" position="left" hover>
							<Button icon on:click={handleToggle('unread')}>
								<CheckIcon />
							</Button>
						</Tooltip>
					{:else}
						<Tooltip content="Mark as unread" position="left" hover>
							<Button secondary icon on:click={handleToggle('unread')}>
								<UnreadIcon />
							</Button>
						</Tooltip>
					{/if}
					{#if unread || pinned}
						<Tooltip content={pinned ? 'Unpin' : 'Pin'} position="left" hover>
							<Button secondary icon on:click={handleToggle('pinned')}>
								{#if pinned}
									<UnpinIcon />
								{:else}
									<PinIcon />
								{/if}
							</Button>
						</Tooltip>
					{/if}
				{:else}
					<Tooltip content="Restore" position="left" hover>
						<Button icon on:click={handleToggle('done')}>
							<RestoreIcon />
						</Button>
					</Tooltip>
				{/if}
				{#if url}
					<Tooltip content="Open in GitHub" position="left" hover>
						<Button secondary icon href={url} external on:click={handleOpenInBrowser}>
							<ExternalLinkIcon />
						</Button>
					</Tooltip>
				{:else}
					<Tooltip content="Cannot open in GitHub" position="left" hover>
						<Button secondary icon disabled>
							<ExternalLinkIcon />
						</Button>
					</Tooltip>
				{/if}
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
		border-radius: variables.$radius;
		background-color: variables.$grey-1;
		isolation: isolate;

		&:not(:hover) {
			.over {
				opacity: 0;
			}
		}

		&.dragged {
			@include mixins.modal-shadow;

			rotate: -4deg;
			transition: variables.$transition;
		}
	}

	.notification {
		@include mixins.box;

		position: relative;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		gap: 0.75rem;

		&.transparent {
			opacity: 0.65;
			transition: opacity variables.$transition;

			&:hover {
				opacity: 1;
			}
		}
	}

	.new {
		position: absolute;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 50%;
		background-color: variables.$blue-2;
		inset: 0.25rem 0.25rem auto auto;
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
		width: 100%;
		align-items: center;
		gap: 0.5rem;

		.icon-container {
			flex: 0 0 2rem;

			:global(svg) {
				width: 2rem;
				height: 2rem;
			}
		}

		.texts {
			display: flex;
			overflow: hidden;
			flex-direction: column;
			gap: 0.25rem;

			.title-container {
				display: flex;
				overflow: hidden;
				gap: 0.5ch;

				.title {
					@include typography.bold;

					overflow: hidden;
					flex: 0 1 auto;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.number {
					color: variables.$blue-3;
				}
			}

			.priority {
				@include typography.small;

				display: flex;
				align-items: center;
				gap: 0.25rem;

				&.up {
					color: variables.$yellow;
				}

				&.down {
					color: variables.$red;
				}

				:global(svg) {
					height: 1rem;
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

			position: relative;
			padding: 0.25rem 0.5rem;
			border: 1px solid;
			border-radius: variables.$radius;

			.label-background {
				position: absolute;
				border-radius: variables.$radius;
				inset: 0;
				opacity: 0.1;
			}
		}
	}

	.over {
		position: absolute;
		display: flex;
		flex-direction: column;
		align-items: end;
		justify-content: start;
		padding: 0.5rem;
		gap: 0.5rem;
		inset: 0 0 0 auto;
		transition: opacity variables.$transition;

		&::before {
			position: absolute;
			width: 12rem;
			border-radius: 0 calc(variables.$radius - 1px) calc(variables.$radius - 1px) 0;
			background-image: linear-gradient(to right, transparent, variables.$grey-1);
			content: '';
			inset: 0 0 0 auto;
			pointer-events: none;
		}
	}

	.description {
		@include typography.base;

		display: -webkit-box;
		overflow: hidden;
		width: 100%;
		-webkit-box-orient: vertical;
		color: variables.$grey-4;
		-webkit-line-clamp: 2;
		word-wrap: break-word;

		.strong {
			color: variables.$white;

			&.clickable:hover {
				text-decoration: underline;
			}
		}

		.image {
			display: inline;
			border-radius: 50%;
			vertical-align: sub;
		}
	}

	.previously {
		position: relative;
		padding: 0.75rem 1rem;

		&::before,
		&::after {
			position: absolute;
			z-index: -1;
			content: '';
			inset: -0.5rem 0 0;
		}

		&::before {
			border: 1px solid variables.$grey-3;
			border-radius: 0 0 variables.$radius variables.$radius;
			background-color: variables.$grey-2;
		}

		&::after {
			background-image: linear-gradient(rgba(variables.$grey-1, 0.75), transparent);
		}
	}
</style>
