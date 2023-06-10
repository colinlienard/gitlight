<script lang="ts">
	import { ExternalLink } from '~/lib/icons';
	import { Button } from '~/lib/components';
</script>

<div class="wrapper">
	<Button
		href="https://github.com/settings/connections/applications/3db3813c5828d8bbe530"
		external
		small
		type="secondary"
	>
		<ExternalLink />
		Organization access
	</Button>
	<Button href="https://github.com/settings/notifications" external small type="secondary">
		<ExternalLink />
		Notification settings
	</Button>
</div>

<style lang="scss">
	.wrapper {
		display: flex;
		gap: 1rem;
	}
</style>
