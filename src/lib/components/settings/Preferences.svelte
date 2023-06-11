<script lang="ts">
	import { InlineSelect, Switch } from '~/lib/components';
	import { settings } from '~/lib/stores';
	import type { Settings } from '~/lib/types';

	const options: Array<Settings['notificationAxis']> = ['Auto', 'Vertical', 'Horizontal'];
</script>

<h3>General</h3>
<Switch
	label="Activate push notifications (only on desktop app)"
	bind:active={$settings.activateNotifications}
/>
<Switch
	label="Mark an event as read when opening in the browser"
	bind:active={$settings.readWhenOpenInBrowser}
/>
<Switch label="Mark an event as read when pinned" bind:active={$settings.readWhenPin} />
<span />
<h3>Interface</h3>
<Switch label="Hide sidebar" bind:active={$settings.sidebarHidden} />
<InlineSelect label="Notification axis" {options} bind:value={$settings.notificationAxis} />
