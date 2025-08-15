import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.eslint.json", // pakai tsconfig lint khusus
        tsconfigRootDir: import.meta.dirname, // set root supaya path relatif bener
      },
      globals: globals.browser,
    },
    rules: {
      // aturan custom di sini
    },
  },
];
