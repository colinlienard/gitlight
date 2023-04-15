import type { Session } from './lib/types';

declare global {
	namespace App {
		interface Locals {
			session: Session | null;
		}
	}

	const __APP_VERSION__: string;
}

export {};
