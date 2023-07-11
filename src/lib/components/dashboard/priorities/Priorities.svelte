<script>
	import {
		Button,
		IconButton,
		Modal,
		ScrollbarContainer,
		Separator,
		Switch,
		Tooltip
	} from '~/lib/components';
	import { PlusIcon, PriorityIcon } from '~/lib/icons';
	import { settings } from '~/lib/stores';
</script>

<Modal title="Priorities">
	<Tooltip slot="trigger" content="Priorities" hover position="bottom">
		<IconButton large rounded>
			<PriorityIcon />
		</IconButton>
	</Tooltip>

	<ScrollbarContainer slot="content" margin="2rem 1rem">
		<div class="content">
			<Switch label="Enable priority sorting" bind:active={$settings.prioritySorting} />
			<p class="paragraph">
				By enabling priority sorting and specifying priority criteria, you can customize the
				importance of notifications and manage them in your own way.
			</p>
			<div class="buttons">
				<Button small>Reset to default</Button>
				<Button type="secondary" small>Clear</Button>
			</div>
			<Separator marginY={1} />
			<Button type="secondary">
				<PlusIcon />
				Add a new priority criteria
			</Button>
		</div>
	</ScrollbarContainer>
</Modal>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		padding: 2rem;
		gap: 1rem;
	}

	.paragraph {
		@include typography.base;

		color: variables.$grey-4;
	}

	.buttons {
		display: flex;
		gap: 1rem;
	}
</style>
