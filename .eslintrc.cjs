module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	plugins: ['svelte3', '@typescript-eslint', 'import'],
	ignorePatterns: ['*.cjs'],
	overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
	settings: {
		'svelte3/typescript': () => require('typescript')
	},
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	rules: {
		'@typescript-eslint/no-unused-vars': [1, { argsIgnorePattern: '^_' }],
		'no-console': ['warn', { allow: ['error'] }],
		'import/order': [
			'warn',
			{
				groups: ['external', 'unknown', 'internal', 'sibling', 'parent'],
				pathGroups: [
					{ pattern: '$.*', group: 'unknown' },
					{ pattern: '~/lib/*', group: 'internal' }
				],
				alphabetize: { order: 'asc', caseInsensitive: true },
				'newlines-between': 'never'
			}
		]
	}
};
