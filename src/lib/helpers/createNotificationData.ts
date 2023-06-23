import type {
	GithubComment,
	GithubCommit,
	GithubIssue,
	GithubItem,
	GithubNotification,
	GithubPullRequest,
	GithubRelease,
	NotificationData,
	SavedNotifications
} from '~/lib/types';
import {
	Check,
	Commit,
	Cross,
	Discussion,
	ExclamationMark,
	IssueNotPlanned,
	Release
} from '../icons';
import { getIconColor, getIssueIcon, getPullRequestIcon } from './getIcon';
import { fetchGithub } from './fetchGithub';
import { removeMarkdownSymbols } from './removeMarkdownSymbols';

export async function createNotificationData(
	{ id, repository, subject, unread: u, updated_at, reason }: GithubNotification,
	savedNotifications: SavedNotifications
): Promise<NotificationData | null> {
	const previous = Array.isArray(savedNotifications)
		? savedNotifications.find((n) => n.id === id)
		: undefined;
	const pinned = previous?.pinned || false;
	const unread = u || previous?.unread || false;
	const isNew = (u && !previous?.unread) || false;

	// Fetch additional data
	const data = subject.url ? await fetchGithub<GithubItem>(subject.url) : null;

	const [owner, repo] = repository.full_name.split('/');
	const common = {
		id,
		pinned,
		unread,
		isNew,
		time: updated_at,
		title: subject.title,
		type: subject.type,
		owner,
		repo,
		repoId: `${repository.id}`,
		ownerAvatar: repository.owner.avatar_url
	} satisfies Partial<NotificationData>;

	switch (subject.type) {
		case 'Commit': {
			const { author, html_url, commit } = data as GithubCommit;
			return {
				...common,
				author: author
					? { login: author.login, avatar: author.avatar_url, bot: author.type === 'Bot' }
					: { login: commit.author.name },
				description: 'made a commit',
				icon: Commit,
				iconColor: 'blue',
				url: html_url
			};
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

			let author;
			let description = 'New activity on issue';
			if (
				state == 'open' &&
				new Date(common.time).getTime() - new Date(created_at).getTime() < 30000
			) {
				author = { login: user.login, avatar: user.avatar_url, bot: user.type === 'Bot' };
				description = 'opened this issue';
			} else if (
				state === 'closed' &&
				new Date(common.time).getTime() - new Date(closed_at as string).getTime() < 30000
			) {
				author = closed_by
					? { login: closed_by.login, avatar: closed_by.avatar_url, bot: closed_by.type === 'Bot' }
					: undefined;
				description = 'closed this issue';
			} else if (comments) {
				const comment = await getLatestComment(comments_url);
				if (comment) {
					author = comment.author;
					description = comment.description;
				}
			}

			if (previous?.description === description) return null;

			return {
				...common,
				author,
				description,
				icon: getIssueIcon(data as GithubIssue),
				iconColor: getIconColor(data as GithubIssue),
				opened: state === 'open',
				number,
				labels,
				url: html_url,
				previously:
					previous?.description !== description ? previous : previous?.previously || undefined
			};
		}

		case 'PullRequest': {
			const {
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

			let author;
			let description = 'New activity on pull request';
			const time = new Date(common.time).getTime();
			if (state == 'open' && time - new Date(created_at).getTime() < 30000) {
				author = { login: user.login, avatar: user.avatar_url, bot: user.type === 'Bot' };
				description = 'opened this pull request';
			} else if (state === 'closed' && time - new Date(closed_at as string).getTime() < 30000) {
				author = merged_by
					? { login: merged_by.login, avatar: merged_by.avatar_url, bot: merged_by.type === 'Bot' }
					: { login: user.login, avatar: user.avatar_url, bot: user.type === 'Bot' };
				description = `${merged_by ? 'merged' : 'closed'} this pull request`;
			} else if (reason === 'review_requested') {
				author = { login: user.login, avatar: user.avatar_url, bot: user.type === 'Bot' };
				description = 'requested your review';
			} else if (review_comments || comments || commits) {
				const events = await Promise.all([
					review_comments ? getLatestComment(review_comments_url) : undefined,
					comments ? getLatestComment(comments_url) : undefined,
					commits ? getLatestCommit(commits_url) : undefined
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
				if (event) {
					author = event.author;
					description = event.description;
				}
			}

			if (previous?.description === description) return null;

			return {
				...common,
				author,
				description,
				icon: getPullRequestIcon(data as GithubPullRequest),
				iconColor: getIconColor(data as GithubPullRequest),
				opened: state === 'open',
				number,
				labels,
				url: html_url,
				previously:
					previous?.description !== description ? previous : previous?.previously || undefined
			};
		}

		case 'Release': {
			const { author, tag_name, prerelease, html_url } = data as GithubRelease;
			return {
				...common,
				author: { login: author.login, avatar: author.avatar_url, bot: author.type === 'Bot' },
				description: 'made a release',
				icon: Release,
				iconColor: 'blue',
				labels: [
					{ name: tag_name, color: 'FFFFFF' },
					...(prerelease ? [{ name: 'pre-release', color: 'FFA723' }] : [])
				],
				url: html_url
			};
		}

		case 'Discussion':
			return {
				...common,
				description: 'New activity on discussion',
				icon: Discussion,
				iconColor: 'blue'
			};

		case 'CheckSuite': {
			const splited = subject.title.split(' ');
			const workflowName = splited[0];
			const branch = splited[splited.length - 2];
			const status = splited[3];
			const data = {
				...common,
				title: `${workflowName} for ${branch}`,
				description: `Workflow run ${status}`,
				url: `https://github.com/${repository.full_name}/pull/${branch}`
			};

			if (subject.title.includes('succeeded')) {
				return { ...data, icon: Check, iconColor: 'green' };
			}

			if (subject.title.includes('failed')) {
				return { ...data, icon: Cross, iconColor: 'red' };
			}

			return { ...data, icon: IssueNotPlanned, iconColor: 'grey' };
		}

		default:
			return {
				...common,
				type: 'CheckSuite',
				description: `'${subject.type}' notifications are not yet fully supported`,
				icon: ExclamationMark,
				iconColor: 'grey'
			};
	}
}

async function getLatestComment(url: string) {
	const comments = await fetchGithub<GithubComment[]>(url);
	if (!comments.length) return undefined;
	const comment = comments[comments.length - 1];
	const author = {
		login: comment.user.login,
		avatar: comment.user.avatar_url,
		bot: comment.user.type === 'Bot'
	};
	const body = removeMarkdownSymbols(comment.body).slice(0, 100);
	const description = `commented: ${body}${body.length === 100 ? '...' : ''}`;
	return { author, description, time: comment.created_at };
}

async function getLatestCommit(url: string) {
	const commits = await fetchGithub<GithubCommit[]>(url);
	if (!commits.length) return undefined;
	const commit = commits[commits.length - 1];
	const author = commit.author
		? {
				login: commit.author.login,
				avatar: commit.author.avatar_url,
				bot: commit.author.type === 'Bot'
		  }
		: { login: commit.commit.author.name };
	const description = `committed: ${commit.commit.message}`;
	return { author, description, time: commit.commit.author.date };
}
