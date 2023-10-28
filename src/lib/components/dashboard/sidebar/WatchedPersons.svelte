<script lang="ts">
	import { browser } from '$app/environment';
	import { storage } from '$lib/features';
	import { MuteIcon, MutedIcon } from '$lib/icons';
	import { globalNotifications, loading, settings, watchedPersons } from '$lib/stores';
	import type { User, WatchedPerson } from '$lib/types';
	import SidebarSection from './SidebarSection.svelte';

	// Update watched persons
	$: if (browser && !$loading) {
		const savedWatchedPersons = storage.get('watched-persons');

		const persons = $globalNotifications.reduce<WatchedPerson[]>((previous, current) => {
			if (current.status === 'done') return previous;
			if (current.creator) {
				previous = addPerson(previous, current.creator, 1, savedWatchedPersons, current.from);
				if (current.author && current.author.login !== current.creator.login) {
					previous = addPerson(previous, current.author, 0, savedWatchedPersons, current.from);
				}
			} else if (current.author) {
				previous = addPerson(previous, current.author, 1, savedWatchedPersons, current.from);
			}
			return previous;
		}, []);

		persons.push(
			...(savedWatchedPersons
				? savedWatchedPersons
						.filter(
							(person) =>
								!persons.find((p) => p.login === person.login) && (person.muted || !person.active)
						)
						.map((person) => ({ ...person, number: 0 }))
				: [])
		);

		$watchedPersons = persons.sort((a, b) => b.number - a.number);
	}

	function addPerson(
		previous: WatchedPerson[],
		person: User,
		number: number,
		savedWatchedPersons: WatchedPerson[] | null,
		from: 'github' | 'gitlab'
	): WatchedPerson[] {
		const saved = savedWatchedPersons?.find((p) => p.login === person.login);
		const index = previous.findIndex((p) => p.login === person?.login);
		if (index > -1) {
			const person = previous.splice(index, 1)[0];
			return [...previous, { ...person, number: person.number + number }];
		}
		return [
			...previous,
			{
				login: person.login,
				avatar: person.avatar ?? '',
				number,
				bot: person.bot,
				active: saved?.active ?? true,
				muted: saved?.muted ?? false,
				from
			}
		];
	}

	$: botsHidden = $watchedPersons.some((person) => person.login.endsWith('[bot]') && person.active);
	$: botsPresent = $watchedPersons.some((person) => person.login.endsWith('[bot]'));

	// Save watched persons to storage
	$: if (browser) {
		storage.set('watched-persons', $watchedPersons);
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
			let toSplice: number | null = null;
			const persons = $watchedPersons.map((person) =>
				person.login === login ? { ...person, muted: !person.muted } : person
			);
			if (toSplice !== null) {
				persons.splice(toSplice, 1);
			}
			$watchedPersons = persons;
		};
	}

	function handleHideBots(active: boolean) {
		$watchedPersons = $watchedPersons.map((person) =>
			person.bot ? { ...person, active } : person
		);
	}
</script>

<SidebarSection
	title="Persons"
	description="Perons who created PRs and issues, and authors of notifications."
	bind:items={$watchedPersons}
	actions={[
		{ text: 'Show bots', active: botsHidden, onToggle: handleHideBots, disabled: !botsPresent }
	]}
>
	{#if $watchedPersons.length}
		{#each $watchedPersons as { login, avatar, active, muted, number, from }}
			{#if $settings.providerView == 'both' || $settings.providerView === from}
				<button class="wrapper" class:active on:click={handleToggle(login)}>
					<img class="image" src={avatar} alt="" />
					<h3 class="name">{login}</h3>
					{#if number}
						<span class="number">{number}</span>
					{/if}
					<button class="mute" class:muted on:click|stopPropagation={handleMute(login)}>
						{#if muted}
							<MutedIcon />
						{:else}
							<MuteIcon />
						{/if}
					</button>
				</button>
			{/if}
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
