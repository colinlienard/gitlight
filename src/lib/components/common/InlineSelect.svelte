<script lang="ts">
	// todo: silence until support is added
	// https://github.com/sveltejs/svelte-eslint-parser/issues/306
	type T = $$Generic<string | number>; // eslint-disable-line no-undef
	export let label: string;
	export let options: T[];
	export let value: T;

	const width = 100 / options.length;
	$: index = options.findIndex((option) => option === value);
</script>

<div class="inline-select">
	<p class="label">{label}</p>
	<ul class="list">
		{#each options as option}
			<li class="item">
				<button
					class="button"
					class:selected={value === option}
					on:click={() => (value = option)}
					type="button"
				>
					{option}
				</button>
			</li>
		{/each}
		<li
			class="indicator"
			style:width={`calc(${width}% - 0.5rem)`}
			style:left={`${width * index}%`}
		/>
	</ul>
</div>

<style lang="scss">
	.inline-select {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;

		.list {
			position: relative;
			display: flex;
			align-items: center;
			border-radius: variables.$radius;
			background-color: variables.$grey-2;
			isolation: isolate;

			.item {
				width: 100%;

				.button {
					width: 100%;
					padding: 0.75rem;
					color: variables.$grey-4;

					&.selected,
					&:hover {
						color: variables.$white;
					}

					&.selected {
						pointer-events: none;
					}
				}
			}

			.indicator {
				@include mixins.shiny(variables.$grey-3);

				position: absolute;
				z-index: -1;
				height: calc(100% - 0.5rem);
				pointer-events: none;
				transition: left 0.3s ease-in-out;
				translate: 0.25rem 0;
			}
		}
	}
</style>
