<script lang="ts">
	import { OverlayScrollbars } from 'overlayscrollbars';
	import { onDestroy, onMount } from 'svelte';

	export let scroll = true;
	export let margin = '0';

	let component: HTMLDivElement;
	let osInstance: OverlayScrollbars;

	export function scrollTo(x: number, y: number) {
		osInstance.elements().viewport.scroll({
			top: y,
			left: x
		});
	}

	onMount(() => {
		osInstance = OverlayScrollbars(component, {
			overflow: {
				x: 'hidden'
			},
			scrollbars: {
				autoHide: 'leave',
				autoHideDelay: 0
			}
		});
	});

	onDestroy(() => {
		osInstance?.destroy();
	});
</script>

{#if scroll}
	<div style="--margin: {margin}" bind:this={component}>
		<slot />
	</div>
{:else}
	<slot />
{/if}

<style lang="scss">
	:global([data-overlayscrollbars]) {
		width: 100%;
		height: 100%;
	}

	:global(.os-scrollbar) {
		--os-handle-bg: #262626;
		--os-handle-bg-hover: #343434;
		--os-handle-bg-active: #424242;
		margin: var(--margin);
		z-index: 10;
	}
</style>
