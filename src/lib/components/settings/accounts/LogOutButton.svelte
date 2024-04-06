<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components';
	import { storage } from '$lib/features';

	export let provider: 'github' | 'gitlab';

	let timeout: ReturnType<typeof setTimeout> | undefined;
	let active = false;

	function handleMouseDown() {
		active = true;
		timeout = setTimeout(() => {
			storage.remove(`${provider}-user`);
			storage.remove(`${provider}-access-token`);
			if (provider === 'gitlab') {
				storage.remove('gitlab-refresh-token');
				storage.remove('gitlab-expires-in');
				storage.remove('gitlab-url');
				storage.remove('gitlab-pat');
			}

			if (
				(provider === 'github' && storage.has('gitlab-user')) ||
				(provider === 'gitlab' && storage.has('github-user'))
			) {
				window.location.reload();
			} else {
				goto('/login');
			}
		}, 1000);
	}

	function handleMouseUp() {
		clearTimeout(timeout as ReturnType<typeof setTimeout>);
		timeout = undefined;
		active = false;
	}
</script>

<div
	class="log-out"
	on:mousedown={handleMouseDown}
	on:mouseup={handleMouseUp}
	on:mouseleave={handleMouseUp}
	role="presentation"
>
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
			border-radius: calc(variables.$radius - 1px);
			background-color: currentcolor;
			clip-path: inset(0 100% 0 0);
			inset: 1px;
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
