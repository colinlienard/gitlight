import type { Action } from 'svelte/action';

export const intersect: Action<HTMLElement, { callback: () => void; active?: boolean }> = (
	node,
	{ callback, active = true }
) => {
	if (!active) return;

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					callback();
				}
			});
		},
		{ threshold: 1 }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
};
