<script lang="ts">
	import { ExternalLinkIcon } from '~/lib/icons';
	import { Button } from '~/lib/components';
	import { settings } from '~/lib/stores';
	import PatItem from './PatItem.svelte';

	let editing = false;
</script>

<h3>GitHub PATs</h3>
<p class="text">
	Fine-grained Personal Access Tokens are required to access data in private repositories. They
	enable you to restrict access to the strict minimum (read-only, expiration date, only certain
	repositories...). <strong>GitLight will only read data in your private repositories</strong>. It
	will never write or modify anything.
</p>
<p class="text">
	If you are the owner of the private repositories for which you wish to receive notifications,
	please follow the steps below.
</p>
<p class="text">If not, you must ask the owner to follow the next steps and give you a token.</p>
<span />
<h3>Create a PAT</h3>
<Button href="https://github.com/settings/tokens?type=beta" external small>
	<ExternalLinkIcon />
	Create a new PAT on GitHub
</Button>
<p class="list-item">
	<strong>Resource owner</strong>: choose the owner of the private repos you want to get
	notifications from.
</p>
<p class="list-item">
	<strong>Repository access</strong>: choose all repos or select some.
</p>
<p class="list-item">
	<strong>Permissions</strong>: set <strong>Contents</strong>, <strong>Issues</strong>,
	<strong>Metadata</strong>
	and <strong>Pull requests</strong> to <strong>Access: read-only</strong>.
</p>
<p class="list-item">
	Generate the token. If you want others to get notifications from your private repos, share this
	token.
</p>
<span />
<h3>Use PATs in GitLight</h3>
{#each $settings.pats as pat}
	<PatItem {pat} editing />
{/each}
{#if editing}
	<PatItem on:save={() => (editing = false)} />
{/if}
<Button type="secondary" on:click={() => (editing = true)}>Use a new PAT</Button>

<style lang="scss">
	.text,
	.list-item {
		@include typography.base;
		color: variables.$grey-4;

		strong {
			@include typography.bold;
		}
	}

	.list-item {
		list-style: disc;
		padding-left: 1rem;
		position: relative;

		&::before {
			content: '-';
			position: absolute;
			top: 0.5rem;
			left: 0;
		}
	}

	* ~ :global(a) {
		width: fit-content;
	}
</style>
