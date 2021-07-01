module.exports = {
	env: {
		node: true
	},
	parser: '@typescript-eslint/parser',  // Specifies the ESLint parser
	extends: [
		'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from @typescript-eslint/eslint-plugin
		'plugin:prettier/recommended',
	],
	plugins: ['@typescript-eslint', 'prettier'],
	parserOptions: {
		ecmaVersion: 2018,  // Allows for the parsing of modern ECMAScript features
		sourceType: 'module',  // Allows for the use of imports
		ecmaFeatures: {
			jsx: false,  // Allows for the parsing of JSX
		},
	},
	rules: {
		'semi': 0,
		'linebreak-style': ['error', 'unix'],
		quotes: ['error', 'single'],
		'no-console': 'off',
		'no-unused-vars': 'off',
		'no-empty': 'warn',
		'@typescript-eslint/ban-ts-comment': 'off',
		'@typescript-eslint/no-var-requires': 'off',
		'@typescript-eslint/explicit-module-boundary-types': 'off',
		'@typescript-eslint/no-explicit-any': 'off'
	},
	settings: {
		'import/resolver': {
			'node': {
				'extensions': ['.js', '.ts']
			}
		}
	},
	'overrides': [
		{
			'files': ['**/*.ts'],
		}
	]
};