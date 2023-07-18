import type { Priority } from '../types';

export const priorityLabels: Record<Priority['criteria'], string> = {
	'many-comments': 'Has many comments',
	'many-reactions': 'Has many reactions',
	assigned: 'You are assigned',
	mentionned: 'You were mentionned',
	'review-request': 'You have a pending review request',
	label: 'Has the label...',
	state: 'Is...'
};
