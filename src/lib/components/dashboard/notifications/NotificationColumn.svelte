<script lang="ts" context="module">
	const dragging = writable<string | false>(false);
</script>

<script lang="ts">
	import { onDestroy, onMount, type ComponentType } from 'svelte';
	import { flip } from 'svelte/animate';
	import { writable } from 'svelte/store';
	import { fade, type CrossfadeParams, type TransitionConfig } from 'svelte/transition';
	import { Button } from '$lib/components';
	import { drag, drop, fetchGithub } from '$lib/features';
	import { debounce } from '$lib/helpers';
	import { ArrowUpIcon } from '$lib/icons';
	import {
		loading,
		settings as settingsStore,
		githubNotifications,
		gitlabNotifications
	} from '$lib/stores';
	import type { NotificationData } from '$lib/types';
	import Notification from './Notification.svelte';
	import NotificationPlaceholder from './NotificationPlaceholder.svelte';
	import SkeletonNotification from './SkeletonNotification.svelte';

	type SvelteAnimation = (
		node: Element,
		params: CrossfadeParams & {
			key: unknown;
		}
	) => () => TransitionConfig;

	export let icon: ComponentType;
	export let title: 'Pinned' | 'Unread' | 'Read';
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
	let dragId: string | null = null;
	let scrollPosition = 0;
	let transitioning = false;
	let hovering = false;

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

	$: empty = !notifications.length;

	$: {
		notifications;
		if ($dragging) {
			transitioning = true;
			setTimeout(() => {
				transitioning = false;
			}, settings.duration as number);
		}
	}

	$: if ($dragging) {
		scrollPosition = list?.scrollTop;
	} else {
		setTimeout(
			() => {
				scrollPosition = 0;
			},
			(settings.duration as number) + 10
		);
	}

	$: showDropzone = $dragging ? $dragging !== title : false;

	$: verticalKanban = $settingsStore.viewMode === 'Kanban (vertical)';

	function flipIfVisible(...args: Parameters<typeof flip>) {
		const node = args[0].getBoundingClientRect();
		const parent = args[0].parentElement?.getBoundingClientRect();
		const isVisible = parent && node.top >= parent.top - 300 && node.bottom <= parent.bottom + 300;
		return isVisible ? flip(...args) : { duration: 0, easing: () => 0 };
	}

	function handleDragStart(id: string) {
		dragId = id;
		$dragging = title;
	}

	function handleDrop(id: string) {
		dragId = null;
		$dragging = false;

		const from = $githubNotifications.find((n) => n.id === id) ? 'github' : 'gitlab';

		(from === 'github' ? githubNotifications : gitlabNotifications).update((previous) =>
			previous.map((notification) => {
				if (notification.id !== id) return notification;
				if (title === 'Pinned') {
					return { ...notification, status: 'pinned' };
				}
				if (title === 'Read') {
					if (from === 'github') {
						fetchGithub(`notifications/threads/${id}`, { method: 'PATCH' });
					}
					return { ...notification, status: 'read' };
				}
				return { ...notification, status: 'unread' };
			})
		);
	}

	// Fix crossfade visual glitch by hiding the underlying element
	let hideId = '';
	let justChanged = false;

	$: {
		$settingsStore.providerView;
		justChanged = true;
		setTimeout(() => {
			justChanged = false;
		}, 100);
	}

	function receiveAndHide(...args: Parameters<typeof receive>) {
		if (!justChanged) {
			hideId = args[1].key as string;

			setTimeout(() => {
				hideId = '';
			}, settings.duration as number);
		}

		return receive(...args);
	}
</script>

<div
	class="column"
	class:has-dropzone={showDropzone}
	class:dragging={!!$dragging}
	class:vertical={!verticalKanban}
>
	<div class="column-header">
		<svelte:component this={icon} />
		<h3 class="title">{title}</h3>
		<p class="number">{notifications.length}</p>
		<div class="addon-container">
			<slot name="header-addon" />
		</div>
	</div>
	{#if showDropzone}
		<div class="dropzone" class:hovering transition:fade={{ duration: 150 }} />
	{/if}
	{#if scrolled && !verticalKanban}
		<div class="scroll-button" transition:fade={{ duration: 150 }}>
			<Button secondary small on:click={handleScrollToTop}>
				Scroll to top <ArrowUpIcon />
			</Button>
		</div>
	{/if}
	<ul
		class="list"
		class:scroll-visible={transitioning || empty || verticalKanban || !!$dragging}
		style="--scroll-position: -{scrollPosition}px"
		use:drop={{
			onDrop: handleDrop,
			onHoverChange: (value) => (hovering = value)
		}}
		bind:this={list}
	>
		{#if $loading}
			<li><SkeletonNotification /></li>
			<li><SkeletonNotification /></li>
		{:else}
			{#each notifications as notification (notification)}
				<li
					class="item"
					class:hide={hideId === notification.id}
					in:receiveAndHide={{ key: notification.id }}
					out:send={{ key: notification.id }}
					animate:flipIfVisible={settings}
					use:drag={{
						id: notification.id,
						onDragStart: handleDragStart
					}}
				>
					<Notification data={notification} dragged={!!$dragging && notification.id === dragId} />
				</li>
			{/each}
			{#if empty}
				<NotificationPlaceholder icon={placeholder.icon} text={placeholder.text} />
			{/if}
		{/if}
	</ul>
</div>

<style lang="scss">
	.column {
		position: relative;
		z-index: 1;
		display: flex;
		min-width: 0;
		flex-direction: column;
		padding: 0 0.5rem 0 1.5rem;

		&.has-dropzone {
			z-index: -1;
		}

		&:not(.has-dropzone) {
			z-index: 10;
			transition: z-index 0.3s;
		}

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
			position: absolute;
			z-index: 1;
			background-image: linear-gradient(transparent, variables.$grey-1 1rem);
			content: '';
			inset: calc(100% - 1rem) 0 -2rem 0;
		}

		&.dragging {
			&::before,
			&::after,
			.column-header {
				z-index: -1;
			}
		}
	}

	.column-header {
		z-index: 2;
		display: flex;
		align-items: center;
		margin-right: 1rem;
		gap: 0.5rem;

		:global(svg) {
			z-index: 2;
			height: 1.25rem;
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

		&::before {
			position: absolute;
			z-index: 1;
			height: 4.5rem;
			background-image: linear-gradient(variables.$grey-1 3.5rem, transparent);
			content: '';
			inset: -2rem 0 auto;
		}
	}

	.dropzone {
		position: absolute;
		z-index: 2;
		border-radius: variables.$radius;
		background-color: rgba(variables.$blue-2, 0.1);
		content: '';
		inset: 2.25rem 1.5rem 0;
		opacity: 0.5;
		outline: 6px dashed variables.$blue-3;
		pointer-events: none;
		transition: opacity variables.$transition;

		&.hovering {
			opacity: 1;
		}
	}

	.scroll-button {
		position: absolute;
		z-index: 10;
		inset: 2rem auto auto 50%;
		translate: -50% 0;
	}

	.list {
		display: flex;
		overflow: scroll;
		height: 100%;
		flex-direction: column;
		padding: 1rem 1rem 1rem 0;
		gap: 1rem;

		&.scroll-visible {
			overflow: visible;
			transform: translateY(var(--scroll-position));
		}

		&::-webkit-scrollbar {
			display: none;
		}

		.item {
			cursor: grab;
			opacity: 1 !important;

			&.hide {
				opacity: 0 !important;
			}

			&:hover {
				z-index: 1;
			}
		}
	}
</style>
