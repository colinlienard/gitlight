import type { Session } from '@auth/core/types';
import type { ComponentType } from 'svelte';

export type TSession = Session & { accessToken: string };

export type TNotification = {
	imageUrl: string;
	title: string;
	time: string;
	icon: ComponentType;
	repo: string;
	subject: string;
	number?: number;
	labels?: string;
	url: string;
};
