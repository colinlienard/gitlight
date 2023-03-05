export function formatRelativeDate(date: string) {
	const seconds = Math.round((new Date(date).getTime() - new Date().getTime()) / 1000);
	const minutes = Math.round(seconds / 60);
	const hours = Math.round(minutes / 60);
	const days = Math.round(hours / 24);
	const months = Math.round(days / 30);

	const formater = new Intl.RelativeTimeFormat('en', {
		numeric: 'always',
		style: 'narrow'
	});

	let result = '';

	if (months < -1) {
		result = formater.format(months, 'month');
	} else if (days < -1) {
		result = formater.format(days, 'day');
	} else if (hours < -1) {
		result = formater.format(hours, 'hour');
	} else if (minutes < -1) {
		result = formater.format(minutes, 'minute');
	} else {
		result = formater.format(seconds, 'second');
	}

	return result.replace(' ago', '');
}
