<script lang="ts">
	import type { WatchedRepo } from '~/lib/types';
	import { ShrinkableWrapper } from '~/lib/components';
	import { Repository } from '~/lib/icons';
	import { loading, watchedRepos } from '~/lib/stores';
	import { browser } from '$app/environment';
	import { storage } from '~/lib/helpers';
	import SidebarSection from './SidebarSection.svelte';

	type WatchedReposByOwner = {
		name: string;
		avatar: string;
		number: number;
		active: boolean;
		repos: WatchedRepo[];
	}[];

	$: watchedReposByOwner = $watchedRepos
		.reduce<WatchedReposByOwner>((previous, current) => {
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
						repos: [current]
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
			repos: item.repos.sort((a, b) => b.number - a.number)
		}));

	// Save watched repos to storage
	$: if (browser && !$loading) {
		storage.set(
			'github-watched-repos',
			$watchedRepos.map(({ id, active }) => ({ id, active }))
		);
	}

	function handleToggleRepo(id: string) {
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
</script>

<SidebarSection
	title="Repositories"
	description="Repos from where notifications come."
	bind:items={$watchedRepos}
>
	{#each watchedReposByOwner as { name, avatar, number, active, repos }}
		{#if repos.length === 1}
			<button
				class="wrapper"
				class:active={repos[0].active}
				on:click={handleToggleRepo(repos[0].id)}
			>
				<img class="image" src={avatar} alt="" />
				<h3 class="name">{name}/{repos[0].name}</h3>
				<span class="number">{number}</span>
			</button>
		{:else}
			<ShrinkableWrapper>
				<button
					slot="header"
					class="wrapper smaller"
					class:active
					on:click={handleToggleOwner(name, !active)}
				>
					<img class="image" src={avatar} alt="" />
					<h3 class="name">{name}</h3>
					<span class="number">{number}</span>
				</button>
				{#each repos as { id, name, number, active }}
					<button class="wrapper" class:active on:click={handleToggleRepo(id)}>
						<div class="repo-icon">
							<Repository />
						</div>
						<h4 class="name">{name}</h4>
						<span class="number">{number}</span>
					</button>
				{/each}
			</ShrinkableWrapper>
		{/if}
	{/each}
</SidebarSection>

<style lang="scss">
	.wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		position: relative;
		transition: opacity variables.$transition;

		&.smaller {
			width: calc(100% - 1.5rem);
		}

		&:not(.active) {
			opacity: 0.5;

			.name::before {
				width: 100%;
			}
		}

		&::before {
			content: '';
			position: absolute;
			inset: -0.25rem -0.5rem;
			background-color: variables.$grey-2;
			border-radius: variables.$radius;
			z-index: -1;
			opacity: 0;
		}

		&:hover::before {
			opacity: 1;
		}

		.name {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			max-width: 100%;
			position: relative;

			&::before {
				content: '';
				position: absolute;
				inset: 50% 0 auto 0;
				height: 1px;
				width: 0;
				background-color: currentColor;
				transition: width variables.$transition;
			}
		}

		.image,
		.repo-icon {
			flex: 0 0 1.5rem;
			height: 1.5rem;
			border-radius: 0.5rem;
		}

		.repo-icon {
			background-color: variables.$grey-3;
			display: flex;
			align-items: center;
			justify-content: center;

			:global(svg) {
				height: 1rem;
				color: variables.$grey-4;
			}
		}

		.number {
			color: variables.$grey-4;
		}
	}
</style>
