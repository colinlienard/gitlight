<script lang="ts">
	import { Check, ExternalLink, Pin } from '../icons';
	import type { TNotification } from '../types';

	export let data: TNotification;

	let { description, icon, repo: fullRepo, time, title, url, labels, number } = data;
	$: owner = fullRepo.split('/')[0];
	$: repo = fullRepo.split('/')[1];
</script>

<div class="notification">
	<div class="top">
		<p class="repo">{owner}<span class="bold">{repo}</span></p>
		<p class="time">{time}</p>
	</div>
	<p class="description">
		{#each description as item}
			{#if typeof item === 'string'}
				<span class="subtle">{item}</span>
			{:else}
				{item.text}
				<span class="image-container">
					{#if item.icon}
						<svelte:component this={item.icon} />
					{/if}
					{#if item.image}
						<img class="image" src={item.image} alt="" />
					{/if}
				</span>
			{/if}
		{/each}
	</p>
	<div class="main">
		<svelte:component this={icon} />
		<h3 class="title">{title}</h3>
		{#if number}
			<span class="number">#{number}</span>
		{/if}
	</div>
	{#if labels && labels.length}
		<ul class="labels">
			{#each labels as label}
				<li class="label" style:color={`#${label.color}`}>{label.name}</li>
			{/each}
		</ul>
	{/if}
	<div class="over">
		<a class="button" href={url} target="_blank" rel="noreferrer"><ExternalLink /></a>
		<button class="button"><Check /></button>
		<button class="button"><Pin /></button>
	</div>
</div>

<style lang="scss">
	.notification {
		@include mixins.shadow;
		background-color: variables.$grey-2;
		border: 1px solid variables.$grey-3;
		border-radius: variables.$radius;
		padding: 1rem;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		width: 350px;

		&:not(&:hover) {
			.over {
				opacity: 0;
			}
		}
	}

	.top {
		@include typography.small;
		display: flex;
		justify-content: space-between;
		color: variables.$grey-4;

		.repo .bold {
			@include typography.bold;
		}
	}

	.description {
		.subtle {
			color: variables.$grey-4;
		}

		:global(svg),
		.image {
			display: inline-block;
			width: 1.25rem;
			height: 1.25rem;
			translate: 0 0.25rem;
		}

		.image {
			border-radius: 50%;
		}
	}

	.main {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		width: 100%;

		:global(svg) {
			flex: 0 0 2rem;
			height: 2rem;
		}

		.title {
			@include typography.bold;
			flex: 0 1 auto;
			white-space: nowrap;
			overflow-x: hidden;
			text-overflow: ellipsis;
			padding-bottom: 2px;
		}

		.number {
			color: variables.$blue-3;
		}
	}

	.labels {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;

		.label {
			@include typography.small;
			padding: 0.25rem 0.5rem;
			border-radius: variables.$radius;
			border: 1px solid;
			position: relative;

			&::before {
				content: '';
				position: absolute;
				inset: 0;
				border-radius: variables.$radius;
				background-color: currentColor;
				opacity: 0.1;
			}
		}
	}

	.over {
		position: absolute;
		inset: 0;
		background-image: radial-gradient(variables.$grey-1, rgba(variables.$grey-1, 0.25));
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		transition: inherit;

		.button {
			padding: 0.5rem;
			background-color: variables.$grey-3;
			border-radius: variables.$radius;

			:global(svg) {
				width: 1.25rem;
				height: 1.25rem;
			}

			&:hover {
				background-color: variables.$blue-2;
			}
		}
	}
</style>
