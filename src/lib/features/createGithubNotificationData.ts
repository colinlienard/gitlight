import { page } from '$app/stores';
import { error, githubNotifications, settings } from '$lib/stores';
import type {
	GithubComment,
	GithubCommit,
	GithubIssue,
	GithubItem,
	GithubNotification,
	GithubPullRequest,
	GithubRelease,
	GithubReview,
	NotificationData,
	Priority,
	SavedNotifications,
	User
} from '$lib/types';
import { fetchGithub } from './fetchGithub';
import { getDiscussionUrl } from './getGithubDiscussionData';
import { storage } from './storage';
import { getIssueIcon, getPullRequestIcon } from '../helpers/getIcon';
import { cleanSpecifier, prioritiesLabel } from '../helpers/priorities';
import { removeMarkdownSymbols } from '../helpers/removeMarkdownSymbols';

type PullRequestEvent = {
	author: {
		login: string;
		avatar?: string;
		bot?: boolean;
	};
	description: string;
	time: string;
	url?: string;
};

type FetchOptions = Parameters<typeof fetchGithub>[1];

export async function createGithubNotificationData(
	githubNotification: GithubNotification,
	savedNotifications: SavedNotifications,
	firstTime: boolean
): Promise<NotificationData | null> {
	const { id, repository, subject, unread, updated_at, reason } = githubNotification;
	const previous = savedNotifications.find((n) => n.id === id);
	const status = unread ? 'unread' : previous?.status || 'unread';
	const muted = previous?.muted || false;
	const [owner, name] = repository.full_name.split('/');

	// Get Personal Access Tokens
	let fetchOptions: FetchOptions = {};
	settings.subscribe(({ pats }) => {
		if (!repository.private || !pats.length) return;
		const pat = pats.find((pat) => pat.owner === repository.owner.login);
		if (!pat) return;
		fetchOptions = { pat: pat.token };
	});

	// Fetch additional data
	let data: GithubItem | null = null;
	try {
		data = subject.url ? await fetchGithub<GithubItem>(subject.url, fetchOptions) : null;
	} catch (e) {
		error.set(
			`At least one notification comes from a private repository (${repository.full_name}) for which you have not configured a Personal Access Token. Please go to Settings > Permissions.`
		);
		return null;
	}

	const common = {
		id,
		from: 'github',
		status,
		muted,
		time: updated_at,
		title: subject.title,
		type: subject.type,
		repository: {
			id: repository.id,
			url: repository.full_name,
			owner,
			name,
			domain: 'github.com'
		},
		ownerAvatar: repository.owner.avatar_url
	} as const;
	let value: NotificationData;

	switch (subject.type) {
		case 'Commit': {
			const { author, html_url, commit } = data as GithubCommit;
			value = {
				...common,
				author: author
					? { login: author.login, avatar: author.avatar_url, bot: author.type === 'Bot' }
					: { login: commit.author.name },
				description: '*made a commit*',
				icon: 'commit',
				url: html_url,
				type: 'commit'
			};
			break;
		}

		case 'Issue': {
			const {
				labels,
				number,
				state,
				created_at,
				closed_at,
				closed_by,
				user,
				html_url,
				comments,
				comments_url
			} = data as GithubIssue;

			let author: NotificationData['author'];
			let description: NotificationData['description'] = '';
			let url = html_url;
			if (
				state == 'open' &&
				new Date(common.time).getTime() - new Date(created_at).getTime() < 30000
			) {
				author = { login: user.login, avatar: user.avatar_url, bot: user.type === 'Bot' };
				description = '*opened* this issue';
			} else if (
				state === 'closed' &&
				new Date(common.time).getTime() - new Date(closed_at as string).getTime() < 30000
			) {
				author = closed_by
					? {
							login: closed_by.login,
							avatar: closed_by.avatar_url,
							bot: closed_by.type === 'Bot'
					  }
					: undefined;
				description = '*closed* this issue';
			} else if (comments) {
				const comment = await getLatestComment(comments_url, fetchOptions);
				if (comment) {
					author = comment.author;
					description = comment.description;
					if (comment.url) url = comment.url;
				}
			}

			if ((!firstTime && previous?.description === description) || !description) return null;

			value = {
				...common,
				author,
				creator: { login: user.login, avatar: user.avatar_url, bot: user.type === 'Bot' },
				description,
				icon: getIssueIcon(data as GithubIssue),
				opened: state === 'open',
				number,
				labels,
				url,
				previously:
					previous?.description !== description ? previous : previous?.previously || undefined,
				type: 'issue'
			};
			break;
		}

		case 'PullRequest': {
			const {
				url: apiUrl,
				user,
				merged_by,
				number,
				labels,
				state,
				created_at,
				closed_at,
				html_url,
				comments,
				comments_url,
				review_comments,
				review_comments_url,
				commits,
				commits_url
			} = data as GithubPullRequest;

			const handleReviewRequested = () => {
				githubNotifications.subscribe((notifications) => {
					const current = notifications.find((n) => n.id === id);
					if (current?.priority?.label !== prioritiesLabel['review-request']) {
						author = { login: user.login, avatar: user.avatar_url, bot: user.type === 'Bot' };
						description = '*requested your review*';
					}
				});
			};

			let author: NotificationData['author'];
			let description: NotificationData['description'] = '';
			let url = html_url;
			const time = new Date(common.time).getTime();
			if (
				state == 'open' &&
				time - new Date(created_at).getTime() < 30000 &&
				reason !== 'review_requested'
			) {
				author = { login: user.login, avatar: user.avatar_url, bot: user.type === 'Bot' };
				description = '*opened* this pull request';
			} else if (state === 'closed' && time - new Date(closed_at as string).getTime() < 30000) {
				author = merged_by
					? {
							login: merged_by.login,
							avatar: merged_by.avatar_url,
							bot: merged_by.type === 'Bot'
					  }
					: { login: user.login, avatar: user.avatar_url, bot: user.type === 'Bot' };
				description = `*${merged_by ? 'merged' : 'closed'}* this pull request`;
			} else if (review_comments || comments || commits) {
				const events = await Promise.all([
					review_comments ? getLatestComment(review_comments_url, fetchOptions) : undefined,
					comments ? getLatestComment(comments_url, fetchOptions) : undefined,
					commits ? getLatestCommit(commits_url, fetchOptions) : undefined,
					getLatestReview(apiUrl, fetchOptions)
				]);
				const event = events.reduce<Awaited<ReturnType<typeof getLatestCommit>> | undefined>(
					(previous, current) => {
						if (!current) return previous;
						if (!previous) return current;
						return Math.abs(new Date(current.time).getTime() - time) <
							Math.abs(new Date(previous.time).getTime() - time)
							? current
							: previous;
					},
					undefined
				);
				if (event && time - new Date(event.time).getTime() < 30000) {
					author = event.author;
					description = event.description;
					if (event.url) url = event.url;
				} else if (reason === 'review_requested') {
					handleReviewRequested();
				}
			} else if (reason === 'review_requested') {
				handleReviewRequested();
			}

			if ((!firstTime && previous?.description === description) || !description) return null;

			value = {
				...common,
				author,
				creator: { login: user.login, avatar: user.avatar_url, bot: user.type === 'Bot' },
				description,
				icon: getPullRequestIcon(data as GithubPullRequest),
				opened: state === 'open',
				number,
				labels,
				url,
				previously:
					previous?.description !== description ? previous : previous?.previously || undefined,
				type: 'pr'
			};
			break;
		}

		case 'Release': {
			const { author, tag_name, prerelease, html_url } = data as GithubRelease;
			value = {
				...common,
				author: { login: author.login, avatar: author.avatar_url, bot: author.type === 'Bot' },
				description: 'made a release',
				icon: 'release',
				labels: [
					{ name: tag_name, color: 'FFFFFF' },
					...(prerelease ? [{ name: 'pre-release', color: 'FFA723' }] : [])
				],
				url: html_url,
				type: 'release'
			};
			break;
		}

		case 'Discussion': {
			const data = await getDiscussionUrl(githubNotification);
			let { url } = data;
			const { latestCommentEdge } = data;
			let description: string;
			let author;
			if (!latestCommentEdge) {
				description = 'New activity on discussion';
			} else {
				url += '#discussioncomment-' + latestCommentEdge.node.databaseId;
				author = latestCommentEdge.node.author;
				author = {
					login: author.login,
					avatar: author.avatarUrl,
					bot: author.__typename === 'Bot'
				};
				description = commentBodyToDescription(latestCommentEdge.node.bodyText);
			}

			value = {
				...common,
				author,
				description,
				url,
				icon: 'discussion',
				previously:
					previous?.description !== description ? previous : previous?.previously || undefined,
				type: 'discussion'
			};
			break;
		}

		case 'CheckSuite': {
			const splited = subject.title.split(' ');
			const workflowName = splited[0];
			const branch = splited[splited.length - 2];
			const status = splited[3];
			const data = {
				...common,
				title: `${workflowName} for ${branch}`,
				description: `Workflow run ${status}`,
				url: `https://github.com/${repository.full_name}/pull/${branch}`,
				type: 'workflow'
			} as const;

			if (subject.title.includes('succeeded')) {
				value = { ...data, icon: 'workflow-success' };
			}

			if (subject.title.includes('failed')) {
				value = { ...data, icon: 'workflow-fail' };
			}

			value = { ...data, icon: 'closed-issue' };
			break;
		}

		default:
			value = {
				...common,
				description: `'${subject.type}' notifications are not yet fully supported`,
				icon: 'unsupported',
				type: 'workflow'
			};
			break;
	}

	const priorities = storage.get('priorities');
	if (!priorities || priorities.length === 0) return value;

	// Get value for each priority
	const valuedPriorities = priorities.map<[Priority['criteria'], number, string | undefined]>(
		(priority) => [
			priority.criteria,
			getPriorityValue(priority, value, data, reason) ? priority.value : 0,
			'specifier' in priority ? priority.specifier : undefined
		]
	);

	// Get the accumulated value of all priorities
	const accumulatedValue = valuedPriorities.reduce<number>(
		(previous, current) => previous + current[1],
		0
	);
	if (accumulatedValue === 0) return value;

	// Get the most valued criteria
	const mostValuedCriteria = valuedPriorities.reduce<(typeof valuedPriorities)[number]>(
		(previous, current) =>
			(accumulatedValue > 0 ? previous[1] > current[1] : previous[1] < current[1])
				? previous
				: current,
		valuedPriorities[0]
	);

	const priorityLabel = mostValuedCriteria[2]
		? `${prioritiesLabel[mostValuedCriteria[0]]} "${cleanSpecifier(mostValuedCriteria[2])}"`
		: prioritiesLabel[mostValuedCriteria[0]];
	return {
		...value,
		priority: {
			label: priorityLabel.replace('...', ''),
			value: accumulatedValue
		}
	};
}

const commentBodyToDescription = (body: string) => {
	return `*commented*: _${body.slice(0, 100)}${body.length > 100 ? '...' : ''}_`;
};

async function getLatestComment(
	url: string,
	fetchOptions: FetchOptions
): Promise<PullRequestEvent | undefined> {
	const comments = await fetchGithub<GithubComment[]>(url, fetchOptions);
	if (!comments.length) return undefined;
	const comment = comments[comments.length - 1];
	const author = {
		login: comment.user.login,
		avatar: comment.user.avatar_url,
		bot: comment.user.type === 'Bot'
	};
	const body = removeMarkdownSymbols(comment.body);
	const description = commentBodyToDescription(body);
	return { author, description, time: comment.created_at, url: comment.html_url };
}

async function getLatestCommit(
	url: string,
	fetchOptions: FetchOptions
): Promise<PullRequestEvent | undefined> {
	const commits = await fetchGithub<GithubCommit[]>(url, fetchOptions);
	if (!commits.length) return undefined;
	const commit = commits[commits.length - 1];
	const author = commit.author
		? {
				login: commit.author.login,
				avatar: commit.author.avatar_url,
				bot: commit.author.type === 'Bot'
		  }
		: { login: commit.commit.author.name };
	const description = `*committed*: _${commit.commit.message}_`;
	return { author, description, time: commit.commit.author.date };
}

async function getLatestReview(
	url: string,
	fetchOptions: FetchOptions
): Promise<PullRequestEvent | undefined> {
	const reviews = await fetchGithub<GithubReview[]>(`${url}/reviews`, fetchOptions);
	if (!reviews.length) return undefined;
	const review = reviews[reviews.length - 1];
	const author = {
		login: review.user.login,
		avatar: review.user.avatar_url
	};
	const body = review.body ? removeMarkdownSymbols(review.body).slice(0, 100) : undefined;
	let description = '';
	switch (review.state) {
		case 'APPROVED':
			description = '*approved*';
			break;
		case 'CHANGES_REQUESTED':
			description = `*requested changes*${body ? '' : ' on'}`;
			break;
		case 'COMMENTED':
			description = '*reviewed*';
			break;
		case 'DISMISSED':
			description = `*dismissed review*${body ? '' : ' on'}`;
			break;
	}
	if (body) {
		description += `: _${body}${body.length === 100 ? '...' : ''}_`;
	} else {
		description += ' this pull request';
	}
	return { author, description, time: review.submitted_at, url: review.html_url };
}

function getPriorityValue(
	priority: Priority,
	notification: NotificationData,
	data: GithubItem | null,
	reason: GithubNotification['reason']
): boolean | null | undefined {
	switch (priority.criteria) {
		case 'assigned':
			return (
				data &&
				'assignees' in data &&
				data.assignees.some((assignee) => assignee.login === getLoggedUser()?.login)
			);

		case 'many-comments':
			return data && 'comments' in data && data.comments > 5;

		case 'many-reactions':
			return data && 'reactions' in data && data.reactions.total_count > 5;

		case 'mentioned':
			return reason === 'mention' || reason === 'team_mention';

		case 'review-request':
			return reason === 'review_requested';

		case 'label':
			return notification.labels?.some((label) => label.name === priority.specifier);

		case 'state':
			return data && 'state' in data && data.state === priority.specifier;

		case 'type':
			return notification.type === priority.specifier;
	}
}

function getLoggedUser() {
	let user: User | undefined;
	page.subscribe((page) => {
		user = page.data.session?.githubUser;
	});
	return user;
}
