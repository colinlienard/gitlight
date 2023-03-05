import type { Session } from '@auth/core/types';

export type TSession = Session & { accessToken: string };

export type TNotificationType = 'PullRequest' | 'Issue' | 'Commit' | 'Release' | 'Discussion';

export type TNotification = {
	repository: {
		full_name: string;
	};
	subject: {
		title: string;
		type: TNotificationType;
		url: string | null;
	};
	unread: boolean;
	updated_at: string;
};

export type TUser = {
	avatar_url: string;
	login: string;
};

export type TPullRequestLabels = {
	color: string;
	name: string;
}[];

export type TNotificationCommit = {
	author: TUser;
	commit: {
		message: string;
	};
};

export type TNotificationIssue = {
	labels: TPullRequestLabels;
	number: number;
	state: 'open' | 'closed';
	state_reason: 'completed' | null;
	user: TUser;
};

export type TNotificationPullRequest = {
	labels: TPullRequestLabels;
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
