<script lang="ts">
	import { onMount } from 'svelte';
	import { linear } from 'svelte/easing';

	export let title: string;

	let slider: HTMLDivElement;
	let sliderContent: HTMLSpanElement;

	onMount(() => {
		const diff = sliderContent.offsetWidth - slider.offsetWidth;
		if (diff) {
			console.log(diff / 100);
		}
	});

	function slide() {
		return {
			duration: 2000,
			css: (t) => {
				const eased = linear(t);

				return `
					transform: translateX(-${eased}px) scale(${1 + eased});
					`;
			}
		};
	}
</script>

<div class="title-container">
	<h3 class="title">{title}</h3>
	<div class="title-slider" bind:this={slider}>
		<span class="slider-content" bind:this={sliderContent} in:slide={{}}>{title}</span>
	</div>
</div>

<style lang="scss">
	.title-container {
		position: relative;
		overflow: hidden;

		.title {
			@include typography.bold;
			flex: 0 1 auto;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.title-slider {
			position: absolute;
			inset: 0;
			overflow: hidden;
			background-color: variables.$grey-2;
			/* opacity: 0; */

			.slider-content {
				@include typography.bold;
				white-space: nowrap;
			}
		}

		&:hover .title-slider {
			opacity: 1;
		}
	}
</style>
