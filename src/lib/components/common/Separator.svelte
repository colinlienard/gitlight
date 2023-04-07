<script lang="ts">
	export let vertical = false;
	export let margin = 0;
</script>

<div
	class="separator"
	class:vertical
	style:margin={vertical ? `0 ${margin}rem` : `${margin}rem 0`}
/>

<style lang="scss">
	.separator {
		background-color: variables.$grey-3;
		position: relative;
		flex: 0 0 1px;

		&::before {
			content: '';
			position: absolute;
			border: none;
		}

		&.vertical {
			height: 100%;

			&::before {
				height: 100%;
				border-right: 0.5rem dashed variables.$grey-1;
			}
		}

		&:not(.vertical) {
			width: 100%;

			&::before {
				width: 100%;
				border-bottom: 0.5rem dashed variables.$grey-1;
			}
		}
	}
</style>
