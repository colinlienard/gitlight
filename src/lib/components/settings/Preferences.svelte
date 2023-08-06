<script lang="ts">
	import { InlineSelect, Switch } from '~/lib/components';
	import { settings } from '~/lib/stores';
	import type { Settings } from '~/lib/types';

	const axisOptions: Array<Settings['notificationAxis']> = ['Auto', 'Vertical', 'Horizontal'];
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
	label="Send push notifications for which you are the author"
	bind:active={$settings.pushNotificationFromUser}
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
<Switch label="Hide sidebar" bind:active={$settings.sidebarHidden} />
<Switch label="Show notifications sync timer" bind:active={$settings.showNotificationsSyncTimer} />
<Switch
	label="Show notifications owner and repository"
	bind:active={$settings.showNotificationsRepo}
/>
<InlineSelect
	label="Notification axis"
	options={axisOptions}
	bind:value={$settings.notificationAxis}
/>
