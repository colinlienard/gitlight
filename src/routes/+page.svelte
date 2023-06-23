<script lang="ts">
	import { Button, DownloadButton, FakeNotifications, Footer } from '~/lib/components';
	import {
		ArrowRightIcon,
		GithubIcon,
		HeartIcon,
		LightningIcon,
		Logo,
		SparklesIcon
	} from '~/lib/icons';
</script>

<svelte:head>
	<title>GitLight • GitHub and GitLab notifications on your desktop</title>
</svelte:head>

<div class="wrapper">
	<img src="/images/large-light.webp" alt="" class="background-image" width="1600" height="384" />
	<header class="header">
		<div class="title-container">
			<Logo />
			<h1 class="title"><strong>GitLight</strong></h1>
		</div>
		<a
			href="https://github.com/ColinLienard/gitlight"
			target="_blank"
			rel="noreferrer"
			class="icon-link"
		>
			<GithubIcon />
		</a>
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
			<Button type="secondary" href="/login">or use in the browser</Button>
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
	</main>
	<FakeNotifications />
	<Footer />
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
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow-x: hidden;
		padding: 0 2rem;
		position: relative;
		min-height: 100vh;

		@include screens.mobile {
			padding-bottom: 6rem;
		}
	}

	.background-image {
		position: absolute;
		max-width: unset;
		z-index: -1;

		@include screens.mobile {
			width: 40rem;
			height: auto;
		}
	}

	.header {
		width: min(64rem, 100%);
		padding-top: 2rem;
		display: flex;
		align-items: center;
		justify-content: space-between;

		.title-container {
			display: flex;
			align-items: center;
			gap: 0.5rem;

			:global(svg) {
				height: 2rem;
			}

			.title {
				@include typography.heading-1;
			}
		}

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

	.main {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;

		@include screens.mobile {
			width: 100vw;
			padding: 0 2rem;
			margin-top: 4rem;
		}

		@include screens.desktop {
			margin-top: auto;
		}

		.hero-container {
			display: flex;
			flex-direction: column;
			align-items: center;

			.hero {
				@include typography.bold;
				font-size: 2.5rem;
				text-align: center;
				padding-bottom: 1rem;
				background-image: linear-gradient(variables.$white, rgba(variables.$white, 0.5));
				background-clip: text;
				-webkit-background-clip: text;
				-moz-background-clip: text;
				-webkit-text-fill-color: transparent;
				-moz-text-fill-color: transparent;

				@include screens.desktop {
					font-size: 3rem;
					max-width: 45rem;
				}
			}

			.subhero {
				font-size: 1.25rem;
				text-align: center;
				color: variables.$grey-4;
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
			background-image: linear-gradient(to right, transparent, variables.$blue-2, transparent);
		}

		.features-list {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;

			@include screens.mobile {
				gap: 2rem;
			}

			.feature {
				width: 16rem;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 0.5rem;

				:global(svg) {
					height: 2rem;
					color: variables.$blue-3;
				}

				.title {
					@include typography.bold;
				}

				.description {
					color: variables.$grey-4;
				}
			}
		}
	}
</style>
