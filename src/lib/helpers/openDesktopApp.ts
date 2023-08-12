export function openDesktopApp({
	githubAccessToken,
	gitlabAccessToken
}: {
	githubAccessToken?: string | null;
	gitlabAccessToken?: string | null;
}) {
	if (githubAccessToken || gitlabAccessToken) {
		window.location.href = `gitlight://github_access_token=${
			githubAccessToken || ''
		}&gitlab_access_token=${gitlabAccessToken || ''}`;
	}
}
