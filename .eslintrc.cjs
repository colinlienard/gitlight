/** @type { import("eslint").Linter.Config } */
module.exports = {
	root: true,
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	],
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'import'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		extraFileExtensions: ['.svelte']
	},
	ignorePatterns: ['*.cjs', 'svelte.config.js'],
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser'
			}
		}
	],
	rules: {
		'@typescript-eslint/no-unused-vars': [1, { argsIgnorePattern: '^_' }],
		'no-console': ['warn', { allow: ['error'] }],
		'no-self-assign': 'off',
		'import/order': [
			'warn',
			{
				groups: ['external', 'unknown', 'internal', 'sibling', 'parent'],
				pathGroups: [
					{ pattern: '$.*', group: 'unknown' },
					{ pattern: '$lib/*', group: 'internal' }
				],
				alphabetize: { order: 'asc', caseInsensitive: true },
				'newlines-between': 'never'
			}
		]
	}
};
