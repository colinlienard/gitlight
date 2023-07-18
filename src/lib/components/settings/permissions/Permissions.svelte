<script lang="ts">
	import { Button, ShrinkableWrapper } from '~/lib/components';
	import { ExternalLinkIcon } from '~/lib/icons';
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
	<strong>
		The owner might have to <a
			href="https://docs.github.com/en/organizations/managing-programmatic-access-to-your-organization/setting-a-personal-access-token-policy-for-your-organization#enforcing-an-approval-policy-for-fine-grained-personal-access-tokens"
			target="_blank"
		>
			approve your token
		</a> in order for it to work.
	</strong>
</p>
<p class="list-item">
	<strong>Repository access</strong>: choose all repos or select some. You don't need a PAT for
	public repositories.
</p>
<p class="list-item">
	<strong>Repository permissions</strong>: set <strong>Contents</strong>, <strong>Issues</strong>,
	<strong>Metadata</strong>
	and <strong>Pull requests</strong> to <strong>Access: read-only</strong>.
</p>
<p class="list-item">Generate the token.</p>
<p class="list-item">Finally, add the token below. You can add as many tokens as you want.</p>
<span />
<h3>Use PATs in GitLight</h3>
{#each $settings.pats as pat}
	<PatItem {pat} />
{/each}
{#if editing}
	<PatItem editing on:exit={() => (editing = false)} />
{/if}
<Button secondary on:click={() => (editing = true)}>Use a new PAT</Button>

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
		position: relative;
		padding-left: 1rem;

		&::before {
			position: absolute;
			left: 0;
			content: '-';
		}

		a {
			@include mixins.link;
		}
	}

	code {
		position: relative;
		padding: 0 0.1em;
		font: inherit;

		&::before {
			position: absolute;
			z-index: -1;
			border-radius: 4px;
			background-color: variables.$grey-3;
			content: ' ';
			inset: -0.1em;
		}
	}

	* ~ :global(a) {
		width: fit-content;
	}
</style>
