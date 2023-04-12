export function formatRelativeDate(date: string) {
	const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	const months = Math.floor(days / 30);

	const formater = new Intl.RelativeTimeFormat('en', {
		numeric: 'always',
		style: 'narrow'
	});

	let result = '';

	if (seconds < 60) {
		result = formater.format(seconds, 'second');
	} else if (minutes < 60) {
		result = formater.format(minutes, 'minute');
	} else if (hours < 24) {
		result = formater.format(hours, 'hour');
	} else if (days < 30) {
		result = formater.format(days, 'day');
	} else {
		result = formater.format(months, 'month');
	}

	return result.replace('in ', '');
}
