module.exports = {
    env: {
        node: true
    },
    parser: '@typescript-eslint/parser',  // Specifies the ESLint parser
    extends: [
        'plugin:@typescript-eslint/recommended',  // Uses the recommended rules from @typescript-eslint/eslint-plugin
        'prettier/@typescript-eslint',
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
        // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
        // e.g. '@typescript-eslint/explicit-function-return-type': 'off',
        'semi': 0,
        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        'no-console': 'warn',
        'no-unused-vars': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-unused-vars': [
            'error',
            { vars: 'all', args: 'after-used', ignoreRestSiblings: false }
        ],
        '@typescript-eslint/explicit-function-return-type': 'warn', // Consider using explicit annotations for object literals and function return types even when they can be inferred.
        '@typescript-eslint/ban-ts-ignore': 'warn',
        '@typescript-eslint/no-var-requires': 'off',
        'no-empty': 'warn'
    },
    settings: {
        'import/resolver': {
            'node': {
                'extensions': ['.js', '.jsx', '.ts', '.tsx']
            }
        }
    },
    'overrides': [
        {
            'files': ['**/*.ts'],
        }
    ]
};