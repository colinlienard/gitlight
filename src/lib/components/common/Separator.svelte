<script lang="ts">
	export let vertical = false;
	export let marginX = 0;
	export let marginY = 0;
</script>

<div
	class="separator"
	class:vertical
	style:margin={vertical ? `${marginX}rem ${marginY}rem` : `${marginY}rem ${marginX}rem`}
/>

<style lang="scss">
	.separator {
		position: relative;
		flex: 0 0 1px;

		&.vertical {
			background-image: linear-gradient(variables.$grey-3 50%, rgba(255, 255, 255, 0) 0%);
			background-size: 1px 1.5rem;
			height: 100%;
		}

		&:not(.vertical) {
			background-image: linear-gradient(to right, variables.$grey-3 50%, rgba(255, 255, 255, 0) 0%);
			background-size: 1.5rem 1px;
		}
	}
</style>
