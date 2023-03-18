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
		background-color: variables.$grey-2;
		border: 1px solid variables.$grey-3;
		border-radius: variables.$radius;
		padding: 1rem;
		display: flex;
		flex-direction: column;
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
