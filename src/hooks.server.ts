import { SvelteKitAuth } from '@auth/sveltekit';
import GitHub from '@auth/core/providers/github';
import { AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, AUTH_SECRET } from '$env/static/private';
import type { TSession } from './lib/types';

export const handle = SvelteKitAuth({
	providers: [
		GitHub({
			clientId: AUTH_GITHUB_ID,
			clientSecret: AUTH_GITHUB_SECRET,
			authorization: {
				params: {
					scope: 'repo'
				}
			}
		}) as never
	],
	secret: AUTH_SECRET,
	trustHost: true,
	callbacks: {
		async jwt({ token, account }) {
			if (account) {
				token.accessToken = account.access_token;
			}
			return token;
		},
		async session({ session, token }) {
			(session as TSession).accessToken = token.accessToken as string;
			return session;
		}
	}
});
