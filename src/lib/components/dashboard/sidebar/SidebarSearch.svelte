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

<Input icon={SearchIcon} bind:value={search} placeholder="Search" clearable bind:this={input}>
	{#if !search}
		<span class="key">/</span>
	{/if}
</Input>

<style lang="scss">
	.key {
		@include typography.small;

		position: absolute;
		right: 0.75rem;
		padding: 0.25rem 0.5rem;
		border: 1px solid variables.$grey-3;
		border-radius: 0.25rem;
		color: variables.$grey-4;
		white-space: nowrap;
	}
</style>
