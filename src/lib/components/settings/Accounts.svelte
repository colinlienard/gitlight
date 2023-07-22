<script lang="ts">
	import { page } from '$app/stores';
	import { Button, Tooltip } from '~/lib/components';
	import { GithubIcon, GitlabIcon } from '~/lib/icons';
	import LogOutButton from './LogOutButton.svelte';

	const user = $page.data.session?.user;
</script>

<ul class="accounts-wrapper">
	<li class="account">
		<div class="header">
			<GithubIcon />
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
			<GitlabIcon />
			<h4 class="title">GitLab</h4>
		</div>
		<div class="content">
			<p class="sub">Not logged in.</p>
			<Tooltip content="Coming soon!" position="bottom" hover>
				<Button small disabled>Log in</Button>
			</Tooltip>
		</div>
	</li>
</ul>

<style lang="scss">
	.accounts-wrapper {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr 1fr;
	}

	.account {
		@include mixins.box;

		display: flex;
		flex-direction: column;

		.header {
			display: flex;
			align-items: center;
			padding: 1rem;
			border-bottom: 1px solid variables.$grey-3;
			gap: 0.5rem;

			:global(svg) {
				height: 1.25rem;
			}
		}

		.content {
			display: flex;
			height: 100%;
			flex-direction: column;
			justify-content: space-between;
			padding: 1rem;
			gap: 1rem;
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
