export function formatRelativeDate(date: string) {
	const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
	if (seconds < 60) return `${seconds}s`;

	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m`;

	const hours = Math.floor(minutes / 60);
	if (hours < 24) return `${hours}h`;

	const days = Math.floor(hours / 24);
	if (days < 30) return `${days}d`;

	const months = Math.floor(days / 30);
	return `${months}mo`;
}
