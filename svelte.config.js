import staticAdapter from '@sveltejs/adapter-static';
import vercelAdapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter:
			process.env.APP_ENV === 'vercel' ? vercelAdapter() : staticAdapter({ fallback: '200.html' }),
		alias: {
			'~': './src'
		}
	}
};

export default config;
