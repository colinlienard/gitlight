<script lang="ts">
	import { onDestroy, onMount, type ComponentType } from 'svelte';
	import { fade, type CrossfadeParams, type TransitionConfig } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import type { NotificationData } from '~/lib/types';
	import { debounce } from '~/lib/helpers';
	import { ArrowUpIcon } from '~/lib/icons';
	import { Button } from '../common';
	import SkeletonEvent from './SkeletonEvent.svelte';
	import { loading, largeScreen } from '~/lib/stores';
	import Notification from './notification';

	type SvelteAnimation = (
		node: Element,
		params: CrossfadeParams & {
			key: unknown;
		}
	) => () => TransitionConfig;

	export let icon: ComponentType;
	export let title: string;
	export let notifications: NotificationData[];
	export let placeholder: { icon: ComponentType; text: string };
	export let transitions: {
		receive: SvelteAnimation;
		send: SvelteAnimation;
		settings: CrossfadeParams;
	};
	const { receive, send, settings } = transitions;

	let list: HTMLUListElement;
	let scrolled = false;
	let empty = !notifications.length;
	let noScroll = false;

	const handleScroll = debounce((e: Event) => {
		scrolled = (e.target as HTMLElement).scrollTop > 100;
	}, 100);

	function handleScrollToTop() {
		list.scrollTo({ top: 0, behavior: 'smooth' });
		scrolled = false;
	}

	onMount(() => {
		list?.addEventListener('scroll', handleScroll);
	});

	onDestroy(() => {
		list?.removeEventListener('scroll', handleScroll);
	});

	$: if (notifications.length) {
		empty = false;
	} else {
		setTimeout(() => {
			empty = true;
		}, settings.duration as number);
	}

	$: {
		notifications;
		noScroll = true;
		setTimeout(() => {
			noScroll = false;
		}, settings.duration as number);
	}

	function conditionalFlip(...args: Parameters<typeof flip>) {
		return args[2] ? flip(...args) : { duration: 0, easing: () => 0 };
	}
</script>

<div class="column" class:vertical={$largeScreen}>
	<div class="column-header">
		<svelte:component this={icon} />
		<h3 class="title">{title}</h3>
		<p class="number">{notifications.length}</p>
		<div class="addon-container">
			<slot name="header-addon" />
		</div>
	</div>
	{#if scrolled}
		<div class="scroll-button" transition:fade={{ duration: 150 }}>
			<Button type="secondary" small on:click={handleScrollToTop}>
				Scroll to top <ArrowUpIcon />
			</Button>
		</div>
	{/if}
	<ul class="list" class:no-scroll={noScroll || empty || !$largeScreen} bind:this={list}>
		{#if $loading}
			<li><SkeletonEvent /></li>
			<li><SkeletonEvent /></li>
		{:else}
			{#each notifications as notification, index (notification)}
				<li
					class="item"
					in:receive={{ key: notification.id }}
					out:send={{ key: notification.id }}
					animate:conditionalFlip={index < 6 ? settings : undefined}
				>
					<Notification data={notification} />
				</li>
			{/each}
			{#if empty}
				<div class="placeholder" in:fade={{ duration: 300 }}>
					<div class="icon-container">
						<svelte:component this={placeholder.icon} />
					</div>
					<h4 class="title">No notifications to display</h4>
					<p class="text">{placeholder.text}</p>
				</div>
			{/if}
		{/if}
	</ul>
</div>

<style lang="scss">
	.column {
		display: flex;
		flex-direction: column;
		position: relative;
		min-width: 0;
		padding: 0 0.5rem 0 1.5rem;
		z-index: 1;

		&.vertical {
			min-height: 0;
		}

		&:not(.vertical) {
			.column-header {
				position: sticky;
				inset: 1rem 0 auto;
			}

			.list {
				padding-bottom: 0;
			}

			&::after {
				display: none;
			}
		}

		&::after {
			content: '';
			position: absolute;
			inset: calc(100% - 1rem) 0 -2rem 0;
			background-image: linear-gradient(transparent, variables.$grey-1 1rem);
			z-index: 1;
		}
	}

	.column-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-right: 1rem;
		z-index: 1;

		&::before {
			content: '';
			position: absolute;
			inset: -1rem 0 auto;
			height: 3.5rem;
			background-image: linear-gradient(variables.$grey-1 2.5rem, transparent);
			z-index: 1;
		}

		:global(svg) {
			height: 1.25rem;
			z-index: 2;
		}

		* {
			z-index: 2;
		}

		.title {
			@include typography.bold;
		}

		.number {
			color: variables.$grey-4;
		}

		.addon-container {
			margin-left: auto;
		}
	}

	.scroll-button {
		position: absolute;
		inset: 2rem auto auto 50%;
		translate: -50% 0;
		z-index: 1;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem 1rem 1rem 0;
		overflow: scroll;
		height: 100%;

		&.no-scroll {
			overflow: visible;
		}

		&::-webkit-scrollbar {
			display: none;
		}

		.item {
			opacity: 1 !important;
		}
	}

	.placeholder {
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		align-items: center;
		justify-content: center;
		color: variables.$grey-4;
		text-align: center;
		padding: 1rem 0;

		.icon-container {
			padding: 0.5rem;
			border-radius: variables.$radius;
			border: 1px solid;
			margin-bottom: 0.5rem;
			position: relative;

			:global(svg) {
				height: 1rem;
			}

			&::before {
				content: '';
				position: absolute;
				inset: -1px;
				background-image: linear-gradient(transparent, rgba(variables.$grey-1, 0.75));
			}
		}

		.title {
			@include typography.bold;
		}

		.text {
			@include typography.small;
			@include typography.base;
			max-width: 12rem;
		}
	}
</style>
