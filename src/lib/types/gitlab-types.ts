export type GitlabUser = {
	id: number;
	name: string;
	username: string;
	avatar_url: string;
};

export type GitlabRepository = {
	id: number;
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
	user_notes_count: number;
};

export type GitlabIssue = GitlabBaseItem & {
	state: 'opened' | 'closed';
};

export type GitlabMergeRequest = GitlabBaseItem & {
	state: 'opened' | 'closed' | 'merged';
	source_branch: string;
	draft: boolean;
	reviewers: GitlabUser[];
	assignees: GitlabUser[];
	upvotes: number;
	downvotes: number;
};

export type GitlabEvent = {
	id: number;
	author: GitlabUser;
	created_at: string;
	project_id: number;
} & (
	| {
			action_name: 'pushed new' | 'pushed to';
			target_id: null;
			target_iid: null;
			target_type: null;
			push_data: {
				action: 'created' | 'pushed';
				commit_count: number;
				commit_title: string | null;
				ref: string;
				ref_type: 'branch' | 'tag';
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
			target_type: 'MergeRequest' | 'Issue' | 'Milestone';
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
			action_name: 'joined';
			target_id: number;
			target_iid: number;
			target_type: null;
	  }
	| {
			action_name: 'approved';
			target_id: number;
			target_iid: number;
			target_type: 'MergeRequest';
	  }
	| {
			action_name: 'commented on';
			target_id: number;
			target_iid: number;
			target_type: 'Note' | 'DiffNote' | 'DiscussionNote';
			note: {
				body: string;
				noteable_id: number;
				noteable_iid: number;
				noteable_type: 'MergeRequest' | 'Issue';
			};
	  }
);

export type GitlabLabel = {
	name: string;
	color: string;
};
