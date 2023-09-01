<script lang="ts">
	import { InlineSelect, Switch, Tooltip } from '$lib/components';
	import { settings } from '$lib/stores';
	import type { Settings } from '$lib/types';

	const numberOptions: Array<Settings['notificationNumber']> = [25, 50, 75, 100];

	let mounted = false;

	$: notificationNumber = $settings.notificationNumber;
	$: if (mounted) {
		notificationNumber;
		dispatchEvent(new CustomEvent('refetch'));
	} else {
		mounted = true;
	}
</script>

<h3>General</h3>
<Switch
	label="Activate push notifications (only on desktop app)"
	bind:active={$settings.activateNotifications}
/>
<Switch
	label="Mark a notification as read when opening in the browser"
	bind:active={$settings.readWhenOpenInBrowser}
/>
<Switch label="Mark a notification as read when pinned" bind:active={$settings.readWhenPin} />
<Switch label="Hide closed PRs and issues" bind:active={$settings.showOnlyOpen} />
<InlineSelect
	label="Notification number"
	options={numberOptions}
	bind:value={$settings.notificationNumber}
/>
<span />
<h3>Interface</h3>
<div class="views">
	<Tooltip
		content="A simple vertical list, with pinned notifications at the top."
		hover
		width="10rem"
	>
		<button
			class="view"
			class:active={$settings.viewMode === 'List'}
			on:click={() => ($settings.viewMode = 'List')}
		>
			<p class="name">List</p>
			<div class="blocks padding">
				<div class="block">
					<div class="item" />
					<div class="item" />
					<div class="item" />
					<div class="item" />
					<div class="item" />
				</div>
			</div>
		</button>
	</Tooltip>
	<Tooltip content="Three columns with pinned, unread and read notifications." hover width="10rem">
		<button
			class="view"
			class:active={$settings.viewMode === 'Kanban'}
			on:click={() => ($settings.viewMode = 'Kanban')}
		>
			<p class="name">Kanban</p>
			<div class="blocks">
				<div class="block">
					<div class="item" />
					<div class="item" />
					<div class="item" />
					<div class="item" />
					<div class="item" />
				</div>
				<div class="block">
					<div class="item" />
					<div class="item" />
					<div class="item" />
					<div class="item" />
					<div class="item" />
				</div>
				<div class="block">
					<div class="item" />
					<div class="item" />
					<div class="item" />
					<div class="item" />
					<div class="item" />
				</div>
			</div>
		</button>
	</Tooltip>
	<Tooltip
		content="Three vertically aligned groups with pinned, unread and read notifications."
		hover
		width="10rem"
	>
		<button
			class="view"
			class:active={$settings.viewMode === 'Kanban (vertical)'}
			on:click={() => ($settings.viewMode = 'Kanban (vertical)')}
		>
			<p class="name">Kanban (vertical)</p>
			<div class="blocks padding vertical">
				<div class="block">
					<div class="item" />
				</div>
				<div class="block">
					<div class="item" />
					<div class="item" />
				</div>
				<div class="block">
					<div class="item" />
					<div class="item" />
				</div>
			</div>
		</button>
	</Tooltip>
</div>
<Switch label="Show notifications sync timer" bind:active={$settings.showNotificationsSyncTimer} />
<Switch
	label="Show notifications owner and repository"
	bind:active={$settings.showNotificationsRepo}
/>
<Switch label="Hide sidebar" bind:active={$settings.sidebarHidden} />

<style lang="scss">
	.views {
		display: flex;
		gap: 1rem;

		& > :global(div) {
			width: 100%;
		}

		.view {
			@include mixins.box(true);

			display: flex;
			overflow: hidden;
			width: 100%;
			height: 8rem;
			flex-direction: column;
			align-items: center;
			padding: 0.5rem 0.5rem 0;
			gap: 0.5rem;

			&.active {
				outline: 2px solid variables.$blue-2;
				outline-offset: -2px;
			}

			.blocks {
				display: flex;
				width: 100%;
				gap: 0.25rem;

				&.padding {
					padding: 0 0.5rem;
				}

				&.vertical {
					flex-direction: column;
				}

				.block {
					display: flex;
					width: 100%;
					flex-direction: column;
					padding: 0.25rem;
					border-radius: 0.25rem;
					background-color: variables.$grey-3;
					gap: 0.25rem;

					.item {
						width: 100%;
						height: 1rem;
						border-radius: 0.25rem;
						background-color: #323232;
					}
				}
			}
		}
	}
</style>
