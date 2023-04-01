<script lang="ts">
	import { onDestroy, onMount, type ComponentType } from 'svelte';
	import { fade, type CrossfadeParams, type TransitionConfig } from 'svelte/transition';
	import { flip } from 'svelte/animate';
	import type { TEvent } from '~/lib/types';
	import { debounce } from '~/lib/helpers';
	import { ArrowUp } from '~/lib/icons';
	import { Button } from '../common';
	import Event from './Event.svelte';
	import SkeletonEvent from './SkeletonEvent.svelte';
	import { loading } from '~/lib/stores';

	type TSvelteAnimation = (
		node: Element,
		params: CrossfadeParams & {
			key: unknown;
		}
	) => () => TransitionConfig;

	export let icon: ComponentType;
	export let title: string;
	export let events: TEvent[];
	export let transitions: {
		receive: TSvelteAnimation;
		send: TSvelteAnimation;
		settings: CrossfadeParams;
	};
	const { receive, send, settings } = transitions;

	let list: HTMLUListElement;
	let scrolled = false;

	const handleScroll = debounce((e: Event) => {
		scrolled = e.target.scrollTop > 100;
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
</script>

<div class="column">
	<div class="column-header">
		<svelte:component this={icon} />
		<h3 class="title">{title}</h3>
		<p class="number">{events.length}</p>
	</div>
	{#if scrolled}
		<div class="scroll-button" transition:fade={{ duration: 150 }}>
			<Button type="secondary" small on:click={handleScrollToTop}>
				Scroll to top <ArrowUp />
			</Button>
		</div>
	{/if}
	<ul class="list" bind:this={list}>
		{#if $loading}
			{#each Array(2) as _}
				<li><SkeletonEvent /></li>
			{/each}
		{:else}
			{#each events as event (event.id)}
				<li
					class="item"
					in:receive={{ key: event.id }}
					out:send={{ key: event.id }}
					animate:flip={settings}
				>
					<Event data={event} />
				</li>
			{/each}
		{/if}
	</ul>
</div>

<style lang="scss">
	.column {
		display: flex;
		flex-direction: column;
		position: relative;
		min-width: 0;
		min-height: 0;

		&::before {
			content: '';
			position: absolute;
			inset: 1.25rem 0 calc(100% - 2.25rem) 0;
			background-image: linear-gradient(variables.$grey-1, transparent);
			z-index: 1;
		}

		&::after {
			content: '';
			position: absolute;
			inset: calc(100% - 1rem) 0 0 0;
			background-image: linear-gradient(transparent, variables.$grey-1);
			z-index: 1;
		}
	}

	.column-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;

		:global(svg) {
			height: 1.25rem;
		}

		.title {
			@include typography.bold;
		}

		.number {
			color: variables.$grey-4;
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
		overflow: auto;
		padding: 1rem 0;
		height: 100%;

		&::-webkit-scrollbar {
			display: none;
		}

		.item {
			opacity: 1 !important;
		}
	}
</style>
