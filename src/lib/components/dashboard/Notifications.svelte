<script lang="ts">
	import { crossfade } from 'svelte/transition';
	import { cubicInOut } from 'svelte/easing';
	import { EventColumn, Separator } from '~/lib/components';
	import { filteredEvents, githubEvents } from '~/lib/stores';
	import { Check, Github, Gitlab, Mail, Pin } from '~/lib/icons';

	// Filter events
	$: pinned = $filteredEvents.filter((event) => event.pinned);
	$: unread = $filteredEvents.filter((event) => !event.pinned && !event.read);
	$: read = $filteredEvents.filter((event) => !event.pinned && event.read);

	// Animations settings
	const settings = { duration: 400, easing: cubicInOut };
	const [send, receive] = crossfade(settings);
	const transitions = { send, receive, settings };
</script>

<main class="main">
	<header class="header">
		<h1 class="title">Notifications</h1>
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
		</button>
	</nav>
	<section class="columns-container">
		<EventColumn icon={Pin} title="Pinned" events={pinned} {transitions} />
		<Separator vertical />
		<EventColumn icon={Mail} title="Unread" events={unread} {transitions} />
		<Separator vertical />
		<EventColumn icon={Check} title="Read" events={read} {transitions} />
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

		.title {
			@include typography.heading-1;
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
				color: variables.$grey-4;
			}

			.text {
				@include typography.bold;
			}

			.tag {
				@include typography.small;
				padding: 0.25rem 0.5rem;
				border-radius: variables.$radius;
				background-color: variables.$grey-3;
				color: white;
				display: flex;
				align-items: center;
				gap: 0.25rem;

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
	}
</style>
