const sharedPlugins = ["import", "jest", "prettier", "standard"];

const sharedExtends = [
  "standard",
  "plugin:jest-playwright/recommended",
  "prettier",
  "plugin:prettier/recommended", // Should be the last extension https://github.com/prettier/eslint-plugin-prettier#recommended-configuration
];

const sharedRules = {
  "eol-last": "error",
  "import/order": [
    "warn",
    {
      groups: [
        ["builtin", "external"],
        ["internal", "sibling", "parent", "index"],
      ],
      pathGroups: [
        {
          pattern: "@weco/**",
          group: "external",
          position: "after",
        },
      ],
      pathGroupsExcludedImportTypes: ["builtin", "object"],
      alphabetize: {
        order: "asc",
        caseInsensitive: true,
      },
      "newlines-between": "always",
    },
  ],
  "no-mixed-operators": "warn",
  "no-multi-spaces": "warn",
  "no-multi-str": "off",
  "no-restricted-imports": [
    "error",
    { patterns: ["../*"] }, // Should only import relatively from same directory
  ],
  "no-restricted-syntax": [
    "error",
    "JSXElement.children > [expression.callee.property.name='stringify']",
  ],
  "no-return-assign": "off",
  "prettier/prettier": "error",
  "sort-imports": [
    "error",
    {
      ignoreCase: true,
      ignoreDeclarationSort: true,
    },
  ],
};

module.exports = {
  parser: "@babel/eslint-parser",
  plugins: sharedPlugins,
  env: {
    "jest/globals": true,
  },
  extends: sharedExtends,
  rules: sharedRules,
  reportUnusedDisableDirectives: true,
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    requireConfigFile: false,
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      parser: "@typescript-eslint/parser",
      plugins: [...sharedPlugins, "@typescript-eslint"],
      extends: [
        ...sharedExtends,
        "plugin:@typescript-eslint/recommended",
        "plugin:jest-playwright/recommended",
      ],
      rules: {
        ...sharedRules,
        "no-use-before-define": "off",
        "@typescript-eslint/array-type": ["error"],
        "@typescript-eslint/no-use-before-define": [
          "error",
          { functions: false },
        ],
        "@typescript-eslint/no-unused-vars": [
          "error",
          { ignoreRestSiblings: true },
        ],
        "jest/no-standalone-expect": [
          "error",
          { additionalTestBlockFunctions: ["each.test"] },
        ],
      },
    },
    // Some directories don't have an absolute import equivalent so ignoring
    // import rules for them.
    {
      files: ["webhook/**"],
      rules: {
        "no-restricted-imports": "off",
      },
    },
  ],
};