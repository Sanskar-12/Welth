import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["*.js", "*.jsx"], // Target only JavaScript files
    languageOptions: {
      parser: "espree", // Default parser for JavaScript
    },
    rules: {
      // Add any project-specific rules here if needed
    },
  },
];

export default eslintConfig;
