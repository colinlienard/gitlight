<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';

	function handleSignIn() {
		signIn('github', { callbackUrl: '/dashboard' });
	}
</script>

<button on:click={handleSignIn}>Sign in</button>
