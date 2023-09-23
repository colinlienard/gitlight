<script lang="ts">
	import { Tooltip, type TooltipContent } from '$lib/components';
	import { GearIcon } from '$lib/icons';

	export let items: { active: boolean }[];
	export let title: string;
	export let description: string;
	export let actions: TooltipContent = [];
	export let zIndex = 1;

	$: activeLenght = items.filter((filter) => filter.active).length;

	function changeSelectAll(active: boolean) {
		return () => {
			items = items.map((item) => ({ ...item, active }));
		};
	}
</script>

<div class="section" style:z-index={zIndex}>
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
		gap: 1rem;
	}

	.row {
		z-index: 1;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;

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
