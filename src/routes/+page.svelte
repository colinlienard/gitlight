<script>
	import { Button, FakeNotifications, Footer } from '~/lib/components';
	import { ArrowRight, Github, Heart, Lightning, Logo, Sparkles } from '~/lib/icons';
</script>

<div class="wrapper">
	<img src="/images/large-light.png" alt="" class="background-image" width="1600" height="384" />
	<header class="header">
		<div class="title-container">
			<Logo />
			<h1 class="title">GitLight</h1>
		</div>
		<a
			href="https://github.com/ColinLienard/gitlight"
			target="_blank"
			rel="noreferrer"
			class="icon-link"
		>
			<Github />
		</a>
	</header>
	<main class="main">
		<div class="hero-container">
			<h2 class="hero">GitHub and GitLab notifications on your desktop</h2>
			<h3 class="subhero">Never miss a pull request, issue, commit, review...</h3>
		</div>
		<div class="buttons-container">
			<Button><ArrowRight />Download for Mac</Button>
			<Button type="secondary" href="/login">or use in the browser</Button>
		</div>
		<span class="separator" />
		<ul class="features-list">
			<li class="feature">
				<Sparkles />
				<h4 class="title">Filter and monitor events</h4>
				<p class="description">Kanban style interface.</p>
			</li>
			<li class="feature">
				<Heart />
				<h4 class="title">Free and open source</h4>
				<p class="description">Contribute on GitHub!</p>
			</li>
			<li class="feature">
				<Lightning />
				<h4 class="title">Made for performance</h4>
				<p class="description">Built with Tauri and SvelteKit.</p>
			</li>
		</ul>
	</main>
	<FakeNotifications />
	<Footer />
</div>

<style lang="scss">
	.wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 100vh;
		overflow: hidden;
		padding: 0 2rem;
	}

	.background-image {
		position: absolute;
		z-index: -1;
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
		margin-top: 10rem;

		.hero-container {
			display: flex;
			flex-direction: column;
			align-items: center;

			.hero {
				@include typography.bold;
				font-size: 3rem;
				max-width: 45rem;
				text-align: center;
				padding-bottom: 1rem;
				background-image: linear-gradient(rgba(variables.$white, 0.5), variables.$white);
				background-clip: text;
				-webkit-background-clip: text;
				-moz-background-clip: text;
				-webkit-text-fill-color: transparent;
				-moz-text-fill-color: transparent;
			}

			.subhero {
				font-size: 1.25rem;
				color: variables.$grey-4;
			}
		}

		.buttons-container {
			display: flex;
			gap: 1rem;
		}

		.separator {
			width: 20rem;
			height: 1px;
			background-image: linear-gradient(to right, transparent, variables.$blue-2, transparent);
		}

		.features-list {
			display: grid;
			grid-template-columns: repeat(3, 16rem);

			.feature {
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 0.5rem;

				:global(svg) {
					height: 2rem;
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
