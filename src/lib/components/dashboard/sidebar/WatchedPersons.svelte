<script lang="ts">
	import { browser } from '$app/environment';
	import { storage } from '~/lib/helpers';
	import { loading, watchedPersons } from '~/lib/stores';
	import SidebarSection from './SidebarSection.svelte';

	// Save watched persons to storage
	$: if (browser && !$loading) {
		storage.set(
			'github-watched-persons',
			$watchedPersons.map(({ login, active }) => ({ login, active }))
		);
	}

	$: botsHidden = $watchedPersons.some((person) => person.login.endsWith('[bot]') && person.active);

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

	function handleHideBots(active: boolean) {
		$watchedPersons = $watchedPersons.map((person) =>
			person.bot ? { ...person, active } : person
		);
	}
</script>

<SidebarSection
	title="Persons"
	description="Authors of notifications."
	bind:items={$watchedPersons}
	actions={[{ text: 'Show bots', active: botsHidden, onToggle: handleHideBots }]}
>
	{#each $watchedPersons as { login, avatar, active, number }}
		<button class="wrapper" class:active on:click={null} on:click={handleToggle(login)}>
			<img class="image" src={avatar} alt="" />
			<h3 class="name">{login}</h3>
			<span class="number">{number}</span>
		</button>
	{/each}
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
	}
</style>
