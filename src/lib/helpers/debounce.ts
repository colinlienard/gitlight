/* eslint-disable @typescript-eslint/no-explicit-any */
export function debounce(callback: (...args: any[]) => void, delay: number): () => void {
	let timeout: ReturnType<typeof setTimeout>;

	return (...args: any[]) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => callback(...args), delay);
	};
}
