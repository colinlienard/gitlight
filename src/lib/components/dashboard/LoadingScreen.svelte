<script lang="ts">
	import { AnimatedLogo } from '$lib/components';
</script>

<section class="container">
	<AnimatedLogo />
	<div class="text-container">
		<h2 class="title">Loading your data...</h2>
		<p class="subtitle">This can take a bit of time.</p>
	</div>
	<div class="loading-line" />
</section>

<style lang="scss">
	.container {
		display: flex;
		height: 100vh;
		flex-direction: column;
		align-items: center;
		justify-content: center;
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

			.subtitle {
				color: variables.$bg-5;
			}
		}

		.loading-line {
			@keyframes slide {
				0% {
					translate: -100%;
				}

				100% {
					translate: 100%;
				}
			}

			position: absolute;
			height: 0.25rem;
			animation: slide 1s infinite forwards linear;
			background-image: linear-gradient(to right, transparent, variables.$blue, transparent);
			inset: auto 0 0;
		}
	}
</style>
