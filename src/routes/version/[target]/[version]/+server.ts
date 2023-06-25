import type { GithubRelease } from '~/lib/types/github-types.js';

export async function GET({ params }) {
	try {
		const { version } = params;

		// Get latest release from Github
		const response = await fetch('https://api.github.com/repos/colinlienard/gitlight/releases');
		const data = (await response.json()) as GithubRelease[];
		const { assets, tag_name } = data[0];
		const latestVersion = tag_name.split('v')[1];

		if (version === latestVersion) throw new Error();

		// Get latest.json
		const json = assets.find(({ name }) => name === 'latest.json');

		if (!json) throw new Error();

		// Return latest.json content
		const jsonResponse = await fetch(json.browser_download_url);
		const jsonData = await jsonResponse.text();
		return new Response(jsonData, { status: 200 });
	} catch {
		return new Response(null, { status: 204 });
	}
}
