<script lang="ts">
	import { onDestroy } from 'svelte';
	import { fetchGithub, formatRelativeDate, getHex } from '~/lib/helpers';
	import { Check, ExternalLink, Pin, Mail, Unpin } from '~/lib/icons';
	import { Button, Tooltip } from '../common';
	import { githubNotifications, settings } from '~/lib/stores';
	import type { NotificationData } from '~/lib/types';

	export let data: NotificationData;

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
		iconColor,
		owner,
		repo,
		number,
		labels,
		url
	} = data;
	let displayTime = formatRelativeDate(time);

	const interval = setInterval(() => {
		displayTime = formatRelativeDate(time);
	}, 60000);

	onDestroy(() => {
		clearInterval(interval);
	});

	function handleToggle(key: 'unread' | 'pinned') {
		return () => {
			githubNotifications.update((previous) =>
				previous.map((notification) => {
					if (notification.id !== id) {
						return notification;
					}
					if (key === 'pinned' && !notification.pinned && $settings.readWhenPin) {
						return { ...notification, pinned: !notification.pinned, unread: false };
					}
					return { ...notification, [key]: !notification[key] };
				})
			);

			if (pinned) {
				unread = !unread;
			}

			// Mark as read in GitHub
			if (unread) {
				fetchGithub(`notifications/threads/${id}`, { method: 'PATCH' });
			}
		};
	}

	function handleOpenInBrowser() {
		if ($settings.readWhenOpenInBrowser) {
			githubNotifications.update((previous) =>
				previous.map((event) => (event.id === id ? { ...event, unread: false } : event))
			);
		}
	}
</script>

<div class="notification" on:mouseenter={isNew ? () => (isNew = false) : undefined}>
	{#if isNew && unread}
		<div class="new" />
	{/if}
	<div class="top">
		<p class="repo">{owner}/<span class="bold">{repo}</span></p>
		<p class="time">{displayTime}</p>
	</div>
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
			<Button type={unread ? 'primary' : 'secondary'} small on:click={handleToggle('unread')}>
				{#if unread}
					<Check />
				{:else}
					<Mail />
				{/if}
			</Button>
		</Tooltip>
		{#if url}
			<Tooltip content="Open in GitHub" position="left">
				<Button type="secondary" small href={url} external on:click={handleOpenInBrowser}>
					<ExternalLink />
				</Button>
			</Tooltip>
		{:else}
			<Tooltip content="Cannot open in GitHub" position="left">
				<Button type="secondary" small disabled>
					<ExternalLink />
				</Button>
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
	.notification {
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
