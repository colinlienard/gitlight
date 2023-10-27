export function openDesktopApp({
	githubAccessToken,
	gitlabAccessToken,
	gitlabRefreshToken,
	gitlabExpiresIn
}: {
	githubAccessToken?: string | null;
	gitlabAccessToken?: string | null;
	gitlabRefreshToken?: string | null;
	gitlabExpiresIn?: string | null;
}) {
	const searchParams = new URLSearchParams();
	if (githubAccessToken) {
		searchParams.set('github_access_token', githubAccessToken);
	}
	if (gitlabAccessToken && gitlabRefreshToken && gitlabExpiresIn) {
		searchParams.set('gitlab_access_token', gitlabAccessToken);
		searchParams.set('gitlab_refresh_token', gitlabRefreshToken);
		searchParams.set('gitlab_expires_in', gitlabExpiresIn);
	}
	[];
	window.location.href = `gitlight://${searchParams.toString()}`;
}
