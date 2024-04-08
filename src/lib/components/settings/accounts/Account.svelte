<script lang="ts">
	import { GithubLoginButton, GitlabLoginButton } from '$lib/components';
	import type { User } from '$lib/types';
	import LogOutButton from './LogOutButton.svelte';

	export let title: string;
	export let provider: 'github' | 'gitlab';
	export let user: User | undefined;
</script>

<li class="account">
	<div class="header">
		<slot name="icon" />
		<h4 class="title">{title}</h4>
	</div>
	<div class="content">
		{#if user}
			<figure class="user">
				<img class="image" src={user.avatar} alt="" />
				<figcaption class="user-info">
					<p class="sub">Logged in as</p>
					<p class="name">{user.name ?? user.login}</p>
				</figcaption>
			</figure>
			<LogOutButton {provider} />
		{:else}
			<p class="sub">Not logged in.</p>
			{#if provider === 'github'}
				<GithubLoginButton small>Log in</GithubLoginButton>
			{:else if provider === 'gitlab'}
				<GitlabLoginButton small tooltipOnLeft>Log in</GitlabLoginButton>
			{/if}
		{/if}
	</div>
</li>

<style lang="scss">
	.account {
		@include mixins.box;

		display: flex;
		flex-direction: column;

		.header {
			display: flex;
			align-items: center;
			padding: 1rem;
			border-bottom: inherit;
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
				@include mixins.broken-img;

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
			color: variables.$bg-5;
		}
	}
</style>
