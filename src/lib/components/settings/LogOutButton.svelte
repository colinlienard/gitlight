<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '~/lib/components';
	import { storage } from '~/lib/helpers';

	let timeout: ReturnType<typeof setTimeout> | undefined;
	let active = false;

	function handleMouseDown() {
		active = true;
		timeout = setTimeout(() => {
			storage.remove('user');
			storage.remove('access-token');
			goto(`/login${window.__TAURI__ ? '?desktop=true' : ''}`);
		}, 1000);
	}

	function handleMouseUp() {
		clearTimeout(timeout as ReturnType<typeof setTimeout>);
		timeout = undefined;
		active = false;
	}
</script>

<div class="log-out" on:mousedown={handleMouseDown} on:mouseup={handleMouseUp}>
	<div class="progress" class:active class:ended={!timeout} />
	<Button type="secondary" small>Hold to log out</Button>
</div>

<style lang="scss">
	.log-out {
		display: flex;
		flex-direction: column;
		color: variables.$red;
		position: relative;

		.progress {
			position: absolute;
			inset: 0;
			clip-path: inset(0 100% 0 0);
			background-color: currentColor;
			opacity: 0.25;
			border-radius: variables.$radius;
			z-index: 1;
			pointer-events: none;
			transition: clip-path 1s linear;

			&.active {
				clip-path: inset(0 0 0 0);
			}

			&.ended {
				transition-duration: 0.2s;
			}
		}
	}
</style>
