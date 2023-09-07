import type { Action } from 'svelte/action';

export const delayedHover: Action<HTMLElement, string> = (node, className) => {
	let timeout: ReturnType<typeof setTimeout>;

	function handleMouseEnter() {
		timeout = setTimeout(() => {
			if (!node.classList.contains(className)) {
				node.classList.add(className);
			}
		}, 200);
	}

	function handleMouseLeave() {
		node.classList.remove(className);
		clearTimeout(timeout);
	}

	node.addEventListener('mouseenter', handleMouseEnter);
	node.addEventListener('mouseleave', handleMouseLeave);

	return {
		destroy() {
			node.removeEventListener('mouseenter', handleMouseEnter);
			node.removeEventListener('mouseleave', handleMouseLeave);
		}
	};
};
