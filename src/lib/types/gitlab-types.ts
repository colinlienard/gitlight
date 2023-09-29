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

export type GitlabIssue = {
	id: number;
	iid: number;
	title: string;
	description: string;
	state: 'opened' | 'closed';
	created_at: string;
	updated_at: string;
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
			target_id: null;
			target_iid: null;
			push_data: {
				action: 'created' | 'pushed';
				commit_count: number;
				commit_title: string;
				ref: string;
			};
	  }
	| {
			action_name: 'created';
			target_id: number;
			target_iid: number;
	  }
	| {
			action_name: 'opened';
			target_id: number;
			target_iid: number;
			target_title: string;
			target_type: 'MergeRequest' | 'Issue';
	  }
	| {
			action_name: 'closed';
			target_id: number;
			target_iid: number;
	  }
	| {
			action_name: 'merged';
			target_id: number;
			target_iid: number;
	  }
	| {
			action_name: 'commented on';
			target_id: number;
			target_iid: number;
			note: {
				body: string;
				noteable_id: number;
				noteable_iid: number;
				noteable_type: 'MergeRequest' | 'Issue';
			};
	  }
);
