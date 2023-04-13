import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `
          @use 'sass:color';
          @use "~/styles/mixins";
          @use "~/styles/typography";
          @use "~/styles/variables";
        `
			}
		}
	},
	define: {
		__APP_VERSION__: JSON.stringify(process.env.npm_package_version)
	}
});
