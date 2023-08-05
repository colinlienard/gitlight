<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '~/lib/components';
	import { storage } from '~/lib/helpers';

	export let provider: 'github' | 'gitlab';

	let timeout: ReturnType<typeof setTimeout> | undefined;
	let active = false;

	function handleMouseDown() {
		active = true;
		timeout = setTimeout(() => {
			storage.remove(`${provider}-user`);
			storage.remove(`${provider}-access-token`);

			if (
				(provider === 'github' && storage.has('gitlab-user')) ||
				(provider === 'gitlab' && storage.has('github-user'))
			) {
				window.location.reload();
			} else {
				goto(`/login${window.__TAURI__ ? '?desktop=true' : ''}`);
			}
		}, 1000);
	}

	function handleMouseUp() {
		clearTimeout(timeout as ReturnType<typeof setTimeout>);
		timeout = undefined;
		active = false;
	}
</script>

<div class="log-out" on:mousedown={handleMouseDown} on:mouseup={handleMouseUp} role="presentation">
	<div class="progress" class:active class:ended={!timeout} />
	<Button secondary small>Hold to log out</Button>
</div>

<style lang="scss">
	.log-out {
		position: relative;
		display: flex;
		flex-direction: column;
		color: variables.$red;

		.progress {
			position: absolute;
			z-index: 1;
			border-radius: variables.$radius;
			background-color: currentcolor;
			clip-path: inset(0 100% 0 0);
			inset: 0;
			opacity: 0.25;
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
