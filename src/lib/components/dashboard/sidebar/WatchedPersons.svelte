<script lang="ts">
	import { browser } from '$app/environment';
	import { MuteIcon, MutedIcon } from '~/lib/icons';
	import { storage } from '$lib/features';
	import { githubNotifications, loading, settings, watchedPersons } from '$lib/stores';
	import type { WatchedPerson } from '$lib/types';
	import SidebarSection from './SidebarSection.svelte';

	$: showPersonsAsCreators = $settings.showPersonsAsCreators;

	// Update watched persons
	$: if (browser && !$loading) {
		const savedWatchedPersons = storage.get('github-watched-persons');

		$watchedPersons = $githubNotifications
			.reduce<WatchedPerson[]>((previous, current) => {
				if (!current.author || current.done) return previous;
				const involved = (showPersonsAsCreators && current?.creator) || current?.author;
				const saved = savedWatchedPersons?.find((person) => person.login === involved?.login);
				const index = previous.findIndex((person) => person.login === involved?.login);
				if (index > -1) {
					const person = previous.splice(index, 1)[0];
					return [...previous, { ...person, number: person.number + 1 }];
				}
				return [
					...previous,
					{
						login: involved?.login ?? '',
						avatar: involved?.avatar ?? '',
						number: 1,
						bot: involved?.bot,
						active: saved?.active ?? true,
						muted: saved?.muted ?? false
					}
				];
			}, [])
			.sort((a, b) => b.number - a.number);
	}

	$: botsHidden = $watchedPersons.some((person) => person.login.endsWith('[bot]') && person.active);
	$: botsPresent = $watchedPersons.some((person) => person.login.endsWith('[bot]'));

	// Save watched persons to storage
	$: if (browser) {
		storage.set(
			'github-watched-persons',
			$watchedPersons.map(({ login, active, muted }) => ({ login, active, muted }))
		);
	}

	function handleToggle(login: string) {
		return (event: MouseEvent) => {
			if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
				$watchedPersons = $watchedPersons.map((person) => ({
					...person,
					active: person.login === login
				}));
			} else {
				$watchedPersons = $watchedPersons.map((person) =>
					person.login === login ? { ...person, active: !person.active } : person
				);
			}
		};
	}

	function handleMute(login: string) {
		return () => {
			$watchedPersons = $watchedPersons.map((person) =>
				person.login === login ? { ...person, muted: !person.muted } : person
			);
		};
	}

	function handleHideBots(active: boolean) {
		$watchedPersons = $watchedPersons.map((person) =>
			person.bot ? { ...person, active } : person
		);
	}

	function handleShowPersonsAsCreators(active: boolean) {
		$settings.showPersonsAsCreators = active;
	}
</script>

<SidebarSection
	title="Persons"
	description="Authors of notifications."
	bind:items={$watchedPersons}
	actions={[
		{ text: 'Show bots', active: botsHidden, onToggle: handleHideBots, disabled: !botsPresent },
		{
			text: 'Show as created by (only for pull requests and issues)',
			active: $settings.showPersonsAsCreators,
			onToggle: handleShowPersonsAsCreators
		}
	]}
>
	{#if $watchedPersons.length}
		{#each $watchedPersons as { login, avatar, active, muted, number }}
			<button class="wrapper" class:active on:click={handleToggle(login)}>
				<img class="image" src={avatar} alt="" />
				<h3 class="name">{login}</h3>
				<span class="number">{number}</span>
				<button class="mute" class:muted on:click|stopPropagation={handleMute(login)}>
					{#if muted}
						<MutedIcon />
					{:else}
						<MuteIcon />
					{/if}
				</button>
			</button>
		{/each}
	{:else}
		<p class="empty">No persons to display</p>
	{/if}
</SidebarSection>

<style lang="scss">
	.wrapper {
		position: relative;
		display: flex;
		width: 100%;
		align-items: center;
		gap: 0.5rem;
		transition: opacity variables.$transition;

		&:not(.active) {
			opacity: 0.5;

			.name::before {
				width: 100%;
			}
		}

		&:not(:hover) .mute {
			opacity: 0;
		}

		&::before {
			position: absolute;
			z-index: -1;
			border-radius: variables.$radius;
			background-color: variables.$grey-2;
			content: '';
			inset: -0.25rem -0.5rem;
			opacity: 0;
		}

		&:hover::before {
			opacity: 1;
		}

		.name {
			position: relative;
			overflow: hidden;
			max-width: 100%;
			text-overflow: ellipsis;
			white-space: nowrap;

			&::before {
				position: absolute;
				width: 0;
				height: 1px;
				background-color: currentcolor;
				content: '';
				inset: 50% 0 auto;
				transition: width variables.$transition;
			}
		}

		.image {
			height: 1.5rem;
			flex: 0 0 1.5rem;
			border-radius: 50%;
		}

		.number {
			color: variables.$grey-4;
		}

		.mute {
			margin-left: auto;
			color: variables.$grey-4;

			&.muted {
				opacity: 1;
			}

			&:hover {
				color: variables.$white;
			}

			:global(svg) {
				height: 1.25rem;
			}
		}
	}

	.empty {
		color: variables.$grey-4;
	}
</style>
