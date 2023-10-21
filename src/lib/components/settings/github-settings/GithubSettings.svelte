<script lang="ts">
	import type { Settings } from '~/lib/types';
	import { Button, InlineSelect } from '$lib/components';
	import { ExternalLinkIcon } from '$lib/icons';
	import { settings } from '$lib/stores';
	import PatItem from './PatItem.svelte';

	export let onExpand: () => void;

	let editing = false;
	const numberOptions: Array<Settings['notificationNumber']> = [25, 50, 75, 100];

	$: if (editing) {
		onExpand();
	}
</script>

<h3>GitLight settings</h3>
<InlineSelect
	label="Notification number"
	options={numberOptions}
	bind:value={$settings.notificationNumber}
	on:change={() => dispatchEvent(new CustomEvent('refetch'))}
/>
<span />
<h3>GitHub notification settings</h3>
<p class="text">
	In order to receive GitHub notifications in the app, you need to update some settings:
</p>
<Button href="https://github.com/settings/notifications" external small>
	<ExternalLinkIcon />
	Notification settings
</Button>
<p class="list-item">
	<strong>Watching</strong> and <strong>Participating, @mentions and custom</strong> must be set to
	<strong>Notify me: on GitHub</strong>.
</p>
<p class="list-item">
	If you want to receive workflow related notifications, set <strong>Actions</strong> to
	<strong>Notify me: on GitHub</strong>.
</p>
<p class="list-item">
	If you want to receive Dependabot related notifications, set <strong>
		Dependabot alerts: New vulnerabilities
	</strong>
	to <strong>Notify me: on GitHub</strong>.
</p>
<span />
<h3>Organization access</h3>
<p class="text">
	For private repositories, the GitHub organization that owns these repositories must grant GitLight
	access to notifications:
</p>
<Button
	href="https://github.com/settings/connections/applications/3db3813c5828d8bbe530"
	external
	small
>
	<ExternalLinkIcon />
	Organization access
</Button>
<span />
<h3>GitHub PATs</h3>
<p class="text">
	Fine-grained Personal Access Tokens are required to access data in private repositories. They
	enable you to restrict access to the strict minimum (read-only, expiration date, only certain
	repositories...). <strong>GitLight will only read data in your private repositories</strong>. It
	will never write or modify anything.
</p>
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
	<strong>Repository permissions</strong>: set <strong>Contents</strong>,
	<strong>Discussions</strong>, <strong>Issues</strong>,
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
{#if !$settings.pats.length && !editing}
	<p class="text">No PATs yet.</p>
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

		strong {
			@include typography.bold;
		}

		a {
			@include mixins.link;
		}
	}

	* ~ :global(a) {
		width: fit-content;
	}
</style>
