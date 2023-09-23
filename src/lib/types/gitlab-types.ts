export type GitlabUser = {
	id: number;
	name: string;
	username: string;
	avatar_url: string;
};

export type GitlabMergeRequest = {
	id: number;
	iid: number;
	title: string;
	description: string;
	state: 'opened' | 'closed' | 'merged';
	created_at: string;
	updated_at: string;
	source_branch: string;
	draft: boolean;
	author: GitlabUser;
	web_url: string;
	labels: string[];
};

export type GitlabEvent = {
	id: number;
	author: GitlabUser;
	created_at: string;
} & (
	| {
			action_name: 'pushed new' | 'pushed to';
			push_data: {
				action: 'created' | 'pushed';
				commit_count: number;
				commit_title: string;
				ref: string;
			};
	  }
	| {
			action_name: 'created';
	  }
	| {
			action_name: 'opened';
			target_iid: number;
			target_title: string;
			target_type: 'MergeRequest' | 'Issue';
	  }
	| {
			action_name: 'closed';
	  }
	| {
			action_name: 'merged';
	  }
	| {
			action_name: 'commented on';
			note: {
				body: string;
				noteable_type: 'MergeRequest' | 'Issue';
			};
	  }
);
