const markdownSymbols: Array<[RegExp, string]> = [
	[/#+\s/g, ''], // Remove headers (e.g., # Header)
	[/(\*{1,2})(.*?)\1/g, '$2'], // Remove emphasis and bold (e.g., *emphasis* or **bold**)
	[/~~(.*?)~~/g, '$1'], // Remove strikethrough (e.g., ~~strikethrough~~)
	[/\[(.*?)\]\((.*?)\)/g, '$1'], // Remove links (e.g., [link](url))
	[/\n- (.*)/g, '$1'], // Remove unordered list (e.g., - Item)
	[/\n\d+\. (.*)/g, '$1'], // Remove ordered list (e.g., 1. Item)
	[/^>\s(.*)$/gm, ''], // Remove blockquotes (e.g., > Quote)
	[/^\[vc\]: #[^\r\n]*/g, ''] // Remove vercel comment beginning
];

export function removeMarkdownSymbols(markdown: string): string {
	markdownSymbols.forEach(([symbol, replacement]) => {
		markdown = markdown.replace(symbol, replacement);
	});
	return markdown.trim();
}
