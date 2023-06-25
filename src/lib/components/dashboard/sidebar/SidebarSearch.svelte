<script lang="ts">
	import { browser } from '$app/environment';
	import { onDestroy, onMount, type SvelteComponent } from 'svelte';
	import { Input } from '~/lib/components';
	import { SearchIcon } from '~/lib/icons';

	export let search = '';

	let input: SvelteComponent;

	function handleSearchFocus(event: KeyboardEvent) {
		if (event.key === '/') {
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
		border-radius: 0.25rem;
		border: 1px solid variables.$grey-3;
		color: variables.$grey-4;
		white-space: nowrap;
	}
</style>
