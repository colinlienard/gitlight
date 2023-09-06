import {
	ClosedIssueIcon,
	ClosedPullRequestIcon,
	CommitIcon,
	CompletedIssueIcon,
	DiscussionIcon,
	DraftPullRequestIcon,
	ExclamationMarkIcon,
	MergedPullRequestIcon,
	OpenIssueIcon,
	OpenPullRequestIcon,
	ReleaseIcon,
	WorkflowFailIcon,
	WorkflowSuccessIcon
} from '$lib/icons';
import type { NotificationIcon } from '$lib/types';

export function getNotificationIcon(icon: NotificationIcon) {
	switch (icon) {
		case 'closed-issue':
			return ClosedIssueIcon;
		case 'closed-pr':
			return ClosedPullRequestIcon;
		case 'commit':
			return CommitIcon;
		case 'completed-issue':
			return CompletedIssueIcon;
		case 'discussion':
			return DiscussionIcon;
		case 'draft-pr':
			return DraftPullRequestIcon;
		case 'merged-pr':
			return MergedPullRequestIcon;
		case 'open-issue':
			return OpenIssueIcon;
		case 'open-pr':
			return OpenPullRequestIcon;
		case 'release':
			return ReleaseIcon;
		case 'workflow-fail':
			return WorkflowFailIcon;
		case 'workflow-success':
			return WorkflowSuccessIcon;
		default:
			return ExclamationMarkIcon;
	}
}
