<script lang="ts">
	import { onDestroy, onMount, type SvelteComponent } from 'svelte';
	import { browser } from '$app/environment';
	import { Input, modalOpen } from '$lib/components';
	import { SearchIcon } from '$lib/icons';
	import { settings } from '$lib/stores';

	export let search = '';

	let input: SvelteComponent;

	function handleSearchFocus(event: KeyboardEvent) {
		if (
			(event.metaKey || event.ctrlKey) &&
			event.key === 'f' &&
			!$modalOpen &&
			!$settings.sidebarHidden
		) {
			event.preventDefault();
			input.focus();
		}
	}

	onMount(() => {
		document.addEventListener('keydown', handleSearchFocus);
	});

	onDestroy(() => {
		if (browser) {
			document.removeEventListener('keydown', handleSearchFocus);
		}
	});
</script>

<Input icon={SearchIcon} bind:value={search} placeholder="Search" clearable bind:this={input} />
