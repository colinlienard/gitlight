<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '~/lib/components';

	let timeout: ReturnType<typeof setTimeout> | undefined;
	let active = false;

	function handleMouseDown() {
		active = true;
		timeout = setTimeout(() => {
			localStorage.removeItem('user');
			localStorage.removeItem('access_token');
			goto('/');
		}, 1000);
	}

	function handleMouseUp() {
		clearTimeout(timeout as ReturnType<typeof setTimeout>);
		timeout = undefined;
		active = false;
	}
</script>

<div class="sign-out" on:mousedown={handleMouseDown} on:mouseup={handleMouseUp}>
	<div class="progress" class:active class:ended={!timeout} />
	<Button type="secondary" small>Hold to sign out</Button>
</div>

<style lang="scss">
	.sign-out {
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
