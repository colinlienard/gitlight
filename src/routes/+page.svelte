<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Button, DownloadButton } from '$lib/components';
	import {
		ArrowRightIcon,
		GithubIcon,
		HeartIcon,
		LightningIcon,
		SparklesIcon,
		XIcon
	} from '$lib/icons';

	function onThemeChange({ matches }: MediaQueryListEvent) {
		document.documentElement.setAttribute('data-theme', matches ? 'dark' : 'light');
	}

	onMount(() => {
		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', onThemeChange);
	});

	onDestroy(() => {
		if (!browser) return;
		window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', onThemeChange);
	});
</script>

<svelte:head>
	<title>GitLight • GitHub and GitLab notifications on your desktop</title>
	<meta
		name="description"
		content="Better GitHub and GitLab notifications as a free, open-source desktop app."
	/>
</svelte:head>

<div class="wrapper">
	<header class="header">
		<div class="title-container">
			<img class="logo" src="/images/logo.webp" alt="" height="32" width="32" />
			<h1 class="title"><strong>GitLight</strong></h1>
		</div>
		<div class="links">
			<a
				href="https://x.com/colinlienard"
				target="_blank"
				rel="noreferrer"
				class="icon-link"
				aria-label="Colin Lienard X account"
			>
				<XIcon />
			</a>
			<a
				href="https://github.com/colinlienard/gitlight"
				target="_blank"
				rel="noreferrer"
				class="icon-link"
				aria-label="GitLight GitHub repository"
			>
				<GithubIcon />
			</a>
		</div>
	</header>
	<main class="main">
		<div class="hero-container">
			<h2 class="hero" data-slide style="--stagger: 0">
				<strong>GitHub and GitLab notifications on your desktop</strong>
			</h2>
			<h3 class="subhero" data-slide style="--stagger: 1">
				Never miss a pull request, issue, commit, review...
			</h3>
		</div>
		<div class="buttons-container" data-slide style="--stagger: 2">
			<DownloadButton>
				<Button>
					<ArrowRightIcon />
					Download the app
				</Button>
			</DownloadButton>
			<Button secondary href="/login">or use in the browser</Button>
		</div>
		<span class="separator" data-slide style="--stagger: 3" />
		<ul class="features-list" data-slide style="--stagger: 4">
			<li class="feature">
				<SparklesIcon />
				<h4 class="title">Filter and monitor events</h4>
				<p class="description"><strong>Kanban</strong> style interface.</p>
			</li>
			<li class="feature">
				<HeartIcon />
				<h4 class="title"><strong>Free</strong> and <strong>open source</strong></h4>
				<p class="description">Contribute on GitHub!</p>
			</li>
			<li class="feature">
				<LightningIcon />
				<h4 class="title">Made for performance</h4>
				<p class="description">Built with <strong>Tauri</strong> and <strong>SvelteKit</strong>.</p>
			</li>
		</ul>
		<article class="image-container">
			<picture>
				<source
					class="image"
					srcset="/images/gitlight-dark.webp"
					media="(prefers-color-scheme: dark)"
					width="1024"
					height="640"
				/>
				<img class="image" src="/images/gitlight-light.webp" alt="" width="1024" height="640" />
			</picture>
		</article>
	</main>
</div>

<style lang="scss">
	[data-slide] {
		@keyframes slide {
			from {
				opacity: 0;
				translate: 0 0.5rem;
			}

			to {
				opacity: 1;
				translate: 0;
			}
		}
		--stagger: 1;

		animation: slide 0.3s calc(var(--stagger) * 0.1s) ease-in-out backwards;
	}

	.wrapper {
		position: relative;
		display: flex;
		overflow: hidden;
		height: 100vh;
		flex-direction: column;
		align-items: center;
		padding: 0 2rem;

		@include screens.mobile {
			height: 100svh;
			padding: 0 1.5rem 2rem;
		}
	}

	.header {
		display: flex;
		width: min(64rem, 100%);
		align-items: center;
		justify-content: space-between;
		padding-top: 2rem;

		.title-container {
			display: flex;
			align-items: center;
			gap: 0.5rem;

			.logo {
				width: 2rem;
				height: 2rem;
			}

			.title {
				@include typography.heading-1;
			}
		}

		.links {
			display: flex;
			align-items: center;
			gap: 1rem;

			.icon-link {
				transition: opacity variables.$transition;

				&:hover {
					opacity: 0.75;
				}

				:global(svg) {
					height: 1.5rem;
				}
			}
		}
	}

	.main {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;

		@include screens.mobile {
			width: 100vw;
			padding: 0 1.5rem;
			margin-top: 4rem;
		}

		@include screens.desktop {
			padding-top: 10vh;

			@media (height >= 1000px) {
				padding-top: 16vh;
			}
		}

		.hero-container {
			display: flex;
			flex-direction: column;
			align-items: center;

			.hero {
				@include typography.bold;

				padding-bottom: 1rem;
				-webkit-background-clip: text;
				-moz-background-clip: text;
				background-clip: text;
				background-image: linear-gradient(variables.$bg-6, transparent 175%);
				font-size: 2.5rem;
				text-align: center;
				-webkit-text-fill-color: transparent;
				-moz-text-fill-color: transparent;

				@include screens.desktop {
					max-width: 45rem;
					font-size: 3rem;
				}
			}

			.subhero {
				color: variables.$bg-5;
				font-size: 1.25rem;
				text-align: center;
			}
		}

		.buttons-container {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			gap: 1rem;
		}

		.separator {
			width: 20rem;
			height: 1px;
			background-image: linear-gradient(to right, transparent, variables.$blue, transparent);
		}

		.features-list {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;

			@include screens.mobile {
				gap: 2rem;
			}

			.feature {
				display: flex;
				width: 16rem;
				flex-direction: column;
				align-items: center;
				gap: 0.5rem;

				:global(svg) {
					height: 2rem;
					color: variables.$light-blue;
				}

				.title {
					@include typography.bold;
				}

				.description {
					color: variables.$bg-5;
				}
			}
		}

		.image-container {
			@include screens.mobile {
				display: none;
			}

			@keyframes slide-3d {
				from {
					opacity: 0;
					transform: perspective(500px) rotate3d(1, 0, 0, 10deg);
					translate: 0 4rem;
				}

				to {
					opacity: 1;
					transform: perspective(500px) rotate3d(1, 0, 0, 2deg);
					translate: 0;
				}
			}

			position: relative;
			overflow: hidden;
			border-radius: 0.8rem;
			margin-top: 2rem;
			animation: slide-3d 1.5s cubic-bezier(0.8, 0, 0.2, 1) both;
			box-shadow:
				0 0 8rem rgba(variables.$blue, 0.25),
				0 0 2rem rgba(variables.$light-blue, 0.25);

			@media (height >= 1000px) {
				margin-top: 4rem;
			}

			.image {
				max-width: unset;
			}

			&::before {
				@keyframes reflect-appear {
					0% {
						opacity: 0;
						translate: -40% 90%;
					}

					100% {
						opacity: 1;
						translate: -30% 100%;
					}
				}

				position: absolute;
				width: 150%;
				height: 20rem;
				animation: reflect-appear 1.5s cubic-bezier(0.8, 0, 0.2, 1) both;
				background-image: linear-gradient(transparent, rgba(white, 0.03));
				content: '';
				inset: 0;
				rotate: 135deg;
			}
		}
	}
</style>
