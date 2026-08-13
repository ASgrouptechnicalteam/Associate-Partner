const js = require("@eslint/js");

module.exports = [
  js.configs.recommended,
  {
    ignores: ["node_modules/**", "dist/**", "coverage/**", "public/**", ".agents/**", ".claude/**", ".windsurf/**", ".gemini/**", "**/*.ts", "frontend/**"]
  },
  {
    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs"
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "off"
    }
  }
];
