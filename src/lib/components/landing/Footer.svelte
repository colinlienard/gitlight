<script>
	import { getAppVersion } from '~/lib/helpers';
</script>

<footer class="footer">
	<p class="text">v{getAppVersion()} • Made by Colin Lienard</p>
</footer>

<style lang="scss">
	.footer {
		position: absolute;
		inset: auto auto 2rem;
		text-align: center;
		color: variables.$grey-4;
	}
</style>
