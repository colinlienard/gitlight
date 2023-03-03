<script lang="ts">
	import { onMount } from 'svelte';
	import { fetchGithub } from '../helpers';
	import Check from '../icons/Check.svelte';
	import ExternalLink from '../icons/ExternalLink.svelte';
	import Pin from '../icons/Pin.svelte';
	import PrOpen from '../icons/PROpen.svelte';
	import type { TNotification, TNotificationData } from '../types';

	export let notification: TNotification;

	let data: TNotificationData | null = null;

	onMount(async () => {
		data = await fetchGithub(notification.subject.url);
		console.log(data);
	});
</script>

<div class="notification">
	<span class="time">2d</span>
	<div class="main">
		<img class="image" src={data?.author.avatar_url} alt="" />
		<h3 class="message">{data?.author.login} merged this PR</h3>
	</div>
	<div class="thread">
		<PrOpen />
		<div class="thread-content">
			<small class="branch">mobsuccess-devops/platform-lcm</small>
			<div class="name-container">
				<h4 class="thread-name">Add v1 for RTB adgroup settings</h4>
				<p class="thread-id">#589</p>
			</div>
		</div>
	</div>
	<ul class="labels">
		<li class="label" style:color="#d73a4a">bug</li>
		<li class="label" style:color="#4AF574">feature</li>
	</ul>
	<div class="over">
		<button class="button"><ExternalLink /></button>
		<button class="button"><Check /></button>
		<button class="button"><Pin /></button>
	</div>
</div>

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
		width: 300px;

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

			.branch {
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
