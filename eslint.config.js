import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

/** Minimal lint gate — fail on serious issues only; expand later. */
export default [
  {
    files: ["src/**/*.{ts,tsx}", "tests/**/*.{ts,tsx}", "e2e/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: 2022, sourceType: "module", ecmaFeatures: { jsx: true } },
    },
    plugins: { "@typescript-eslint": tseslint },
    rules: {
      "no-eval": "error",
      "no-new-func": "error",
      "no-debugger": "error",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
];
