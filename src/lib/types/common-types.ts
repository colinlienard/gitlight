import type { Session as BaseSession } from '@auth/core/types';
import type { ComponentType } from 'svelte';
import type { GithubLabel } from './github-types';

export type Session = BaseSession & { accessToken: string };

export type Colors = 'blue' | 'purple' | 'green' | 'red' | 'grey';

export type EventType = 'pr' | 'issue' | 'commit' | 'review' | 'branch/tag' | 'repo';

export type EventData = {
	id: string;
	type: EventType;
	read: boolean;
	pinned: boolean;
	isNew: boolean;
	title: string;
	description: (
		| {
				text: string;
				image?: string;
				icon?: ComponentType;
				iconColor?: Colors;
		  }
		| string
	)[];
	time: string;
	icon: ComponentType;
	iconColor?: Colors;
	repo: string;
	number?: number;
	labels?: GithubLabel[];
	url?: string;
};

export type TypeFilters = {
	name: string;
	type: EventType;
	active: boolean;
}[];

export type EventSources = {
	name: string;
	active: boolean;
}[];
