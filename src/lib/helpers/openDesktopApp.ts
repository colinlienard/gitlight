export function openDesktopApp({
	githubAccessToken,
	gitlabAccessToken,
	gitlabRefreshToken,
	gitlabExpiration
}: {
	githubAccessToken: string | null;
	gitlabAccessToken: string | null;
	gitlabRefreshToken: string | null;
	gitlabExpiration: string | null;
}) {
	const searchParams = new URLSearchParams();
	if (githubAccessToken) {
		searchParams.set('github_access_token', githubAccessToken);
	}
	if (gitlabAccessToken && gitlabRefreshToken && gitlabExpiration) {
		searchParams.set('gitlab_access_token', gitlabAccessToken);
		searchParams.set('gitlab_refresh_token', gitlabRefreshToken);
		searchParams.set('gitlab_expiration', gitlabExpiration);
	}
	[];
	window.location.href = `gitlight://${searchParams.toString()}`;
}
