<script lang="ts">
	import type { OverlayScrollbars } from 'overlayscrollbars';
	import { onDestroy, onMount } from 'svelte';

	export let scroll = true;
	export let margin = '0';

	let component: HTMLDivElement;
	let osInstance: OverlayScrollbars | undefined;

	export function scrollTo(options: { left?: number; top?: number; behavior?: 'auto' | 'smooth' }) {
		osInstance?.elements().viewport.scroll(options);
	}

	onMount(async () => {
		const { OverlayScrollbars } = await import('overlayscrollbars');
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
			--os-handle-bg: #{variables.$bg-4};
			--os-handle-bg-hover: #d5d5d5;
			--os-handle-bg-active: #c8c8c8;
		}

		@include themes.dark {
			--os-handle-bg: #{variables.$bg-4};
			--os-handle-bg-hover: #2d2d2d;
			--os-handle-bg-active: #343434;
		}

		z-index: 10;
		margin: var(--margin);
	}
</style>
