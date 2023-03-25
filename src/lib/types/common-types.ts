import type { Session } from '@auth/core/types';
import type { ComponentType } from 'svelte';
import type { TGithubLabel } from './github-types';

export type TSession = Session & { accessToken: string };

export type TColors = 'blue' | 'purple' | 'green' | 'red' | 'grey';

export type TEventType = 'pr' | 'issue' | 'commit' | 'review' | 'branch/tag' | 'repo';

export type TEvent = {
	id: string;
	type: TEventType;
	read: boolean;
	pinned: boolean;
	title: string;
	description: (
		| {
				text: string;
				image?: string;
				icon?: ComponentType;
				iconColor?: TColors;
		  }
		| string
	)[];
	time: string;
	icon: ComponentType;
	iconColor?: TColors;
	repo: string;
	number?: number;
	labels?: TGithubLabel[];
	url?: string;
};
