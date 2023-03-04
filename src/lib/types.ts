export type TNotificationType = 'PullRequest' | 'Issue' | 'Commit' | 'Release';

export type TNotification = {
	repository: {
		full_name: string;
	};
	subject: {
		title: string;
		type: TNotificationType;
		url: string;
	};
	unread: boolean;
	updated_at: string;
};

export type TUser = {
	avatar_url: string;
	login: string;
};

export type TPullRequestLabel = {
	color: string;
	name: string;
};

export type TNotificationCommit = {
	author: TUser;
	commit: {
		message: string;
	};
};

export type TNotificationIssue = unknown;

export type TNotificationPullRequest = {
	labels: TPullRequestLabel[];
	merged: boolean;
	number: number;
	state: 'open' | 'closed';
	title: string;
	user: TUser;
};

export type TNotificationRelease = {
	author: TUser;
	name: string;
	prerelease: boolean;
	tag_name: string;
};
