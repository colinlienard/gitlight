export type TGithubLabel = {
	color: string;
	name: string;
};

export type TGithubUser = {
	avatar_url: string;
	display_login: string;
	login: string;
	url: string;
};

export type TGithubRepository = {
	full_name: string;
};

export type TGithubIssue = {
	number: number;
	title: string;
	url: string;
	state: 'open' | 'closed';
	user: TGithubUser;
	labels: TGithubLabel[];
	html_url: string;
};

export type TGithubPullRequest = TGithubIssue & {
	merged_at: string | null;
};

export type TGithubCommit = {
	sha: string;
	url: string;
	message: string;
	author: TGithubUser;
	distinct: boolean;
};

export type TGithubComment = {
	body: string;
	html_url: string;
	user: TGithubUser;
};

export type TGithubRelease = {
	tag_name: string;
	name: string;
	body: string;
	draft: boolean;
	prerelease: boolean;
};

type TGithubEventCommon = {
	actor: TGithubUser;
	created_at: string;
	id: string;
	repo: {
		name: string;
		url: string;
	};
};

export type TGithubEvent = (
	| {
			type: 'CommitCommentEvent';
			payload: {
				action: 'created';
				comment: TGithubComment;
			};
	  }
	| {
			type: 'CreateEvent';
			payload: {
				ref: string;
				ref_type: 'branch' | 'tag';
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
				forkee: TGithubRepository;
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
				issue: TGithubIssue;
				comment: TGithubComment;
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
				issue: TGithubIssue;
				changes: {
					title: {
						from: string;
					};
					body: {
						from: string;
					};
				};
				assignee?: TGithubUser;
				label?: TGithubLabel;
			};
	  }
	| {
			type: 'MemberEvent';
			payload: {
				action: 'added' | 'deleted';
				member: TGithubUser;
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
				pull_request: TGithubPullRequest;
				reason: string;
			};
	  }
	| {
			type: 'PullRequestReviewEvent';
			payload: {
				action: 'created';
				pull_request: TGithubPullRequest;
				review: any;
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
				pull_request: TGithubPullRequest;
				comment: TGithubComment;
			};
	  }
	| {
			type: 'PullRequestReviewThreadEvent';
			payload: {
				action: 'resolved' | 'unresolved';
				pull_request: TGithubPullRequest;
				thread: any;
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
				commits: TGithubCommit[];
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
				release: TGithubRelease;
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
	TGithubEventCommon;
