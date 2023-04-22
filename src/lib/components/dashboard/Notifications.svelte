<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { NotificationColumn, Settings, Separator } from '~/lib/components';
	import { filteredNotifications, githubNotifications } from '~/lib/stores';
	import { Check, Github, Gitlab, Mail, Pin, Refresh } from '~/lib/icons';

	export let synced: boolean;

	let syncTime = 0;
	let interval: ReturnType<typeof setInterval>;

	// Filter events
	// $: pinned = $filteredNotifications.filter((event) => event.pinned);
	// $: unread = $filteredNotifications.filter((event) => !event.pinned && !event.read);
	// $: read = $filteredNotifications.filter((event) => !event.pinned && event.read);
	let pinned: unknown[] = [];
	$: unread = $githubNotifications.filter((event) => event.unread);
	$: read = $githubNotifications.filter((event) => !event.unread);

	$: showReadAll = unread.length > 0;

	$: if (synced && !syncTime) {
		interval = setInterval(() => {
			syncTime += 1;
		}, 1000);
	} else if (!synced) {
		syncTime = 0;
		clearInterval(interval);
	}

	function markAllAsRead() {
		// githubNotifications.update((previous) =>
		// 	previous.map((event) => (unread.includes(event) ? { ...event, read: true } : event))
		// );
	}

	// Animations settings
	const settings = { duration: 400, easing: cubicInOut };
	const [send, receive] = crossfade(settings);
	const transitions = { send, receive, settings };
</script>

<main class="main">
	<header class="header">
		<h1 class="title">Notifications</h1>
		<div class="sync-pill" class:loading={!synced}>
			<Refresh />
			{#if synced}
				Synced {syncTime}s ago
			{:else}
				Syncing...
			{/if}
		</div>
		<Settings />
	</header>
	<nav class="nav">
		<button class="tab selected">
			<Github />
			<p class="text">GitHub</p>
			<span class="tag">
				<Pin />
				{pinned.length}
			</span>
			<span class="tag">
				<Mail />
				{unread.length}
			</span>
		</button>
		<button class="tab">
			<Gitlab />
			<p class="text">GitLab</p>
			<div class="tag soon">Coming soon</div>
		</button>
	</nav>
	<section class="columns-container">
		<NotificationColumn
			icon={Pin}
			title="Pinned"
			events={[]}
			placeholder="Click on 📌 to mark an event as pinned."
			{transitions}
		/>
		<Separator vertical />
		<NotificationColumn
			icon={Mail}
			title="Unread"
			events={unread}
			placeholder="New notifications 🔔 will appear here."
			{transitions}
		/>
		<Separator vertical />
		<NotificationColumn
			icon={Check}
			title="Read"
			events={read}
			placeholder="Click on ✅ to mark an event as read."
			{transitions}
		/>
		{#if showReadAll}
			<button class="read-all" on:click={markAllAsRead}>
				<Check />
				All
			</button>
		{/if}
	</section>
</main>

<style lang="scss">
	.main {
		flex: 1 1 100%;
		height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.header {
		padding: 3rem 2rem 2rem;
		display: flex;
		align-items: center;

		.title {
			@include typography.heading-1;
		}

		.sync-pill {
			background-color: variables.$grey-3;
			border-radius: variables.$radius;
			padding: 0.25rem 0.5rem;
			color: variables.$grey-4;
			display: flex;
			align-items: center;
			gap: 0.25rem;
			margin: 0 auto 0 1rem;

			:global(svg) {
				height: 1.25rem;
				color: variables.$green;
			}

			&.loading {
				color: variables.$yellow;

				:global(svg) {
					color: variables.$yellow;
					animation: loading 1s linear infinite;

					@keyframes loading {
						0% {
							rotate: 0deg;
						}

						100% {
							rotate: 360deg;
						}
					}
				}
			}
		}
	}

	.nav {
		padding: 0 2rem;
		border-bottom: 1px solid variables.$grey-3;
		display: flex;

		.tab {
			padding: 0.75em 1em;
			border-radius: variables.$radius variables.$radius 0 0;
			display: flex;
			align-items: center;
			gap: 0.5rem;
			transition: opacity variables.$transition;

			:global(svg) {
				height: 1.25rem;
			}

			&.selected {
				border: 1px solid variables.$grey-3;
				border-bottom: none;
				position: relative;

				&::before {
					content: '';
					position: absolute;
					inset: auto 0 -1px 0;
					height: 1px;
					background-color: variables.$grey-1;
				}
			}

			&:not(.selected):not(:hover) {
				opacity: 0.5;
			}

			.text {
				@include typography.bold;
			}

			.tag {
				@include typography.small;
				padding: 0.25rem 0.5rem;
				border-radius: variables.$radius;
				background-color: variables.$grey-3;
				color: variables.$white;
				display: flex;
				align-items: center;
				gap: 0.25rem;

				&.soon {
					color: variables.$blue-3;
					background-color: variables.$blue-1;
				}

				:global(svg) {
					width: 1rem;
					height: 1rem;
				}
			}
		}
	}

	.columns-container {
		height: 100%;
		display: grid;
		grid-template-columns: 1fr 1px 1fr 1px 1fr;
		gap: 1.5rem;
		padding: 2rem;
		overflow: hidden;
		position: relative;

		.read-all {
			@include typography.small;
			@include typography.bold;

			position: absolute;
			top: 2rem;
			right: calc(33% + 2rem);
			height: 1.25rem;
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.25rem;
			color: variables.$blue-3;

			&:hover {
				filter: brightness(130%);
			}

			:global(svg) {
				height: 1rem;
			}
		}
	}
</style>
