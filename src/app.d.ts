import type { Session } from './lib/types';

declare global {
	namespace App {
		interface Locals {
			session?: Session;
		}
		interface PageData {
			session?: Session;
		}
	}

	const __APP_VERSION__: string;
}

export {};
