export function openDesktopApp({
	githubAccessToken,
	gitlabAccessToken,
	gitlabRefreshToken,
	gitlabExpiresIn,
	gitlabUrl,
	gitlabPat
}: {
	githubAccessToken?: string | null;
	gitlabAccessToken?: string | null;
	gitlabRefreshToken?: string | null;
	gitlabExpiresIn?: string | null;
	gitlabUrl?: string | null;
	gitlabPat?: string | null;
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
	if (gitlabUrl && gitlabPat) {
		searchParams.set('gitlab_url', gitlabUrl);
		searchParams.set('gitlab_pat', gitlabPat);
	}
	window.location.href = `gitlight://${searchParams.toString()}`;
}
