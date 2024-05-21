import typescriptParser from "@typescript-eslint/parser";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import js from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default [
	js.configs.recommended,
	eslintPluginPrettierRecommended,
	{
		files: ["src/**/*.ts"],
		languageOptions: {
			parser: typescriptParser,
		},
		plugins: {
			typescript: typescriptPlugin,
		},
		parserOptions: {
			sourceType: "module",
		},
		rules: {
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
			"@typescript-eslint/ban-ts-comment": "off",
			"no-prototype-builtins": "off",
			"@typescript-eslint/no-empty-function": "off",
		},
	},
];
