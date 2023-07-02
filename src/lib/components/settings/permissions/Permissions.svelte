<script lang="ts">
	import { ExternalLinkIcon } from '~/lib/icons';
	import { Button, ShrinkableWrapper } from '~/lib/components';
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
<ShrinkableWrapper shrinked>
	<h3 slot="header">Fow those who where using GitLight before version 0.9.0</h3>
	<p class="text">
		Because you accepted the <code>repo</code> scope when you first logged in, you don't need to do
		anything as long as you're not subscribing to a new private repository from a different owner.
		But if you want to also use fine-grained permissions, you can just log out and log in again, and
		you'll be prompted to accept only the
		<code>notifications</code> scope, not the <code>repo</code> scope anymore.
	</p>
</ShrinkableWrapper>
<span />
<h3>Create a fine-grained PAT</h3>
<Button href="https://github.com/settings/tokens?type=beta" external small>
	<ExternalLinkIcon />
	Create a new fine-grained PAT on GitHub
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
	<PatItem on:exit={() => (editing = false)} />
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

	code {
		font: inherit;
		padding: 0 0.1em;
		position: relative;

		&::before {
			content: ' ';
			position: absolute;
			inset: -0.1em;
			border-radius: 4px;
			background-color: variables.$grey-3;
			z-index: -1;
		}
	}

	* ~ :global(a) {
		width: fit-content;
	}
</style>
