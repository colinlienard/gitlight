<div class="event">
	<span class="repo" />
	<span class="description" />
	<div class="main">
		<span class="icon" />
		<span class="title" />
	</div>
</div>

<style lang="scss">
	.event {
		@include mixins.box;

		display: flex;
		flex-direction: column;
		padding: 1rem;
		gap: 1rem;
	}

	.repo {
		@include mixins.skeleton(8rem, 1rem);
	}

	.description {
		@include mixins.skeleton(80%, 2rem);
	}

	.main {
		display: flex;
		align-items: center;
		gap: 1rem;

		.icon {
			@include mixins.skeleton(2rem, 2rem);
		}

		.title {
			@include mixins.skeleton(50%, 1.5rem);
		}
	}
</style>
