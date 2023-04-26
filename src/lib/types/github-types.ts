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
};

export type GithubIssue = {
	number: number;
	title: string;
	url: string;
	state: 'open' | 'closed';
	state_reason: 'completed' | 'not_planned' | 'reopened' | null;
	user: GithubUser;
	labels: GithubLabel[];
	html_url: string;
};

export type GithubPullRequest = GithubIssue & {
	merged: boolean;
	merged_at: string | null;
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
};

export type GithubItem = GithubIssue | GithubRepository | GithubCommit | GithubRelease;

export type GithubNotificationType = 'PullRequest' | 'Issue' | 'Commit' | 'Release' | 'Discussion';

export type GithubNotification = {
	id: string;
	reason: string; // TODO
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

// TODO: Delete the following

type GithubEventCommon = {
	actor: GithubUser;
	created_at: string;
	id: string;
	repo: {
		name: string;
		url: string;
	};
};

export type GithubEvent = (
	| {
			type: 'CommitCommentEvent';
			payload: {
				action: 'created';
				comment: GithubComment;
			};
	  }
	| {
			type: 'CreateEvent';
			payload: {
				ref: string;
				ref_type: 'branch' | 'tag' | 'repository';
				master_branch: string;
				description: string;
			};
	  }
	| {
			type: 'DeleteEvent';
			payload: {
				ref: string;
				ref_type: 'branch' | 'tag';
			};
	  }
	| {
			type: 'ForkEvent';
			payload: {
				forkee: GithubRepository;
			};
	  }
	| {
			type: 'GollumEvent';
			payload: {
				pages: {
					page_name: string;
					title: string;
					action: 'created' | 'edited';
					sha: string;
					html_url: string;
				}[];
			};
	  }
	| {
			type: 'IssueCommentEvent';
			payload: {
				action: 'created' | 'edited' | 'deleted';
				changes: {
					body: {
						from: string;
					};
				};
				issue: GithubIssue;
				comment: GithubComment;
			};
	  }
	| {
			type: 'IssuesEvent';
			payload: {
				action:
					| 'opened'
					| 'edited'
					| 'closed'
					| 'reopened'
					| 'assigned'
					| 'unassigned'
					| 'labeled'
					| 'unlabeled';
				issue: GithubIssue;
				changes: {
					title: {
						from: string;
					};
					body: {
						from: string;
					};
				};
				assignee?: GithubUser;
				label?: GithubLabel;
			};
	  }
	| {
			type: 'MemberEvent';
			payload: {
				action: 'added' | 'deleted';
				member: GithubUser;
				changes: {
					old_permission: {
						from: string;
					};
				};
			};
	  }
	| {
			type: 'PublicEvent';
			payload: Record<string, never>;
	  }
	| {
			type: 'PullRequestEvent';
			payload: {
				action:
					| 'opened'
					| 'edited'
					| 'closed'
					| 'reopened'
					| 'assigned'
					| 'unassigned'
					| 'review_requested'
					| 'review_request_removed'
					| 'labeled'
					| 'unlabeled'
					| 'synchronize';
				number: number;
				changes: {
					title: {
						from: string;
					};
					body: {
						from: string;
					};
				};
				pull_request: GithubPullRequest;
				reason: string;
			};
	  }
	| {
			type: 'PullRequestReviewEvent';
			payload: {
				action: 'created';
				pull_request: GithubPullRequest;
				review: {
					state: 'approved' | 'changes_requested' | 'commented';
					body: string;
					html_url: string;
					user: GithubUser;
				};
			};
	  }
	| {
			type: 'PullRequestReviewCommentEvent';
			payload: {
				action: 'created';
				changes: {
					body: {
						from: string;
					};
				};
				pull_request: GithubPullRequest;
				comment: GithubComment;
			};
	  }
	| {
			type: 'PullRequestReviewThreadEvent';
			payload: {
				action: 'resolved' | 'unresolved';
				pull_request: GithubPullRequest;
				thread: unknown;
			};
	  }
	| {
			type: 'PushEvent';
			payload: {
				push_id: number;
				size: number;
				distinct_size: number;
				ref: string;
				head: string;
				before: string;
				commits: GithubCommit[];
			};
	  }
	| {
			type: 'ReleaseEvent';
			payload: {
				action: 'published';
				changes: {
					body: {
						from: string;
					};
					name: {
						from: string;
					};
				};
				release: GithubRelease;
			};
	  }
	| {
			type: 'SponsorshipEvent';
			payload: {
				action: 'created';
				effective_date: string;
				changes: {
					tier: {
						from: string;
					};
					privacy_level: {
						from: string;
					};
				};
			};
	  }
	| {
			type: 'WatchEvent';
			payload: {
				action: 'started';
			};
	  }
) &
	GithubEventCommon;
