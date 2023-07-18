<script>
	import { Button, Modal, ScrollbarContainer } from '~/lib/components';
	import { DoubleCheckIcon } from '~/lib/icons';
	import { githubNotifications } from '~/lib/stores';
	import Notification from './Notification.svelte';

	$: dones = $githubNotifications.filter(({ done }) => done);
</script>

{#if dones.length}
	<div class="wrapper">
		<Modal title="Done" small>
			<Button slot="trigger" secondary small>
				<DoubleCheckIcon />
				Done
			</Button>
			<ScrollbarContainer slot="content" margin="2rem 1rem">
				<ul class="list">
					{#each dones as notification (notification.id)}
						<li class="list-item">
							<Notification data={notification} />
						</li>
					{/each}
				</ul>
			</ScrollbarContainer>
		</Modal>
	</div>
{/if}

<style lang="scss">
	.wrapper {
		margin-left: auto;
	}

	.list {
		display: flex;
		flex-direction: column;
		padding: 2rem;
		gap: 1rem;
	}
</style>
