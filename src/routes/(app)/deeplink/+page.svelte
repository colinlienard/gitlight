<script lang="ts">
	import { onMount } from 'svelte';
	import { AnimatedLogo } from '$lib/components';
	import { storage } from '$lib/features';
	import { openDesktopApp } from '$lib/helpers';

	onMount(() => {
		const githubAccessToken = storage.get('github-access-token');
		const gitlabAccessToken = storage.get('gitlab-access-token');
		const gitlabRefreshToken = storage.get('gitlab-refresh-token');
		const gitlabExpiresIn = storage.get('gitlab-expires-in');

		if (githubAccessToken || (gitlabAccessToken && gitlabRefreshToken && gitlabExpiresIn)) {
			openDesktopApp({ githubAccessToken, gitlabAccessToken, gitlabRefreshToken, gitlabExpiresIn });
		}
	});
</script>

<svelte:head>
	<title>GitLight</title>
</svelte:head>

<section class="container">
	<AnimatedLogo />
	<div class="text-container">
		<h2 class="title">Redirecting you to the GitLight app...</h2>
		<a class="link" href="/dashboard">Or continue in the browser</a>
	</div>
</section>

<style lang="scss">
	.container {
		display: flex;
		height: 100vh;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: variables.$bg-1;
		gap: 2rem;

		.text-container {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			gap: 0.5rem;

			.title {
				@include typography.heading-2;
			}

			.link {
				@include mixins.link;
			}
		}
	}
</style>
