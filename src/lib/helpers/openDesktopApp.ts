export function openDesktopApp({
	githubAccessToken,
	gitlabAccessToken
}: {
	githubAccessToken?: string | null;
	gitlabAccessToken?: string | null;
}) {
	const searchParams = new URLSearchParams();
	if (githubAccessToken) {
		searchParams.set('github_access_token', githubAccessToken);
	}
	if (gitlabAccessToken) {
		searchParams.set('gitlab_access_token', gitlabAccessToken);
	}
	window.location.href = `gitlight://${searchParams.toString()}`;
}
