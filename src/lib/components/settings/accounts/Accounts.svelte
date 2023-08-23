<script lang="ts">
	import { page } from '$app/stores';
	import { GithubIcon, GitlabIcon } from '$lib/icons';
	import Account from './Account.svelte';

	const githubUser = $page.data.session?.githubUser;
	const gitlabUser = $page.data.session?.gitlabUser;
</script>

<ul class="accounts-wrapper">
	<Account title="GitHub" provider="github" user={githubUser}>
		<GithubIcon slot="icon" />
	</Account>
	<Account title="GitLab" provider="gitlab" user={gitlabUser}>
		<GitlabIcon slot="icon" />
	</Account>
</ul>

<style lang="scss">
	.accounts-wrapper {
		display: grid;
		gap: 1rem;
		grid-template-columns: 1fr 1fr;
	}
</style>
