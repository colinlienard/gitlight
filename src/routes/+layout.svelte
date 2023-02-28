<script lang="ts">
	import { page } from '$app/stores';
	import type { Session } from '@auth/core/types';
	import { onMount } from 'svelte';

	type Notification = {
		repository: {
			full_name: string;
		};
		subject: {
			title: string;
			type: string;
		};
		unread: boolean;
	};

	let notifications: Notification[] = [];

	onMount(async () => {
		const session = $page.data.session as (Session & { accessToken: string }) | null;
		if (!session) {
			return;
		}
		const response = await fetch('https://api.github.com/notifications?all=true', {
			headers: {
				Accept: 'application/vnd.github+json',
				Authorization: `Bearer ${session.accessToken}`
			}
		});
		const data = await response.json();
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
	<ul>
		{#each notifications as notification}
			<li>
				<h2>
					{#if notification.unread}
						<span>🚨</span>
					{/if}
					{notification.subject.title}
				</h2>
				<p>{notification.subject.type}</p>
				<small>{notification.repository.full_name}</small>
			</li>
		{/each}
	</ul>
</div>
