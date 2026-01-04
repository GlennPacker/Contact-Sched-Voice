import reactPlugin from 'eslint-plugin-react'
import noCommentsRule from './tools/eslint-rules/no-comments.js'
import noNumberConstructorRule from './tools/eslint-rules/no-number-constructor.js'

export default [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'coverage/**',
      'dist/**',
      'public/**',
      '.env.local',
      '.env.development.local',
      '.env.test.local',
    ],
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react: reactPlugin,
      local: { rules: { 'no-comments': noCommentsRule, 'no-number-constructor': noNumberConstructorRule } },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'local/no-comments': 'error',
      'local/no-number-constructor': 'error',
    },
    settings: { react: { version: 'detect' } },
  },
]
