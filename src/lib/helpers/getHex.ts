import type { TColors } from '../types';

export function getHex(color?: TColors) {
	switch (color) {
		case 'blue':
			return '#8585ff';
		case 'purple':
			return '#a557ff';
		case 'green':
			return '#22c965';
		case 'red':
			return '#e34763';
		case 'grey':
			return '#888888';
		default:
			return '#FFF';
	}
}
