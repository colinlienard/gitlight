<script lang="ts">
	import { sineInOut } from 'svelte/easing';
	import { fade } from 'svelte/transition';
	import { browser } from '$app/environment';
	import { PUBLIC_SITE_URL } from '$env/static/public';
	import { Button, Input } from '$lib/components';

	export let small = false;

	let open = false;
	let selfHosted = false;
	let url = '';
	let urlIsValid = true;

	$: onTauriApp = browser && !!window.__TAURI__;

	$: loginUrl = onTauriApp
		? `${PUBLIC_SITE_URL}/auth/gitlab/login?from_app=true${url ? `&url=${url}` : ''}`
		: `/auth/gitlab/login${url ? `?url=${url}` : ''}`;

	$: if (!open) {
		selfHosted = false;
	}

	function handleUrlChange() {
		urlIsValid = !url.match(/^(http|https):\/\/[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/);
	}
</script>

<div class="container" role="presentation">
	<Button {small} on:click={() => (open = !open)}><slot /></Button>
	{#if open}
		<div
			class="tooltip"
			style:padding={selfHosted ? '1rem' : '0.5rem'}
			transition:fade={{ duration: 150, easing: sineInOut }}
		>
			{#if selfHosted}
				<Input
					bind:value={url}
					label="GitLab self-hosted instance URL"
					placeholder="https://gitlab.example.com"
					on:input={handleUrlChange}
					autofocus
					error={url !== '' && urlIsValid}
				/>
				<Button href={loginUrl} external={onTauriApp && import.meta.env.PROD} disabled={urlIsValid}>
					Continue
				</Button>
			{:else}
				<Button href={loginUrl} external={onTauriApp && import.meta.env.PROD}>
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
		width: max-content;
		flex-direction: column;
		border: 1px solid variables.$bg-4;
		border-radius: variables.$radius;
		background-color: variables.$bg-2;
		box-shadow: variables.$shadow;
		gap: 0.5rem;
		translate: -50% 0;
		white-space: nowrap;

		&::before {
			position: absolute;
			content: '';
			inset: -0.5rem;
		}
	}
</style>
