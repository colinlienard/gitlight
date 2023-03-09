import type { TColors } from '../types';

export function getHex(color?: TColors) {
	switch (color) {
		case 'blue':
			return '#7A7DFF';
		case 'purple':
			return '#9868FF';
		case 'green':
			return '#22C965';
		case 'red':
			return '#E34763';
		case 'grey':
			return '#727272';
		default:
			return '#FFF';
	}
}
