<script lang="ts">
	import { emit } from '@tauri-apps/api/event';
	import { Button } from '~/lib/components';

	export let updateAvailable: string | false;

	let loading = false;

	async function update() {
		loading = true;
		await emit('tauri://update');
	}
</script>

{#if updateAvailable}
	<div class="card">
		<p>Version {updateAvailable} is available!</p>
		<Button on:click={update} {loading}>Install it now</Button>
	</div>
{:else}
	<p>GitLight is up to date.</p>
{/if}

<style lang="scss">
	.card {
		@include mixins.shiny(variables.$grey-3, false);

		display: flex;
		width: fit-content;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		gap: 1rem;

		:global(button) {
			width: 100%;
		}
	}
</style>
