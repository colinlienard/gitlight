<script lang="ts">
	import { Tooltip, type TooltipContent } from '$lib/components';
	import { GearIcon } from '$lib/icons';

	export let items: { active: boolean }[];
	export let title: string;
	export let description: string;
	export let actions: TooltipContent = [];
	export let zIndex = 1;
	export let first = false;

	$: activeLenght = items.filter((filter) => filter.active).length;

	function changeSelectAll(active: boolean) {
		return () => {
			items = items.map((item) => ({ ...item, active }));
		};
	}
</script>

<div class="section" style:z-index={zIndex} class:first>
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
			<button class="icon-container">
				<GearIcon />
			</button>
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
		padding: 1.5rem 1rem;
		gap: 1rem;

		&:not(.first) {
			border-top: 1px solid variables.$bg-3;
		}

		&:not(:hover) .icon-container {
			opacity: 0;
		}
	}

	.row {
		z-index: 1;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;

		.title {
			@include typography.bold;
			@include typography.small;

			color: variables.$bg-4;
		}

		.icon-container :global(svg) {
			height: 1rem;
			color: variables.$bg-4;

			&:hover {
				color: variables.$bg-5;
				rotate: 60deg;
			}
		}
	}

	.wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
</style>
