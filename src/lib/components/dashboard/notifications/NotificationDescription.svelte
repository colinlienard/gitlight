<script lang="ts">
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

	$: authorUrl = author && !author.bot ? `https://github.com/${author.login}` : '';

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
	// Set hard height, and set width: 100% after 500ms
	let element: HTMLParagraphElement;
	let timer = false;

	setTimeout(() => {
		timer = true;
	}, 500);

	$: tall = element?.scrollHeight > element?.clientHeight + 1;
</script>

<p
	class="description"
	bind:this={element}
	style:width={timer ? '100%' : ''}
	style:height={tall ? '2.65rem' : ''}
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

		display: -webkit-box;
		overflow: hidden;
		-webkit-box-orient: vertical;
		color: variables.$grey-4;
		hyphens: auto;
		-webkit-line-clamp: 2;
		word-wrap: break-word;

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
