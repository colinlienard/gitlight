module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:svelte/recommended',
		'prettier'
	],
	plugins: ['@typescript-eslint', 'import'],
	ignorePatterns: ['*.cjs', 'svelte.config.js'],
	parserOptions: {
		sourceType: 'module',
		ecmaVersion: 2020,
		parser: '@typescript-eslint/parser',
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.json'],
		extraFileExtensions: ['.svelte']
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	},
	overrides: [
		{
			files: ['*.svelte'],
			parser: 'svelte-eslint-parser'
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
