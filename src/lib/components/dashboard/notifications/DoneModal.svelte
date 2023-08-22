<script>
	import { Button, Modal, ScrollbarContainer, Switch } from '$lib/components';
	import { DoubleCheckIcon } from '$lib/icons';
	import { filteredNotifications, githubNotifications, settings } from '$lib/stores';
	import Notification from './Notification.svelte';

	$: applyFiltersForDone = $settings.applyFiltersForDone;
	$: dones = (applyFiltersForDone ? $filteredNotifications : $githubNotifications).filter(
		({ done }) => done
	);
</script>

{#if dones.length}
	<div class="wrapper">
		<Modal title="Done ({dones.length})" small>
			<Button slot="trigger" secondary small>
				<DoubleCheckIcon />
				Done ({dones.length})
			</Button>
			<ScrollbarContainer slot="content" margin="2rem 1rem">
				<div class="switch-container">
					<Switch bind:active={applyFiltersForDone} label="Apply filters" />
				</div>
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

	.switch-container {
		padding: 2rem 2rem 0;
	}

	.list {
		display: flex;
		flex-direction: column;
		padding: 2rem;
		gap: 1rem;
	}
</style>
