<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
</script>

<button on:click={signOut}>Sign out</button>
<slot />
