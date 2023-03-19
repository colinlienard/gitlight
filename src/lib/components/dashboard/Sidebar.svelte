<script lang="ts">
	import { Plus, Search, Trash } from '~/lib/icons';
	import { Button, Input, Separator, ShrinkableWrapper, Switch, Tooltip } from '~/lib/components';
	import { onMount } from 'svelte';
	import { createEventData, fetchGithub } from '~/lib/helpers';
	import type { TGithubEvent } from '~/lib/types';
	import { filteredEvents, githubEvents, savedEventIds } from '~/lib/stores';
	import { browser } from '$app/environment';

	type TEventSources = {
		name: string;
		active: boolean;
	}[];

	let eventSources: TEventSources = [
		{ name: 'ColinLienard/gitlight', active: true },
		{ name: 'lagonapp/lagon', active: true }
	];

	onMount(() => {
		// Get events ids from localStorage
		savedEventIds.set(
			JSON.parse(localStorage.getItem('githubEvents') || '{ pinned: [], read: [] }')
		);

		setEvents();
	});

	// Save pinned and read events to localStorage
	$: if (browser && $githubEvents.length && $savedEventIds) {
		const pinned = $githubEvents.filter((event) => event.pinned).map((event) => event.id);
		const read = $githubEvents.filter((event) => event.read).map((event) => event.id);
		localStorage.setItem('githubEvents', JSON.stringify({ pinned, read }));
	}

	// Apply filters and search
	$: filteredEvents.set(
		$githubEvents.filter((event) => {
			const source = eventSources.find((source) => source.name === event.repo);
			return source?.active || false;
		})
	);

	async function setEvents() {
		const promises = eventSources.map(({ name }) =>
			fetchGithub(`repos/${name}/events?per_page=50`)
		);
		const response = (await Promise.all(promises)).flat() as TGithubEvent[];
		const sorted = response.sort(
			(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		);
		githubEvents.set(
			sorted.map((event) => {
				const isPinned = $savedEventIds?.pinned.includes(event.id) || false;
				const isRead = $savedEventIds?.read.includes(event.id) || false;
				return createEventData(event, isPinned, isRead);
			})
		);
	}

	function handleAddSource() {
		eventSources = [...eventSources, { name: 'sveltejs/kit', active: true }];
		setEvents();
	}

	function handleRemoveSource(name: string) {
		return () => {
			eventSources = eventSources.filter((source) => source.name !== name);
			setEvents();
		};
	}

	let active = true;
	let value = '';
</script>

<article class="sidebar">
	<img src="/images/sidebar-gradient.png" alt="" class="gradient" />
	<header class="header">
		<h1 class="title">GitLight</h1>
	</header>
	<ShrinkableWrapper title="Filters">
		<Input icon={Search} bind:value placeholder="Placeholder" />
		<Separator />
		<Switch bind:active label="Pull requests" />
		<Switch bind:active label="Issues" />
	</ShrinkableWrapper>
	<ShrinkableWrapper title="Watching">
		{#each eventSources as source (source.name)}
			<div class="repository">
				<Switch bind:active={source.active} label={source.name} />
				<Tooltip content="Delete" position="top">
					<button class="delete" on:click={handleRemoveSource(source.name)}>
						<Trash />
					</button>
				</Tooltip>
			</div>
		{/each}
		<Button type="secondary" small on:click={handleAddSource}><Plus />Add a repository</Button>
	</ShrinkableWrapper>
</article>

<style lang="scss">
	.sidebar {
		flex: 0 0 20rem;
		height: 100vh;
		border-right: 1px solid variables.$grey-3;
		padding: 3rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 3rem;
		position: relative;
	}

	.gradient {
		position: absolute;
		inset: 0;
		z-index: -1;
	}

	.header {
		.title {
			@include typography.heading-1;
		}
	}

	.repository {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;

		.delete {
			transition: opacity variables.$transition;

			:global(svg) {
				height: 1.25rem;

				&:not(:hover) {
					color: variables.$grey-4;
				}
			}
		}

		&:not(:hover) .delete {
			opacity: 0;
		}
	}
</style>
