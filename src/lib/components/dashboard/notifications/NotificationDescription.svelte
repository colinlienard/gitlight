<script lang="ts">
	import { browser } from '$app/environment';
	import type { User } from '$lib/types';

	type Description = Array<
		| string
		| {
				text: string;
				type: 'bold' | 'italic';
		  }
	>;

	type TextType = 'bold' | 'italic' | null;

	export let author: User | undefined;
	export let description: string;
	export let prefix: string | undefined = undefined;
	export let openUrl: (url: string) => void;
	export let from: 'github' | 'gitlab';

	$: authorUrl = author && !author.bot ? `https://${from}.com/${author.login}` : '';

	let displayDescription: Description = (() => {
		const parts = description.split(/(\*|_)/);
		const resultArray: Description = [];
		let type: TextType = null;

		for (const text of parts) {
			if (text === '*') {
				type = type === 'bold' ? null : 'bold';
				continue;
			}
			if (text === '_') {
				type = (type as TextType) === 'italic' ? null : 'italic';
				continue;
			}
			if (type) {
				resultArray.push({ text, type });
			} else {
				resultArray.push(text);
			}
		}

		return resultArray;
	})();

	// WebKit fix to avoid line-clamp bug
	let element: HTMLParagraphElement;

	$: tall = element?.scrollHeight > 40;
	$: onWebkit = browser && navigator.userAgent.includes('WebKit');
</script>

<p
	class="description"
	class:webkit={onWebkit}
	style:height={tall ? '2.6rem' : ''}
	bind:this={element}
>
	{#if prefix}
		<span>{prefix}</span>
	{/if}
	{#if author}
		{#if author.avatar}
			<img class="image" src={author.avatar} alt="" width="20px" height="20px" loading="lazy" />
		{/if}
		{#if authorUrl}
			<button class="clickable" on:mouseup={() => openUrl(authorUrl)}>
				{author.login}
			</button>
		{:else}
			<span>{author.login}</span>
		{/if}
	{/if}
	{#each displayDescription as part}
		{#if typeof part === 'string'}
			<span>{part}</span>
		{:else}
			<span class={part.type}>{part.text}</span>
		{/if}
	{/each}
</p>

<style lang="scss">
	.description {
		@include typography.base;

		overflow: hidden;
		color: variables.$grey-4;
		hyphens: auto;
		word-wrap: break-word;

		&:not(.webkit) {
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
		}

		.clickable:hover {
			text-decoration: underline;
		}

		.image {
			display: inline;
			border-radius: 50%;
			vertical-align: sub;
		}

		.bold {
			color: variables.$white;
		}

		.italic {
			font-style: italic;
		}
	}
</style>
