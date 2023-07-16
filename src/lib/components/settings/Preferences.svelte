<script lang="ts">
	import { Button, InlineSelect, Switch, Tooltip, type TooltipContent } from '~/lib/components';
	import { settings } from '~/lib/stores';
	import type { ObjectEntries, Settings } from '~/lib/types';

	const axisOptions: Array<Settings['notificationAxis']> = ['Auto', 'Vertical', 'Horizontal'];
	const numberOptions: Array<Settings['notificationNumber']> = [25, 50, 75, 100];

	$: reasons = (
		Object.entries($settings.notificationReasons) as ObjectEntries<
			typeof $settings.notificationReasons
		>
	).map(([key, active]) => {
		let text: string;
		switch (key) {
			case 'assign':
				text = 'Assigned';
				break;
			case 'author':
				text = 'Created';
				break;
			case 'comment':
				text = 'Commented';
				break;
			case 'invitation':
				text = 'Invited';
				break;
			case 'manual':
				text = 'Manual';
				break;
			case 'mention':
				text = 'Mentioned';
				break;
			case 'review_requested':
				text = 'Review requested';
				break;
			case 'security_alert':
				text = 'Security alert';
				break;
			case 'state_change':
				text = 'State changed';
				break;
			case 'subscribed':
				text = 'Subscribed';
				break;
			case 'team_mention':
				text = 'Team mentioned';
				break;
			default:
				text = 'Unknown';
				break;
		}
		return {
			text,
			active,
			onToggle(active) {
				$settings.notificationReasons[key] = active;
			}
		};
	}) satisfies TooltipContent;
</script>

<h3>General</h3>
<Switch
	label="Activate push notifications (only on desktop app)"
	bind:active={$settings.activateNotifications}
/>
<Tooltip content={reasons} position="bottom left">
	<Button small>Push notification reasons</Button>
</Tooltip>
<Switch label="Show Notifications Sync Timer" bind:active={$settings.showNotificationsSyncTimer} />
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
<Switch label="Hide sidebar" bind:active={$settings.sidebarHidden} />
<InlineSelect
	label="Notification axis"
	options={axisOptions}
	bind:value={$settings.notificationAxis}
/>
