<script>
	import { page } from '$app/stores';
	import { Github, Gitlab } from '~/lib/icons';
	import { Button } from '~/lib/components';
	import LogOutButton from './LogOutButton.svelte';

	const user = $page.data.session?.user;
</script>

<ul class="accounts-wrapper">
	<li class="account">
		<div class="header">
			<Github />
			<h4 class="title">GitHub</h4>
		</div>
		<div class="content">
			<figure class="user">
				<img class="image" src={user?.avatar} alt="" />
				<figcaption class="user-info">
					<p class="sub">Logged in as</p>
					<p class="name">{user?.name}</p>
				</figcaption>
			</figure>
			<LogOutButton />
		</div>
	</li>
	<li class="account">
		<div class="header">
			<Gitlab />
			<h4 class="title">GitLab</h4>
		</div>
		<div class="content">
			<p class="sub">Not logged in.</p>
			<Button small disabled>Log in</Button>
		</div>
	</li>
</ul>

<style lang="scss">
	.accounts-wrapper {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.account {
		@include mixins.shiny(variables.$grey-2, false);
		display: flex;
		flex-direction: column;

		.header {
			padding: 1rem;
			display: flex;
			align-items: center;
			gap: 0.5rem;
			border-bottom: 1px solid variables.$grey-3;

			:global(svg) {
				height: 1.25rem;
			}
		}

		.content {
			display: flex;
			flex-direction: column;
			gap: 1rem;
			padding: 1rem;
			justify-content: space-between;
			height: 100%;
		}

		.user {
			display: flex;
			align-items: center;
			gap: 0.5rem;

			.image {
				width: 2rem;
				height: 2rem;
				border-radius: 50%;
			}

			.user-info {
				display: flex;
				flex-direction: column;
				gap: 0.25rem;
			}
		}

		.sub {
			color: variables.$grey-4;
		}
	}
</style>
