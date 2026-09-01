require("@rushstack/eslint-patch/modern-module-resolution")

module.exports = {
	root: true,
	env: {
		browser: true,
		amd: true,
		node: true
	},
	globals: {
		NodeJS: true
	},
	extends: [
		"plugin:vue/vue3-essential",
		"eslint:recommended",
		"@vue/eslint-config-typescript",
		"plugin:prettier/recommended"
	],
	overrides: [
		{
			files: ["cypress/e2e/**.{cy,spec}.{js,ts,jsx,tsx}"],
			extends: ["plugin:cypress/recommended"]
		}
	],
	parserOptions: {
		ecmaVersion: "latest"
	},
	rules: {
		"vue/multi-word-component-names": "off",

		// eslintno-extra-semi
		"no-extra-semi": "off",

		"prettier/prettier": "error",
		"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

		"no-unused-vars": "warn",

		// eslintvue/require-valid-default-prop
		"vue/require-valid-default-prop": "off",

		"vue/attributes-order": [
			"error",
			{
				order: [
					"DEFINITION",
					"LIST_RENDERING",
					"CONDITIONALS",
					"RENDER_MODIFIERS",
					"GLOBAL",
					"UNIQUE",
					"TWO_WAY_BINDING",
					"OTHER_DIRECTIVES",
					"OTHER_ATTR",
					"EVENTS",
					"CONTENT"
				],
				alphabetical: true
			}
		]
	}
}
