<script lang="ts">
	import * as rive from '@rive-app/canvas';

	let canvas: HTMLCanvasElement;

	$: if (canvas) {
		new rive.Rive({
			src: '/rive/logo.riv',
			canvas,
			autoplay: true
		});
	}
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
