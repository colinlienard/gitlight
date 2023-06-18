<script lang="ts">
	import { Gear } from '~/lib/icons';
	import { Tooltip } from '~/lib/components';

	export let items: { active: boolean }[];
	export let title: string;

	$: mostAreSelected = items.filter((filter) => filter.active).length > items.length / 2;

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
				{ text: 'Lorem ipsum dolor sit amet', disabled: true },
				{ text: 'Select all', click: changeSelectAll(true), disabled: mostAreSelected },
				{ text: 'Deselect all', click: changeSelectAll(false), disabled: !mostAreSelected }
			]}
			position="bottom right"
		>
			<Gear />
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

		:global(svg) {
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
