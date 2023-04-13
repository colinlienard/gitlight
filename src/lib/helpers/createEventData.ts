import { Branch, Commit, Discussion, Release, Repository, Tag } from '../icons';
import type { GithubEvent, EventData, GithubPullRequest } from '../types';
import { getIconColor, getIssueIcon, getPullRequestIcon } from './getIcon';

export function createEventData(
	{ id, actor, created_at, payload, repo, type }: GithubEvent,
	pinned: boolean,
	read: boolean,
	isNew: boolean
): EventData {
	const common = {
		id,
		read,
		pinned,
		isNew,
		time: created_at,
		repo: repo.name
	};

	switch (type) {
		case 'CommitCommentEvent':
			return {
				...common,
				type: 'commit',
				description: [
					{ text: actor.login, image: payload.comment.user.avatar_url },
					' commented on a commit'
				],
				icon: Discussion,
				iconColor: 'blue',
				title: payload.comment.body,
				url: payload.comment.html_url
			};

		case 'CreateEvent':
			return {
				...common,
				type: 'branch/tag',
				description: [
					{ text: actor.login, image: actor.avatar_url },
					` created this ${payload.ref_type} `
				],
				icon:
					payload.ref_type === 'branch' ? Branch : payload.ref_type === 'tag' ? Tag : Repository,
				iconColor: 'green',
				title: payload.ref || repo.name,
				url: `https://github.com/${repo.name}/tree/${payload.ref}`
			};

		case 'DeleteEvent':
			return {
				...common,
				type: 'branch/tag',
				description: [
					{ text: actor.login, image: actor.avatar_url },
					` deleted this ${payload.ref_type} `
				],
				icon: payload.ref_type === 'branch' ? Branch : Tag,
				iconColor: 'red',
				title: payload.ref
			};

		case 'ForkEvent':
			return {
				...common,
				type: 'repo',
				description: [],
				icon: Commit,
				title: 'ForkEvent not implemented',
				url: ''
			};

		case 'GollumEvent':
			return {
				...common,
				type: 'repo',
				description: [],
				icon: Commit,
				title: 'GollumEvent not implemented',
				url: ''
			};

		case 'IssueCommentEvent':
			return {
				...common,
				type: 'issue',
				description: [
					{ text: payload.comment.user.login, image: payload.comment.user.avatar_url },
					' commented on ',
					{
						text: payload.issue.title,
						icon: payload.issue.html_url.includes('pull')
							? getPullRequestIcon(payload.issue as GithubPullRequest)
							: getIssueIcon(payload.issue),
						iconColor: getIconColor(payload.issue)
					}
				],
				icon: Discussion,
				iconColor: 'blue',
				title: payload.comment.body,
				url: payload.comment.html_url
			};

		case 'IssuesEvent':
			return {
				...common,
				type: 'issue',
				description: [
					{ text: actor.login, image: actor.avatar_url },
					` ${payload.action} this issue`
				],
				icon: getIssueIcon(payload.issue),
				iconColor: getIconColor(payload.issue),
				title: payload.issue.title,
				number: payload.issue.number,
				url: payload.issue.html_url,
				labels: payload.issue.labels
			};

		case 'MemberEvent':
			return {
				...common,
				type: 'repo',
				description: [],
				icon: Commit,
				title: 'MemberEvent not implemented',
				url: ''
			};

		case 'PublicEvent':
			return {
				...common,
				type: 'repo',
				description: [],
				icon: Commit,
				title: 'PublicEvent not implemented',
				url: ''
			};

		case 'PullRequestEvent':
			return {
				...common,
				type: 'pr',
				description: [
					{ text: actor.login, image: actor.avatar_url },
					` ${payload.pull_request.merged ? 'merged' : payload.action} this pull request`
				],
				icon: getPullRequestIcon(payload.pull_request),
				iconColor: getIconColor(payload.pull_request),
				title: payload.pull_request.title,
				number: payload.pull_request.number,
				url: payload.pull_request.html_url,
				labels: payload.pull_request.labels
			};

		case 'PullRequestReviewEvent':
			return {
				...common,
				type: 'review',
				description: [
					{ text: actor.login, image: actor.avatar_url },
					` ${
						payload.review.state === 'changes_requested'
							? 'requested changes'
							: payload.review.state
					}${payload.review.state !== 'approved' ? ' on' : ''} this pull request`
				],
				icon: getPullRequestIcon(payload.pull_request),
				iconColor: getIconColor(payload.pull_request),
				title: payload.pull_request.title,
				number: payload.pull_request.number,
				url: payload.review.html_url,
				labels: payload.pull_request.labels
			};

		case 'PullRequestReviewCommentEvent':
			return {
				...common,
				type: 'review',
				description: [],
				icon: Commit,
				title: 'PullRequestReviewCommentEvent not implemented',
				url: ''
			};

		case 'PullRequestReviewThreadEvent':
			return {
				...common,
				type: 'review',
				description: [],
				icon: Commit,
				title: 'PullRequestReviewThreadEvent not implemented',
				url: ''
			};

		case 'PushEvent':
			return {
				...common,
				type: 'commit',
				description: [
					{ text: actor.login, image: actor.avatar_url },
					' commited to ',
					{ text: payload.ref.replace('refs/heads/', ''), icon: Branch, iconColor: 'blue' }
				],
				icon: Commit,
				iconColor: 'blue',
				title: payload.commits[payload.commits.length - 1].message,
				url: `https://github.com/${repo.name}/commit/${payload.head}`
			};

		case 'ReleaseEvent':
			return {
				...common,
				type: 'repo',
				description: [{ text: actor.login, image: actor.avatar_url }, ' published a release'],
				icon: Release,
				iconColor: 'blue',
				title: payload.release.name,
				url: payload.release.html_url,
				labels: [
					{ name: payload.release.tag_name, color: 'white' },
					...(payload.release.prerelease ? [{ name: 'pre-release', color: 'FFA723' }] : [])
				]
			};

		case 'SponsorshipEvent':
			return {
				...common,
				type: 'repo',
				description: [],
				icon: Commit,
				title: 'SponsorshipEvent not implemented',
				url: ''
			};

		case 'WatchEvent':
			return {
				...common,
				type: 'repo',
				description: [
					{ text: actor.login, image: actor.avatar_url },
					' started watching this repository'
				],
				icon: Repository,
				iconColor: 'blue',
				title: repo.name
			};

		default:
			throw new Error('Unknown event type');
	}
}
