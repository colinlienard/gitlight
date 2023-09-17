export type GitlabUser = {
	id: number;
	name: string;
	username: string;
	avatar_url: string;
};

export type GitlabEvent = {
	id: number;
	author: GitlabUser;
	created_at: string;
} & (
	| {
			action_name: 'pushed new' | 'pushed to';
			push_data: {
				commit_count: number;
				commit_title: string;
			};
	  }
	| {
			action_name: 'created';
			push_data: unknown;
	  }
	| {
			action_name: 'opened';
			push_data: unknown;
			target_title: string;
			target_type: 'MergeRequest' | 'Issue';
	  }
	| {
			action_name: 'closed';
			push_data: unknown;
	  }
	| {
			action_name: 'merged';
			push_data: unknown;
	  }
	| {
			action_name: 'commented_on';
			push_data: unknown;
	  }
);
