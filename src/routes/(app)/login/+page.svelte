<script lang="ts">
	import { browser } from '$app/environment';
	import { DragRegion, GithubLoginButton, GitlabLoginButton, IconButton } from '$lib/components';
	import { ArrowRightIcon, GithubIcon, GitlabIcon } from '$lib/icons';

	$: onTauriApp = browser && !!window.__TAURI__;
</script>

<svelte:head>
	<title>GitLight • Log in</title>
</svelte:head>

<DragRegion />
<div class="wrapper">
	<main class="main">
		{#if !onTauriApp}
			<a href="/" class="back-button">
				<IconButton large>
					<ArrowRightIcon />
				</IconButton>
			</a>
		{/if}
		<h2 class="title">Log in to start monitoring your notifications</h2>
		<p class="description">You will be able to log in to the other provider afterward.</p>
		<span />
		<GithubLoginButton>
			<GithubIcon />
			Log in to GitHub
		</GithubLoginButton>
		<GitlabLoginButton>
			<GitlabIcon />
			Log in to GitLab
		</GitlabLoginButton>
	</main>
</div>

<style lang="scss">
	.wrapper {
		position: relative;
		display: flex;
		overflow: hidden;
		height: 100vh;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0 2rem;
	}

	.main {
		position: relative;
		display: flex;
		width: 20rem;
		flex-direction: column;
		gap: 1rem;

		.back-button {
			position: absolute;
			bottom: calc(100% + 1rem);

			:global(svg) {
				rotate: 180deg;
			}
		}

		.title {
			@include typography.heading-1;
		}

		.description {
			color: variables.$bg-5;
		}
	}
</style>
