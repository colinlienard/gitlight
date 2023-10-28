<script>
	import { Button, Modal, ScrollbarContainer, Switch } from '$lib/components';
	import { DoubleCheckIcon } from '$lib/icons';
	import { filteredNotifications, globalNotifications, settings } from '$lib/stores';
	import Notification from './Notification.svelte';

	$: applyFiltersForDone = $settings.applyFiltersForDone;
	$: dones = (applyFiltersForDone ? $filteredNotifications : $globalNotifications).filter(
		({ done }) => done
	);
</script>

<div class="wrapper">
	<Modal title="Done ({dones.length})" small>
		<Button slot="trigger" secondary small>
			<DoubleCheckIcon />
			Done ({dones.length})
		</Button>
		<ScrollbarContainer slot="content" margin="2rem 1rem">
			<div class="switch-container">
				<Switch bind:active={$settings.applyFiltersForDone} label="Apply filters" />
			</div>
			{#if dones.length}
				<ul class="list">
					{#each dones as notification (notification.id)}
						<li class="list-item">
							<Notification data={notification} />
						</li>
					{/each}
				</ul>
			{:else}
				<div class="empty">
					<p class="text">No notifications to display.</p>
				</div>
			{/if}
		</ScrollbarContainer>
	</Modal>
</div>

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

	.empty {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;

		.text {
			color: variables.$grey-4;
		}
	}
</style>
