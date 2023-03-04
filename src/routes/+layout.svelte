<script lang="ts">
	import { page } from '$app/stores';
	import type { Session } from '@auth/core/types';
	import { onMount } from 'svelte';
	import { Notification } from '~/lib/components';
	import { fetchGithub } from '~/lib/helpers';
	import { accessToken } from '~/lib/stores';
	import type { TNotification } from '~/lib/types';

	let notifications: TNotification[] = [];

	onMount(async () => {
		const session = $page.data.session as (Session & { accessToken: string }) | null;
		if (!session) {
			return;
		}
		accessToken.set(session.accessToken);
		const data = await fetchGithub('https://api.github.com/notifications?all=true');
		notifications = data;
	});
</script>

<div>
	<header>
		<div class="signedInStatus">
			<p class="nojs-show loaded">
				{#if $page.data.session}
					{#if $page.data.session.user?.image}
						<span style="background-image: url('{$page.data.session.user.image}')" class="avatar" />
					{/if}
					<span class="signedInText">
						<small>Signed in as</small><br />
						<strong>{$page.data.session.user?.email ?? $page.data.session.user?.name}</strong>
					</span>
					<a href="/auth/signout" class="button" data-sveltekit-preload-data="off">Sign out</a>
				{:else}
					<span class="notSignedInText">You are not signed in</span>
					<a href="/auth/signin" class="buttonPrimary" data-sveltekit-preload-data="off">Sign in</a>
				{/if}
			</p>
		</div>
		<nav>
			<ul class="navItems">
				<li class="navItem"><a href="/">Home</a></li>
				<li class="navItem"><a href="/protected">Protected</a></li>
			</ul>
		</nav>
	</header>
	<slot />

	<ul class="notification-container">
		{#each notifications as notification}
			<li>
				<Notification {notification} />
			</li>
		{/each}
	</ul>
</div>

<style lang="scss">
	.notification-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		padding: 3rem;
		gap: 1rem;
	}
</style>
