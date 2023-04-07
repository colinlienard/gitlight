<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import { Button } from '~/lib/components';

	let timeout: NodeJS.Timeout | null = null;
	let active = false;

	function handleMouseDown() {
		active = true;
		timeout = setTimeout(signOut, 1500);
	}

	function handleMouseUp() {
		clearTimeout(timeout as NodeJS.Timeout);
		timeout = null;
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
			transition: clip-path 1.5s linear;

			&.active {
				clip-path: inset(0 0 0 0);
			}

			&.ended {
				transition-duration: 0.2s;
			}
		}
	}
</style>
