<script lang="ts">
	import { OverlayScrollbarsComponent } from 'overlayscrollbars-svelte';

	export let scroll = true;
	export let margin = '0.25rem';
</script>

{#if scroll}
	<OverlayScrollbarsComponent
		style="--margin: {margin};"
		options={{
			scrollbars: {
				autoHide: 'leave'
			}
		}}
	>
		<slot />
	</OverlayScrollbarsComponent>
{:else}
	<slot />
{/if}

<style lang="scss">
	:global([data-overlayscrollbars]) {
		height: fit-content;
	}

	:global(.os-scrollbar) {
		--os-handle-bg: #262626;
		--os-handle-bg-hover: #343434;
		--os-handle-bg-active: #424242;
		margin: var(--margin);
		z-index: 999;
	}
</style>
