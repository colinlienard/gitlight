import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
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
	},
	preview: {
		port: 5173
	}
});
