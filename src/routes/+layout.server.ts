import type { LayoutServerLoad } from './$types';

export const load = (async ({ locals }) => {
	const { session } = locals;
	return { session };
}) satisfies LayoutServerLoad;
