export type TNotification = {
	repository: {
		full_name: string;
	};
	subject: {
		title: string;
		type: 'PullRequest' | 'Issue' | 'Commit';
		url: string;
	};
	unread: boolean;
	updated_at: string;
};

export type TNotificationData = {
	author: {
		avatar_url: string;
		login: string;
	};
	commit: {
		message: string;
	};
};
