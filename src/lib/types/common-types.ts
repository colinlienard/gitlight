import type { Session } from '@auth/core/types';

export type TSession = Session & { accessToken: string };
