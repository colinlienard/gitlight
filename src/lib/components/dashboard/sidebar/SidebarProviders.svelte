<script lang="ts">
	import { browser } from '$app/environment';
	import { GithubIcon, GitlabIcon } from '$lib/icons';
	import { settings } from '$lib/stores';

	let line: HTMLDivElement;

	$: providerView = $settings.providerView;
	$: if (browser && line) {
		const target = document.querySelector(`#${providerView}-tab`);
		if (target) {
			const rect = target.getBoundingClientRect();
			line.setAttribute('style', `width: ${rect.width}px; left: ${rect.left}px`);
		}
	}
</script>

<div class="providers">
	<button
		class="tab"
		class:selected={$settings.providerView === 'github'}
		id="github-tab"
		on:click={() => ($settings.providerView = 'github')}
	>
		<GithubIcon />
		<p class="text">GitHub</p>
	</button>
	<button
		class="tab"
		class:selected={$settings.providerView === 'gitlab'}
		id="gitlab-tab"
		on:click={() => ($settings.providerView = 'gitlab')}
	>
		<GitlabIcon />
		<p class="text">GitLab</p>
	</button>
	<button
		class="tab"
		class:selected={$settings.providerView === 'both'}
		id="both-tab"
		on:click={() => ($settings.providerView = 'both')}
	>
		<p class="text">Both</p>
	</button>
	<div class="line" bind:this={line} />
</div>

<style lang="scss">
	.providers {
		position: relative;
		display: flex;

		.tab {
			display: flex;
			align-items: center;
			justify-content: center;
			padding: 1rem;
			color: variables.$bg-5;
			gap: 0.25rem;

			&.selected,
			&:hover {
				color: variables.$bg-6;
			}

			:global(svg) {
				height: 1.25rem;
			}
		}

		.line {
			position: absolute;
			height: 1px;
			padding: 0 1rem;
			inset: auto auto 0;
			pointer-events: none;
			transition: variables.$transition;

			&::before {
				display: block;
				height: 1px;
				background-color: variables.$bg-6;
				content: '';
			}
		}
	}
</style>
