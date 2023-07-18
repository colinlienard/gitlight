import type { Priority } from '../types';

export const priorityLabels: Record<Priority['criteria'], string> = {
	'many-comments': 'Has many comments',
	'many-reactions': 'Has many reactions',
	assigned: 'You are assigned',
	mentionned: 'You were mentionned',
	'review-request': 'You have a pending review request',
	label: 'Has the label',
	state: 'Is'
};

export const defaultPriorities: Priority[] = [
	{ criteria: 'assigned', value: 3 },
	{ criteria: 'mentionned', value: 2 },
	{ criteria: 'label', value: 2, specifier: 'bug' },
	{ criteria: 'review-request', value: 1 },
	{ criteria: 'state', value: -1, specifier: 'closed' }
];
