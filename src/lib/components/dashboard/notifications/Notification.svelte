<script lang="ts">
	import { open } from '@tauri-apps/api/shell';
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
	import NotificationDescription from './NotificationDescription.svelte';

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
	let repoUrl = `https://github.com/${owner}/${repo}`;
	let hoverTitle = false;
	let hoverTitleTimeout: ReturnType<typeof setTimeout>;

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
		url && openUrl(url);
	}

	function handleMouseEnter() {
		$githubNotifications = $githubNotifications.map((event) =>
			event.id === id ? { ...event, isNew: false } : event
		);
	}

	function handleTitleHover(event: MouseEvent) {
		if (event.type === 'mouseenter') {
			hoverTitleTimeout = setTimeout(() => {
				hoverTitle = true;
			}, 150);
			return;
		}

		hoverTitle = false;
		clearTimeout(hoverTitleTimeout);
	}

	function openUrl(url: string) {
		if (dragged) return;
		if (window.__TAURI__) {
			open(url);
			return;
		}
		window.open(url, '_blank');
	}
</script>

<div class="container" class:transparent={!unread && !done} class:dragged>
	<div
		class="notification"
		on:mouseenter={isNew && interactive ? handleMouseEnter : undefined}
		role="presentation"
	>
		{#if isNew && unread}
			<div class="new" />
		{/if}
		{#if $settings.showNotificationsRepo}
			<div class="top">
				<button class="repo" on:mouseup={() => openUrl(repoUrl)}>
					{owner}/<span class="bold">{repo}</span>
				</button>
				<p class="time">{displayTime}</p>
			</div>
		{/if}
		<div class="description">
			<NotificationDescription {author} {description} {openUrl} />
			{#if !$settings.showNotificationsRepo}
				<p class="time">{displayTime}</p>
			{/if}
		</div>
		<div class="main" class:has-priority={priority && $settings.showPriority}>
			<span class="icon-container">
				<svelte:component this={icon} />
			</span>
			<div class="texts">
				<div
					class="title-container"
					class:no-overflow={hoverTitle}
					on:mouseenter={handleTitleHover}
					on:mouseleave={handleTitleHover}
					on:mouseup={handleOpenInBrowser}
					role="presentation"
				>
					<h3 class="title">{title}</h3>
					{#if number}
						<span class="number">#{number}</span>
					{/if}
				</div>
				{#if priority && $settings.showPriority}
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
						<Button secondary icon on:click={handleOpenInBrowser}>
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
			<NotificationDescription
				author={previously.author}
				description={previously.description}
				prefix="Previously, "
				{openUrl}
			/>
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

		&.transparent {
			opacity: 0.65;
			transition: opacity variables.$transition;

			&:hover {
				opacity: 1;
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
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.5rem;

		.repo {
			overflow: hidden;
			width: 100%;
			text-align: left;
			text-overflow: ellipsis;
			white-space: nowrap;

			&:hover {
				text-decoration: underline;
			}

			.bold {
				@include typography.bold;
			}
		}
	}

	.description {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-top: -0.1rem;
		gap: 0.75rem;
	}

	.time,
	.repo {
		@include typography.small;

		color: variables.$grey-4;
	}

	.main {
		display: flex;
		width: 100%;
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
			margin-top: 0.35rem;

			.title-container {
				@include typography.base;

				display: flex;
				overflow: hidden;
				gap: 0.5ch;

				.title {
					display: inline;
					overflow: hidden;
					flex: 0 1 auto;
					cursor: pointer;
					hyphens: auto;
					text-overflow: ellipsis;
					white-space: nowrap;
				}

				.number {
					color: variables.$blue-3;
				}

				&:hover * {
					text-decoration: underline;
				}

				&.no-overflow {
					display: unset;
					padding-right: 3rem;

					.title {
						white-space: unset;
					}

					.number {
						text-decoration: underline;
					}
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

		&.has-priority {
			.icon-container {
				margin-top: 0.2rem;
			}

			.texts {
				margin-top: 0;
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
			width: 8rem;
			border-radius: 0 calc(variables.$radius - 1px) calc(variables.$radius - 1px) 0;
			background-image: linear-gradient(to right, transparent, variables.$grey-1);
			content: '';
			inset: 0 0 0 auto;
			pointer-events: none;
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
