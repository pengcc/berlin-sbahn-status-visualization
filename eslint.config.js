import js from '@eslint/js';
import reactRecommended from 'eslint-plugin-react/configs/recommended.js';
import hooksRecommended from 'eslint-plugin-react-hooks';
import jsxA11yRecommended from 'eslint-plugin-jsx-a11y/recommended';
import prettierConfig from 'eslint-config-prettier';

export default [
  // Base ESLint recommended config
  js.configs.recommended,

  // React plugins
  {
    ...reactRecommended,
    rules: {
      ...reactRecommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    }
  },
  {
    ...hooksRecommended.configs.recommended,
  },
  jsxA11yRecommended,

  // Prettier integration (must be last)
  prettierConfig,

  // Your custom settings
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        browser: true,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  }
];