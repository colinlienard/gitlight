<script lang="ts">
	import { emit } from '@tauri-apps/api/event';
	import { Button } from '$lib/components';
	import { getAppVersion } from '$lib/helpers';
	import { GithubIcon } from '$lib/icons';

	export let updateAvailable: string | false;
	export let checkUpdate: () => Promise<boolean>;

	let loading = false;
	let cannotUpdate = false;

	async function update() {
		loading = true;
		await emit('tauri://update');
	}

	async function check() {
		loading = true;
		const canUpdate = await checkUpdate();
		if (canUpdate) {
			await emit('tauri://update');
		} else {
			cannotUpdate = true;
			loading = false;
		}
	}
</script>

<div class="card">
	{#if updateAvailable}
		<p>GitLight v{updateAvailable} is available!</p>
		<Button on:click={update} {loading}>Install it now</Button>
	{:else}
		<p>GitLight v{getAppVersion()}</p>
		{#if cannotUpdate}
			<Button secondary disabled>No update available</Button>
		{:else}
			<Button secondary on:click={check} {loading}>Check for update</Button>
		{/if}
	{/if}
</div>
<Button secondary href="https://github.com/colinlienard/gitlight" external>
	<GithubIcon />
	GitHub repository
</Button>

<style lang="scss">
	.card {
		@include mixins.box;

		display: flex;
		width: 100%;
		height: 12rem;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 1rem;
		gap: 1rem;
	}
</style>
