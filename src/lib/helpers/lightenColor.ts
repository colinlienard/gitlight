export function lightenColor(hex: string, amount = 0.5) {
	const color = hex.replace('#', '');

	let r = parseInt(color.slice(0, 2), 16);
	let g = parseInt(color.slice(2, 4), 16);
	let b = parseInt(color.slice(4, 6), 16);

	const brightness = (r * 299 + g * 587 + b * 114) / 1000;

	if (brightness < 128) {
		r = Math.round(r + (255 - r) * amount);
		g = Math.round(g + (255 - g) * amount);
		b = Math.round(b + (255 - b) * amount);
	}

	const lightened = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
	return `#${lightened}`;
}
