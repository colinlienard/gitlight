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
			width: 100%;
		}
	}
</style>
