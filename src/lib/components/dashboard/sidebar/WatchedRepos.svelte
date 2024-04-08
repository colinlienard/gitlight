<script lang="ts">
	import { browser } from '$app/environment';
	import { ShrinkableWrapper } from '$lib/components';
	import { storage } from '$lib/features';
	import { MuteIcon, RepositoryIcon, MutedIcon } from '$lib/icons';
	import { globalNotifications, loading, settings, watchedRepos } from '$lib/stores';
	import type { WatchedRepo } from '$lib/types';
	import SidebarSection from './SidebarSection.svelte';

	type WatchedReposByOwner = {
		name: string;
		avatar?: string;
		number: number;
		active: boolean;
		muted: boolean;
		repos: WatchedRepo[];
		from: 'github' | 'gitlab';
	}[];

	let canSave = false;

	// Update watched repos
	$: if (browser && !$loading) {
		const savedWatchedRepos = storage.get('watched-repos');

		const repos = $globalNotifications.reduce<WatchedRepo[]>((previous, current) => {
			if (current.status === 'done') return previous;
			const saved = savedWatchedRepos?.find((repo) => repo.id === current.repository.id);
			const index = previous.findIndex((repo) => repo.id === current.repository.id);
			if (index > -1) {
				const repo = previous.splice(index, 1)[0];
				return [...previous, { ...repo, number: repo.number + 1 }];
			}
			const [ownerName, name] = current.repository.namespace.split('/');
			return [
				...previous,
				{
					id: current.repository.id,
					name,
					ownerName,
					ownerAvatar: current.ownerAvatar,
					number: 1,
					active: saved?.active ?? true,
					muted: saved?.muted ?? false,
					from: current.from
				}
			];
		}, []);

		repos.push(
			...(savedWatchedRepos
				? savedWatchedRepos
						.filter((repo) => !repos.find((p) => p.id === repo.id) && (repo.muted || !repo.active))
						.map((repo) => ({ ...repo, number: 0 }))
				: [])
		);

		$watchedRepos = repos;
		canSave = true;
	}

	$: providerView = $settings.providerView;
	$: watchedReposByOwner = $watchedRepos
		.reduce<WatchedReposByOwner>((previous, current) => {
			if (providerView !== 'both' && current.from !== providerView) return previous;

			const repos = previous.find((owner) => owner.name === current.ownerName)?.repos;

			// If no owner
			if (!repos) {
				return [
					...previous,
					{
						name: current.ownerName,
						avatar: current.ownerAvatar,
						number: current.number,
						active: true,
						muted: false,
						repos: [current],
						from: current.from
					}
				];
			}

			// If repo already exists
			const index = repos.findIndex((repo) => repo.id === current.id);
			if (index > -1) {
				const repo = repos.splice(index, 1)[0];
				return previous.map((item) => {
					if (item.name === current.name) {
						return {
							...item,
							number: item.number + repo.number,
							repos: [...repos, { ...repo, number: repo.number + 1 }]
						};
					}
					return item;
				});
			}

			// New repo
			return previous.map((item) => {
				if (item.name === current.ownerName) {
					return {
						...item,
						number: item.number + current.number,
						repos: [...item.repos, current]
					};
				}
				return item;
			});
		}, [])
		.sort((a, b) => b.number - a.number)
		.map((item) => ({
			...item,
			active: item.repos.some((repo) => repo.active),
			muted: item.repos.every((repo) => repo.muted),
			repos: item.repos.sort((a, b) => b.number - a.number)
		}));

	// Save watched repos to storage
	$: if (canSave) {
		storage.set('watched-repos', $watchedRepos);
	}

	function handleToggleRepo(id: number) {
		return (event: MouseEvent) => {
			if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
				$watchedRepos = $watchedRepos.map((item) => ({ ...item, active: item.id === id }));
			} else {
				$watchedRepos = $watchedRepos.map((item) =>
					item.id === id ? { ...item, active: !item.active } : item
				);
			}
		};
	}

	function handleToggleOwner(name: string, active: boolean) {
		return (event: MouseEvent) => {
			if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
				$watchedRepos = $watchedRepos.map((item) => ({ ...item, active: item.ownerName === name }));
			} else {
				$watchedRepos = $watchedRepos.map((item) =>
					item.ownerName === name ? { ...item, active } : item
				);
			}
		};
	}

	function handleMuteRepo(id: number) {
		return () => {
			$watchedRepos = $watchedRepos.map((item) =>
				item.id === id ? { ...item, muted: !item.muted } : item
			);
		};
	}

	function handleMuteOwner(name: string, value: boolean) {
		return () => {
			$watchedRepos = $watchedRepos.map((item) =>
				item.ownerName === name ? { ...item, muted: !value } : item
			);
		};
	}
</script>

<SidebarSection
	title="Repositories"
	description="Repos from where notifications come."
	bind:items={$watchedRepos}
>
	{#if watchedReposByOwner.length}
		{#each watchedReposByOwner as { name, avatar, number, active, muted, repos }}
			{#if repos.length === 1}
				<button
					class="wrapper"
					class:active={repos[0].active}
					on:click={handleToggleRepo(repos[0].id)}
				>
					{#if avatar}
						<img class="image" src={avatar} alt="" />
					{:else}
						<div class="repo-icon">
							<RepositoryIcon />
						</div>
					{/if}
					<h3 class="name">{name}/{repos[0].name}</h3>
					{#if number}
						<span class="number">{number}</span>
					{/if}
					<button class="mute" class:muted on:click|stopPropagation={handleMuteOwner(name, muted)}>
						{#if muted}
							<MutedIcon />
						{:else}
							<MuteIcon />
						{/if}
					</button>
				</button>
			{:else}
				<ShrinkableWrapper>
					<button
						slot="header"
						class="wrapper smaller"
						class:active
						on:click={handleToggleOwner(name, !active)}
					>
						{#if avatar}
							<img class="image" src={avatar} alt="" />
						{:else}
							<div class="repo-icon">
								<RepositoryIcon />
							</div>
						{/if}
						<h3 class="name">{name}</h3>
						{#if number}
							<span class="number">{number}</span>
						{/if}
						<button
							class="mute"
							class:muted
							on:click|stopPropagation={handleMuteOwner(name, muted)}
						>
							{#if muted}
								<MutedIcon />
							{:else}
								<MuteIcon />
							{/if}
						</button>
					</button>
					{#each repos as { id, name, number, active, muted }}
						<button class="wrapper" class:active on:click={handleToggleRepo(id)}>
							<div class="repo-icon">
								<RepositoryIcon />
							</div>
							<h4 class="name">{name}</h4>
							{#if number}
								<span class="number">{number}</span>
							{/if}
							<button class="mute" class:muted on:click|stopPropagation={handleMuteRepo(id)}>
								{#if muted}
									<MutedIcon />
								{:else}
									<MuteIcon />
								{/if}
							</button>
						</button>
					{/each}
				</ShrinkableWrapper>
			{/if}
		{/each}
	{:else}
		<p class="empty">No repositories to display</p>
	{/if}
</SidebarSection>

<style lang="scss">
	.wrapper {
		@include mixins.item-list;

		&:not(:hover) .mute {
			opacity: 0;
		}

		&.smaller {
			width: calc(100% - 1.5rem);
		}

		.name {
			position: relative;
			overflow: hidden;
			max-width: 100%;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.image,
		.repo-icon {
			height: 1.5rem;
			flex: 0 0 1.5rem;
			border-radius: variables.$small-radius;
		}

		.image {
			@include mixins.broken-img;
		}

		.repo-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			background-color: variables.$bg-3;

			:global(svg) {
				height: 1rem;
				color: variables.$bg-5;
			}
		}

		.number {
			color: variables.$bg-5;
		}

		.mute {
			flex: 0 0 1.25rem;
			margin-left: auto;
			color: variables.$bg-5;

			&.muted {
				opacity: 1;
			}

			&:hover {
				color: variables.$bg-6;
			}

			:global(svg) {
				height: 1.25rem;
			}
		}
	}

	.empty {
		color: variables.$bg-5;
	}
</style>
