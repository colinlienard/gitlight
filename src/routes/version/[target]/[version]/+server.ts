import type { GithubRelease } from '~/lib/types/github-types.js';

type Target = 'linux' | 'windows' | 'darwin';

type MacosArch = 'aarch64' | 'x86_64' | undefined;

const targetExtensions: Record<Target, string> = {
	linux: '.AppImage.tar.gz',
	windows: '.msi.zip',
	darwin: '.app.tar.gz'
};

export async function GET({ params, url }) {
	try {
		const target = params.target as Target;
		const { version } = params;
		const arch = url.searchParams.get('arch') as MacosArch;
		console.log('arch', arch);

		// Get latest release from Github
		const response = await fetch('https://api.github.com/repos/colinlienard/gitlight/releases');
		const data = (await response.json()) as GithubRelease[];
		const { assets, published_at, body, tag_name } = data[0];
		const latestVersion = tag_name.split('v')[1];

		if (version === latestVersion) throw new Error();

		const extension = targetExtensions[target];

		if (!extension) throw new Error();

		// Get the asset and its signature file
		const updaterAsset = assets.find(({ name }) => name.endsWith(extension));
		const signatureAsset = assets.find(({ name }) => name.endsWith(`${extension}.sig`));

		if (!updaterAsset || !signatureAsset) throw new Error();

		// Get the signature from the .sig file
		const signatureResponse = await fetch(signatureAsset.browser_download_url);
		const signature = await signatureResponse.text();

		const returnValue = {
			url: updaterAsset.browser_download_url,
			version: latestVersion,
			notes: body,
			pub_date: published_at,
			signature
		};

		return new Response(JSON.stringify(returnValue), { status: 200 });
	} catch {
		return new Response(null, { status: 204 });
	}
}
