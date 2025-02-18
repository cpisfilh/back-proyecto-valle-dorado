import globals from "globals";
import pluginJs from "@eslint/js";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.node, // Para proyectos Node.js
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "quotes": ["error", "double"],
      "semi": ["error", "always"]
    }
  },
  pluginJs.configs.recommended
];