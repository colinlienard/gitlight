import type { Session } from '@auth/core/types';
import type { ComponentType } from 'svelte';
import type { TGithubLabel } from './github-types';

export type TSession = Session & { accessToken: string };

export type TNotification = {
	title: string;
	description: ({ text: string; image?: string; icon?: ComponentType } | string)[];
	time: string;
	icon: ComponentType;
	repo: string;
	number?: number;
	labels?: TGithubLabel[];
	url: string;
};
