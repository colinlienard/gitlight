<script lang="ts">
	import { browser } from '$app/environment';
	import { storage } from '$lib/features';
	import { MuteIcon, MutedIcon } from '$lib/icons';
	import { globalNotifications, loading, settings, watchedPersons } from '$lib/stores';
	import type { User, WatchedPerson } from '$lib/types';
	import SidebarSection from './SidebarSection.svelte';

	let canSave = false;

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
		canSave = true;
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

	$: providerView = $settings.providerView;
	$: displayedPersons =
		providerView === 'both'
			? $watchedPersons
			: $watchedPersons.filter((person) => person.from === providerView);
	$: botsHidden = displayedPersons.some((person) => person.bot && person.active);
	$: botsMuted = displayedPersons.every((person) => (person.bot ? person.muted : true));
	$: botsPresent = displayedPersons.some((person) => person.bot);

	// Save watched persons to storage
	$: if (canSave) {
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

	function handleMuteBots(muted: boolean) {
		$watchedPersons = $watchedPersons.map((person) => (person.bot ? { ...person, muted } : person));
	}
</script>

<SidebarSection
	title="Persons"
	description="Perons who created PRs and issues, and authors of notifications."
	bind:items={$watchedPersons}
	actions={[
		{ text: 'Show bots', active: botsHidden, onToggle: handleHideBots, disabled: !botsPresent },
		{ text: 'Mute bots', active: botsMuted, onToggle: handleMuteBots, disabled: !botsPresent }
	]}
>
	{#if displayedPersons.length}
		{#each displayedPersons as { login, avatar, active, muted, number }}
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
		{/each}
	{:else}
		<p class="empty">No persons to display</p>
	{/if}
</SidebarSection>

<style lang="scss">
	.wrapper {
		@include mixins.item-list;

		&:not(:hover) .mute {
			opacity: 0;
		}

		.name {
			position: relative;
			overflow: hidden;
			max-width: 100%;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.image {
			height: 1.5rem;
			flex: 0 0 1.5rem;
			border-radius: 50%;
		}

		.number {
			color: variables.$bg-5;
		}

		.mute {
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
