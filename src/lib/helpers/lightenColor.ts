export function lightenColor(value: string) {
	// const isDark = parseInt(color.replace('#', ''), 16) > 0xffffff / 2;
	// if (isDark) {
	// 	const amount = 0.2;
	// 	const cc = parseInt(color.replace('#', ''), 16) * amount;
	// 	const c = (cc > 0xffffff ? 0xffffff : cc).toString(16);
	// 	const newColor = `#${('00000' + c).substr(-6)}`;
	// 	return newColor;
	// }

	const color = value.replace('#', '');

	let red = parseInt(color.slice(0, 2), 16);
	let green = parseInt(color.slice(2, 4), 16);
	let blue = parseInt(color.slice(4, 6), 16);

	if (red < 100 || green < 100 || blue < 100) {
		red = Math.min(red + 100, 255);
		green = Math.min(green + 100, 255);
		blue = Math.min(blue + 100, 255);
	}

	const r = (red + 100).toString(16);
	const g = (green + 100).toString(16);
	const b = (blue + 100).toString(16);
	console.log(`#${r}${g}${b}`);

	return `#${r}${g}${b}`;
}
