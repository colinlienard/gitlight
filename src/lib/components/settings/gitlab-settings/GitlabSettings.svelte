<script lang="ts">
	import { Button, Switch } from '$lib/components';
	import { ExternalLinkIcon } from '$lib/icons';
	import { settings } from '$lib/stores';
	import GitlabRepos from './GitlabRepos.svelte';
</script>

<h3>GitLight settings</h3>
<Switch
	label="Show only notifications in which you are involved"
	bind:active={$settings.gitlabOnlyInvolved}
/>
<span />
<h3>Review applications</h3>
<p class="text">
	You can review GitLight access <a href="https://gitlab.com/oauth/applications" target="_blank">
		here</a
	>. More documentation:
</p>
<div class="button-container">
	<Button href="https://docs.gitlab.com/ee/integration/oauth_provider.html" external small>
		<ExternalLinkIcon />
		GitLab documentation
	</Button>
</div>
<span />
<h3>Repositories</h3>
<GitlabRepos />

<style lang="scss">
	.text {
		@include typography.base;

		color: variables.$bg-4;

		a {
			@include mixins.link;
		}
	}

	.button-container {
		width: fit-content;
	}
</style>
