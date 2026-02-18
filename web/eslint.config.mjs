import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";

export default [
  // ── Global ignores ──
  {
    ignores: ["dist/**", ".astro/**", "node_modules/**", "src/content/**"],
  },

  // ── TypeScript files ──
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // ── Astro files ──
  ...eslintPluginAstro.configs["flat/recommended"],
  {
    files: ["**/*.astro"],
    rules: {
      // Astro frontmatter often uses `any` for JSON data
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // ── Script files (mjs) ──
  {
    files: ["**/*.mjs"],
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
