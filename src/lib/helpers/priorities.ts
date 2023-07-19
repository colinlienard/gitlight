import type { Priority } from '../types';

export const prioritiesLabel: Record<Priority['criteria'], string> = {
	'many-comments': 'Has many comments',
	'many-reactions': 'Has many reactions',
	assigned: 'You are assigned',
	mentionned: 'You were mentionned',
	'review-request': 'You have a pending review request',
	label: 'Has the label...',
	state: 'State is...',
	type: 'Type is...'
};

export const defaultPriorities: Priority[] = [
	{ criteria: 'mentionned', value: 6 },
	{ criteria: 'assigned', value: 4 },
	{ criteria: 'review-request', value: 3 },
	{ criteria: 'label', value: 2, specifier: 'bug' },
	{ criteria: 'type', value: -2, specifier: 'Commit' },
	{ criteria: 'state', value: -8, specifier: 'closed' }
];
