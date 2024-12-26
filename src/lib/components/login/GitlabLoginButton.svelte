<script lang="ts">
	import { onDestroy } from 'svelte';
	import { sineInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { PUBLIC_SITE_URL } from '$env/static/public';
	import { Button, Input } from '$lib/components';
	import { fetchGitlab, storage } from '$lib/features';
	import type { GitlabUser } from '$lib/types';

	export let small = false;
	export let tooltipOnLeft = false;

	let tooltip: HTMLDivElement;
	let open = false;
	let selfHosted = false;
	let url = '';
	let urlIsValid = true;
	let pat = '';
	let loading = false;
	let error = '';

	$: onTauriApp = browser && !!window.__TAURI__;
	$: urlWithoutSlash = url.endsWith('/') ? url.slice(0, -1) : url;

	$: if (open && browser) {
		setTimeout(() => {
			window.addEventListener('click', handleClickOutside);
		}, 0);
	} else if (browser) {
		selfHosted = false;
		window.removeEventListener('click', handleClickOutside);
	}

	function handleUrlChange() {
		urlIsValid = !!url.match(/^https?:\/\/\S/g);
	}

	function handleClickOutside({ x, y }: MouseEvent) {
		const tooltipRect = tooltip.getBoundingClientRect();
		if (
			open &&
			(tooltipRect.top > y ||
				tooltipRect.bottom < y ||
				tooltipRect.left > x ||
				tooltipRect.right < x)
		) {
			open = false;
		}
	}

	async function handleLoginSelfHosted() {
		loading = true;
		error = '';
		try {
			const response = await fetchGitlab<GitlabUser>('user', {
				accessToken: pat,
				domain: urlWithoutSlash
			});
			storage.set('gitlab-url', urlWithoutSlash);
			storage.set('gitlab-pat', pat);
			storage.set('gitlab-user', {
				name: response.name,
				login: response.username,
				avatar: response.avatar_url
			});
			if (window.location.pathname === '/login') {
				goto('/dashboard');
			} else {
				window.location.reload();
			}
		} catch {
			error = 'Invalid URL or Personal Access Token.';
		} finally {
			loading = false;
		}
	}

	onDestroy(() => {
		if (browser) {
			window.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div class="container" role="presentation">
	<Button {small} on:click={() => (open = !open)}><slot /></Button>
	{#if open}
		<div
			class="tooltip"
			class:left={selfHosted && tooltipOnLeft}
			style:--gap={selfHosted ? '1rem' : '0.5rem'}
			style:width={selfHosted ? '24rem' : 'max-content'}
			transition:fade={{ duration: 150, easing: sineInOut }}
			bind:this={tooltip}
		>
			{#if selfHosted}
				<Input
					bind:value={url}
					label="GitLab self-hosted instance URL"
					placeholder="https://gitlab.example.com"
					on:input={handleUrlChange}
					autofocus
					error={url !== '' && !urlIsValid}
				/>
				<div class="pat" class:disabled={!(url && urlIsValid)}>
					<p class="text">
						Create a new PAT
						<a
							class="link"
							href={`${urlWithoutSlash}/-/user_settings/personal_access_tokens`}
							target="_blank"
						>
							here
						</a>
						with the <b>read_api</b> and <b>read_user</b> scopes and paste it below:
					</p>
					<Input bind:value={pat} placeholder="Personal Access Token" />
				</div>
				{#if error}
					<p class="error">{error}</p>
				{/if}
				<Button on:click={handleLoginSelfHosted} disabled={!urlIsValid || pat === ''} {loading}>
					Continue
				</Button>
			{:else}
				<Button
					href={onTauriApp
						? `${PUBLIC_SITE_URL}/auth/gitlab/login?from_app=true`
						: `/auth/gitlab/login`}
					external={onTauriApp && import.meta.env.PROD}
				>
					gitlab.com (SaaS)
				</Button>
				<Button on:click={() => (selfHosted = true)}>GitLab self-hosted</Button>
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	.container {
		position: relative;
		z-index: 99;

		:global(button) {
			width: 100%;
		}
	}

	.tooltip {
		position: absolute;
		top: calc(100% + 0.25rem);
		left: 50%;
		display: flex;
		flex-direction: column;
		padding: var(--gap);
		border: 1px solid variables.$bg-4;
		border-radius: variables.$radius;
		background-color: variables.$bg-2;
		box-shadow: variables.$shadow;
		gap: var(--gap);
		translate: -50% 0;
		white-space: nowrap;

		&.left {
			right: 0;
			left: unset;
			translate: 0 0;
		}

		&::before {
			position: absolute;
			content: '';
			inset: -0.5rem;
		}
	}

	.pat {
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		&.disabled {
			opacity: 0.5;
			pointer-events: none;
		}

		.text {
			@include typography.base;

			white-space: wrap;
		}

		.link {
			@include mixins.link;

			z-index: 1;
		}
	}

	.error {
		color: variables.$red;
	}
</style>
