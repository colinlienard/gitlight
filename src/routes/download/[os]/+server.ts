import { redirect } from '@sveltejs/kit';
import type { GithubRelease } from '~/lib/types/github-types.js';

export async function GET({ params }) {
	async function getDownloadUrl(os: '.aarch64.dmg' | '.x64.dmg' | '.msi' | '.AppImage') {
		const response = await fetch('https://api.github.com/repos/colinlienard/gitlight/releases');
		const data = (await response.json()) as GithubRelease[];
		const { assets } = data[0];
		return assets.find(({ name }) => name.endsWith(os))?.browser_download_url as string;
	}

	switch (params.os) {
		case 'apple-silicon':
			throw redirect(302, await getDownloadUrl('.aarch64.dmg'));

		case 'mac-intel':
			throw redirect(302, await getDownloadUrl('.x64.dmg'));

		case 'windows':
			throw redirect(302, await getDownloadUrl('.msi'));

		case 'linux':
			throw redirect(302, await getDownloadUrl('.AppImage'));

		default:
			return new Response('Not found', { status: 404 });
	}
}
