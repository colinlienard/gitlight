export function shadeColor(hex: string, amount: number) {
	const color = hex.replace('#', '');

	const num = parseInt(color, 16);
	let r = (num >> 16) & 255;
	let g = (num >> 8) & 255;
	let b = num & 255;

	r += (amount / 100) * 255;
	g += (amount / 100) * 255;
	b += (amount / 100) * 255;

	r = Math.min(255, Math.max(0, r));
	g = Math.min(255, Math.max(0, g));
	b = Math.min(255, Math.max(0, b));

	return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`;
}
