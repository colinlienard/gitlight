export type GitlabUser = {
	id: number;
	name: string;
	username: string;
	avatar_url: string;
};

export type GitlabEvent = {
	id: number;
	action_name: 'opened' | 'closed' | 'merged' | 'commented_on';
	author: GitlabUser;
	created_at: string;
} & {
	action_name: 'pushed new';
	push_data: {
		commit_count: number;
		commit_title: string;
	};
};
