<script lang="ts">
	import { emit } from '@tauri-apps/api/event';
	import { Button } from '~/lib/components';
	import { updateAvailable } from '~/lib/stores';

	async function update() {
		await emit('tauri://update');
	}
</script>

{#if $updateAvailable}
	<div class="card">
		<p>Version {$updateAvailable} is available!</p>
		<Button on:click={update}>Install it now</Button>
	</div>
{:else}
	<p>GitLight is up to date.</p>
{/if}

<style lang="scss">
	.card {
		@include mixins.shiny(variables.$grey-3, false);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1rem;
		padding: 1rem;
		width: fit-content;

		:global(button) {
			width: 100%;
		}
	}
</style>
