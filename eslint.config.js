import noCommentsRule from './tools/eslint-rules/no-comments.js';
import noNumberConstructorRule from './tools/eslint-rules/no-number-constructor.js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

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
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
      local: { rules: { 'no-comments': noCommentsRule, 'no-number-constructor': noNumberConstructorRule } },
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'local/no-comments': 'error',
      'local/no-number-constructor': 'error',
      'semi': ['error', 'always'],
      'arrow-parens': ['warn', 'as-needed'],
      'no-mixed-operators': 0,
      'no-unused-vars': 0,
      'semi-style': ['error', 'last'],
    },
    settings: { react: { version: 'detect' } },
  },
];
