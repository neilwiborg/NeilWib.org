module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
	plugins: ['@typescript-eslint'],
	ignorePatterns: ['*.cjs'],
	extends: 'standard-with-typescript',
	parserOptions: {
		project: ['./tsconfig.json'],
		ecmaVersion: 'latest',
		sourceType: 'module'
	},
	env: {
		browser: false,
		es2021: true,
		node: true
	},
	rules: {
		semi: [2, 'always'],
		indent: [2, 'tab'],
		'no-tabs': 0
	}
};
