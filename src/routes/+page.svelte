<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';

	function handleSignIn() {
		signIn('github', { callbackUrl: '/dashboard' });
	}
</script>

<button on:click={handleSignIn}>Sign in</button>
<br />
<a href="/auth/signin" data-sveltekit-preload-data="off">Sign in 2</a>
