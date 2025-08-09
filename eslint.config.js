import js from "@eslint/js";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import prettierConfig from "eslint-config-prettier";
import globals from "globals"; // Add this import

export default [
  // Base ESLint recommended config
  js.configs.recommended,

  // Browser environment for JSX files
  {
    files: ["**/*.{jsx,js}"],
    languageOptions: {
      globals: {
        ...globals.browser, // Adds 'document', 'window', etc.
        ...globals.node, // Adds Node.js globals when needed
      },
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },

  // Node.js environment for config files
  {
    files: ["**/*.config.js"],
    languageOptions: {
      globals: {
        ...globals.node, // Adds '__dirname', 'require', etc.
      },
    },
  },

  // React configuration
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...jsxA11yPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },

  // Prettier integration (must be last)
  prettierConfig,
];
