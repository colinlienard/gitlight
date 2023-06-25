<script lang="ts">
	import { GearIcon } from '~/lib/icons';
	import { Tooltip, type TooltipContent } from '~/lib/components';

	export let items: { active: boolean }[];
	export let title: string;
	export let description: string;
	export let actions: TooltipContent = [];

	$: activeLenght = items.filter((filter) => filter.active).length;

	function changeSelectAll(active: boolean) {
		return () => {
			items = items.map((item) => ({ ...item, active }));
		};
	}
</script>

<div class="section">
	<div class="row">
		<h2 class="title">{title}</h2>
		<Tooltip
			content={[
				{ text: description, disabled: true },
				{
					text: 'Select all',
					onClick: changeSelectAll(true),
					disabled: activeLenght === items.length
				},
				{ text: 'Deselect all', onClick: changeSelectAll(false), disabled: activeLenght === 0 },
				...actions
			]}
			position="bottom right"
			width="14rem"
		>
			<div class="icon-container">
				<GearIcon />
			</div>
		</Tooltip>
	</div>
	<div class="wrapper">
		<slot />
	</div>
</div>

<style lang="scss">
	.section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.row {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		z-index: 1;

		.title {
			@include typography.bold;
		}

		.icon-container :global(svg) {
			height: 1.25rem;

			&:hover {
				rotate: 60deg;
				transition: rotate 0.3s ease-in-out;
			}
		}
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
