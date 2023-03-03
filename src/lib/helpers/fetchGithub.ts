import { accessToken } from '../stores/accessToken';

export const fetchGithub = async (url: string) => {
	let token;

	accessToken.subscribe((value) => {
		token = value;
	});

	const response = await fetch(url, {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`
		}
	});
	const data = await response.json();
	return data;
};
