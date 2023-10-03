export type GitlabUser = {
	id: number;
	name: string;
	username: string;
	avatar_url: string;
};

export type GitlabBaseItem = {
	id: number;
	iid: number;
	title: string;
	description: string;
	created_at: string;
	updated_at: string;
	web_url: string;
	author: GitlabUser;
	labels: string[];
};

export type GitlabIssue = GitlabBaseItem & {
	state: 'opened' | 'closed';
};

export type GitlabMergeRequest = GitlabBaseItem & {
	state: 'opened' | 'closed' | 'merged';
	source_branch: string;
	draft: boolean;
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
			target_type: null;
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
			target_type: null;
	  }
	| {
			action_name: 'opened';
			target_id: number;
			target_iid: number;
			target_type: 'MergeRequest' | 'Issue';
			target_title: string;
	  }
	| {
			action_name: 'closed';
			target_id: number;
			target_iid: number;
			target_type: 'MergeRequest' | 'Issue';
			target_title: string;
	  }
	| {
			action_name: 'accepted';
			target_id: number;
			target_iid: number;
			target_type: null;
	  }
	| {
			action_name: 'deleted';
			target_id: number;
			target_iid: number;
			target_type: null;
	  }
	| {
			action_name: 'commented on';
			target_id: number;
			target_iid: number;
			target_type: 'Note';
			note: {
				body: string;
				noteable_id: number;
				noteable_iid: number;
				noteable_type: 'MergeRequest' | 'Issue';
			};
	  }
);
