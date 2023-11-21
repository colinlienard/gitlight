<script lang="ts">
	import { Rive } from '@rive-app/canvas';
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;

	onMount(() => {
		new Rive({
			src: '/rive/logo.riv',
			canvas,
			autoplay: true
		});
	});
</script>

<div class="container">
	<canvas bind:this={canvas} width="300" height="300" />
	<div class="hide-watermark" />
</div>

<style lang="scss">
	.container {
		position: relative;

		canvas {
			width: 8rem;
			height: 8rem;
		}

		.hide-watermark {
			position: absolute;
			width: 24%;
			height: 8%;
			background-color: variables.$bg-1;
			inset: auto 0 0 auto;
		}
	}
</style>
