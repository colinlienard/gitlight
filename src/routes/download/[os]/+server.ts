import { redirect } from '@sveltejs/kit';
import type { GithubRelease } from '$lib/types';

export async function GET({ params }) {
	async function getDownloadUrl(os: 'aarch64.dmg' | 'x64.dmg' | '.msi' | '.AppImage') {
		const response = await fetch('https://api.github.com/repos/colinlienard/gitlight/releases');
		const data = (await response.json()) as GithubRelease[];
		const { assets } = data[0];
		return assets.find(({ name }) => name.endsWith(os))?.browser_download_url as string;
	}

	switch (params.os) {
		case 'apple-silicon':
			redirect(302, await getDownloadUrl('aarch64.dmg'));
			break;

		case 'mac-intel':
			redirect(302, await getDownloadUrl('x64.dmg'));
			break;

		case 'windows':
			redirect(302, await getDownloadUrl('.msi'));
			break;

		case 'linux':
			redirect(302, await getDownloadUrl('.AppImage'));
			break;

		default:
			return new Response('Not found', { status: 404 });
	}
}
