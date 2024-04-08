<script lang="ts">
	import { browser } from '$app/environment';
	import { intersect } from '$lib/features';
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
	export let small = false;

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
	// Set hard height, and set width: 100% on visible
	let element: HTMLParagraphElement;
	let width = '100';

	$: tall = element?.scrollHeight > element?.clientHeight + 1;
	$: onWebkit = browser && navigator.userAgent.includes('WebKit');

	function toggleWidth() {
		width = '';
		setTimeout(() => {
			width = '100%';
		}, 100);
	}
</script>

<p
	class="description"
	class:small
	bind:this={element}
	style:width
	style:height={tall ? (small ? '2.3rem' : '2.65rem') : ''}
	use:intersect={{ callback: toggleWidth, active: onWebkit }}
>
	{#if prefix}
		<span>{prefix}</span>
	{/if}
	{#if author}
		{#if author.avatar}
			<img
				class="image"
				src={author.avatar}
				alt=""
				width={small ? '15px' : '20px'}
				height={small ? '15px' : '20px'}
				loading="lazy"
			/>
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
		color: variables.$bg-5;
		hyphens: auto;
		-webkit-line-clamp: 2;
		word-wrap: break-word;

		&.small {
			@include typography.small;
		}

		.clickable:hover {
			text-decoration: underline;
		}

		.image {
			@include mixins.broken-img;

			display: inline;
			border-radius: 50%;
			vertical-align: sub;
		}

		.bold {
			color: variables.$bg-6;
		}

		.italic {
			font-style: italic;
		}
	}
</style>
