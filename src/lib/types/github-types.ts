export type GithubLabel = {
	color: string;
	name: string;
};

export type GithubUser = {
	avatar_url: string;
	display_login: string;
	login: string;
	name: string;
	url: string;
};

export type GithubRepository = {
	id: number;
	full_name: string;
	owner: GithubUser;
};

export type GithubIssue = {
	number: number;
	title: string;
	url: string;
	state: 'open' | 'closed';
	state_reason: 'completed' | 'not_planned' | 'reopened' | null;
	created_at: string;
	closed_at: string | null;
	closed_by?: GithubUser;
	user: GithubUser;
	labels: GithubLabel[];
	html_url: string;
	comments: number;
	comments_url: string;
};

export type GithubPullRequest = GithubIssue & {
	merged: boolean;
	merged_at: string | null;
	merged_by?: GithubUser;
	draft: boolean;
};

export type GithubCommit = {
	sha: string;
	url: string;
	message: string;
	author: GithubUser;
	distinct: boolean;
	html_url: string;
};

export type GithubComment = {
	body: string;
	html_url: string;
	user: GithubUser;
};

export type GithubRelease = {
	author: GithubUser;
	tag_name: string;
	name: string;
	body: string;
	draft: boolean;
	prerelease: boolean;
	html_url: string;
	assets: Array<{
		name: string;
		browser_download_url: string;
	}>;
	published_at: string;
};

export type GithubItem = GithubIssue | GithubRepository | GithubCommit | GithubRelease;

export type GithubNotificationType =
	| 'PullRequest'
	| 'Issue'
	| 'Commit'
	| 'Release'
	| 'Discussion'
	| 'CheckSuite';

export type GithubNotification = {
	id: string;
	reason:
		| 'assign'
		| 'author'
		| 'comment'
		| 'ci_activity'
		| 'invitation'
		| 'manual'
		| 'mention'
		| 'review_requested'
		| 'security_alert'
		| 'state_change'
		| 'subscribed'
		| 'team_mention';
	repository: GithubRepository;
	subject: {
		latest_comment_url: string | null;
		title: string;
		type: GithubNotificationType;
		url: string | null;
	};
	unread: boolean;
	updated_at: string;
};
