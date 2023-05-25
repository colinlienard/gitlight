<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '~/lib/components';
	import { Modal, Separator, Switch } from '~/lib/components';
	import { Github, Gitlab } from '~/lib/icons';
	import LogOutButton from './LogOutButton.svelte';
	import { onMount } from 'svelte';
	import { settings } from '~/lib/stores';
	import { storage } from '~/lib/helpers';

	let user = $page.data.session?.user;
	let mounted = false;

	onMount(() => {
		const saved = storage.get('settings');
		if (saved) {
			settings.set(saved);
		}
		mounted = true;
	});

	$: if (mounted) {
		storage.set('settings', $settings);
	}
</script>

<Modal title="Settings">
	<button slot="trigger">
		<img class="trigger" src={user?.avatar} alt="" />
	</button>
	<div class="content" slot="content">
		<h3 class="title">Preferences</h3>
		<Switch
			label="Activate push notifications (only on desktop app)"
			bind:active={$settings.activateNotifications}
		/>
		<Switch
			label="Mark an event as read when opening in the browser"
			bind:active={$settings.readWhenOpenInBrowser}
		/>
		<Switch label="Mark an event as read when pinned" bind:active={$settings.readWhenPin} />
		<Separator marginY={1} />
		<h3 class="title">Accounts</h3>
		<ul class="accounts-wrapper">
			<li class="account">
				<div class="header">
					<Github />
					<h4 class="title">GitHub</h4>
				</div>
				<div class="content">
					<figure class="user">
						<img class="image" src={user?.avatar} alt="" />
						<figcaption class="user-info">
							<p class="sub">Logged in as</p>
							<p class="name">{user?.name}</p>
						</figcaption>
					</figure>
					<LogOutButton />
				</div>
			</li>
			<li class="account">
				<div class="header">
					<Gitlab />
					<h4 class="title">GitLab</h4>
				</div>
				<div class="content">
					<p class="sub">Not logged in.</p>
					<Button small disabled>Log in</Button>
				</div>
			</li>
		</ul>
	</div>
</Modal>

<style lang="scss">
	.trigger {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		background-color: variables.$grey-2;
		transition: opacity variables.$transition;

		&:hover {
			opacity: 0.75;
		}
	}

	.content {
		display: flex;
		flex-direction: column;
		gap: 1rem;

		.title {
			@include typography.bold;
		}

		.accounts-wrapper {
			display: grid;
			grid-template-columns: 1fr 1fr;
			gap: 1rem;
		}

		.account {
			@include mixins.shiny(variables.$grey-2, false);
			display: flex;
			flex-direction: column;

			.header {
				padding: 1rem;
				display: flex;
				align-items: center;
				gap: 0.5rem;
				border-bottom: 1px solid variables.$grey-3;

				:global(svg) {
					height: 1.25rem;
				}
			}

			.content {
				padding: 1rem;
				justify-content: space-between;
				height: 100%;
			}

			.user {
				display: flex;
				align-items: center;
				gap: 0.5rem;

				.image {
					width: 2rem;
					height: 2rem;
					border-radius: 50%;
				}

				.user-info {
					display: flex;
					flex-direction: column;
					gap: 0.25rem;
				}
			}

			.sub {
				color: variables.$grey-4;
			}
		}
	}
</style>
