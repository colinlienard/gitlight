<script lang="ts">
	import { watchedPersons } from '~/lib/stores';
	import SidebarSection from './SidebarSection.svelte';

	function handleToggle(login: string) {
		return (event: MouseEvent) => {
			if (event.altKey || event.ctrlKey || event.shiftKey || event.metaKey) {
				watchedPersons.update((persons) =>
					persons.map((person) => ({ ...person, active: person.login === login }))
				);
			} else {
				watchedPersons.update((persons) =>
					persons.map((person) =>
						person.login === login ? { ...person, active: !person.active } : person
					)
				);
			}
		};
	}
</script>

<SidebarSection title="Persons" bind:items={$watchedPersons}>
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
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;
		position: relative;
		transition: opacity variables.$transition;

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

		.image {
			flex: 0 0 1.5rem;
			height: 1.5rem;
			border-radius: 50%;
		}

		.number {
			color: variables.$grey-4;
		}
	}
</style>
