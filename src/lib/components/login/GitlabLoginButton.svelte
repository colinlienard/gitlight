<script>
	import { browser } from '$app/environment';
	import { PUBLIC_SITE_URL } from '$env/static/public';
	import { Button } from '$lib/components';

	export let small = false;

	$: onTauriApp = browser && !!window.__TAURI__;
</script>

<Button
	href={onTauriApp ? `${PUBLIC_SITE_URL}/auth/gitlab/login?from_app=true` : '/auth/gitlab/login'}
	external={onTauriApp && import.meta.env.PROD}
	{small}
>
	<slot />
</Button>
