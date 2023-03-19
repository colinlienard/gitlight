<script lang="ts">
	import { Plus, Search } from '~/lib/icons';
	import { Button, Input, Separator, ShrinkableWrapper, Switch } from '~/lib/components';

	let active = true;
	let value = '';
</script>

<article class="sidebar">
	<img src="/images/sidebar-gradient.png" alt="" class="gradient" />
	<header class="header">
		<h1 class="title">GitLight</h1>
	</header>
	<ShrinkableWrapper title="Filters">
		<Input icon={Search} bind:value placeholder="Placeholder" />
		<Separator />
		<Switch bind:active label="Pull requests" />
		<Switch bind:active label="Issues" />
	</ShrinkableWrapper>
	<ShrinkableWrapper title="Watching">
		<Switch bind:active label="Personal events" />
		<Switch bind:active label="ColinLienard/gitlight" />
		<Button type="secondary" small><Plus />Add a repository</Button>
	</ShrinkableWrapper>
</article>

<style lang="scss">
	.sidebar {
		flex: 0 0 20rem;
		height: 100vh;
		border-right: 1px solid variables.$grey-3;
		padding: 3rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 3rem;
		position: relative;
	}

	.gradient {
		position: absolute;
		inset: 0;
		z-index: -1;
	}

	.header {
		.title {
			@include typography.heading-1;
		}
	}
</style>
