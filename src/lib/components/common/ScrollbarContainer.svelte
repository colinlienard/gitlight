<script lang="ts">
	import { OverlayScrollbars } from 'overlayscrollbars';
	import { onDestroy, onMount } from 'svelte';

	export let scroll = true;
	export let margin = '0';

	let component: HTMLDivElement;
	let osInstance: OverlayScrollbars;

	export function scrollTo(options: { left?: number; top?: number; behavior?: 'auto' | 'smooth' }) {
		osInstance.elements().viewport.scroll(options);
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
		@include themes.light {
			--os-handle-bg: #bdbdbd;
			--os-handle-bg-hover: #a5a5a5;
			--os-handle-bg-active: #8a8a8a;
		}

		@include themes.dark {
			--os-handle-bg: #262626;
			--os-handle-bg-hover: #2d2d2d;
			--os-handle-bg-active: #343434;
		}

		z-index: 10;
		margin: var(--margin);
	}
</style>
