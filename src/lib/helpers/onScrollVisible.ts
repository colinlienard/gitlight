export function onScrollVisible(target: HTMLElement, callback: () => void) {
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				observer.unobserve(entry.target);
				callback();
			}
		});
	});

	observer.observe(target);
}
