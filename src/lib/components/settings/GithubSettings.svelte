<script lang="ts">
	import { ExternalLinkIcon } from '~/lib/icons';
	import { Button } from '~/lib/components';
	import { settingsTab } from '~/lib/stores';
</script>

<h3>Notification settings</h3>
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
<h3>Private repositories</h3>
<p class="text">
	To access data in private repositories, you need to grant access to GitLight. You can do so by
	creating a Personal Access Token (PAT) on GitHub.
</p>
<Button small on:click={() => ($settingsTab = 2)}>How to use PATs for GitLight</Button>
<span />
<h3>Organization access</h3>
<p class="text">
	For private repositories, the GitHub organization that owns these repositories must create a
	Personal Access Token (see above), and grant GitLight access to notifications:
</p>
<Button
	href="https://github.com/settings/connections/applications/3db3813c5828d8bbe530"
	external
	small
>
	<ExternalLinkIcon />
	Organization access
</Button>

<style lang="scss">
	.text,
	.list-item {
		@include typography.base;
		color: variables.$grey-4;
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

		strong {
			@include typography.bold;
		}
	}

	* ~ :global(a),
	* ~ :global(button) {
		width: fit-content;
	}
</style>
