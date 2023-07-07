<script lang="ts">
	import { getAppVersion } from '~/lib/helpers';
</script>

<footer class="footer">
	<p class="text">v{getAppVersion()} • Made by Colin Lienard</p>
</footer>

<style lang="scss">
	.footer {
		position: absolute;
		color: variables.$grey-4;
		inset: auto auto 2rem;
		text-align: center;
	}
</style>
