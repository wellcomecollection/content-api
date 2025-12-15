const eslint = require('@eslint/js');
const eslintConfigPrettier = require('eslint-config-prettier');
const eslintPluginImport = require('eslint-plugin-import');
const eslintPluginJest = require('eslint-plugin-jest');
const eslintPluginPrettier = require('eslint-plugin-prettier');
const globals = require('globals');
const tseslint = require('typescript-eslint');

const sharedRules = {
  'eol-last': 'error',
  'import/order': [
    'warn',
    {
      groups: [
        ['builtin', 'external'],
        ['internal', 'sibling', 'parent', 'index'],
      ],
      pathGroups: [
        {
          pattern: '@weco/**',
          group: 'external',
          position: 'after',
        },
      ],
      pathGroupsExcludedImportTypes: ['builtin', 'object'],
      alphabetize: {
        order: 'asc',
        caseInsensitive: true,
      },
      'newlines-between': 'always',
    },
  ],
  'no-mixed-operators': 'warn',
  'no-multi-spaces': 'warn',
  'no-multi-str': 'off',
  'no-restricted-imports': [
    'error',
    { patterns: ['../*'] }, // Should only import relatively from same directory
  ],
  'no-restricted-syntax': [
    'error',
    "JSXElement.children > [expression.callee.property.name='stringify']",
  ],
  'no-return-assign': 'off',
  'prettier/prettier': 'error',
  'sort-imports': [
    'error',
    {
      ignoreCase: true,
      ignoreDeclarationSort: true,
    },
  ],
};

module.exports = [
  // Global ignores
  {
    ignores: [
      '**/node_modules/',
      '**/libs/',
      '**/lib/',
      '**/_next/',
      '**/dist/',
      '**/.terraform/',
    ],
  },
  // Global linter options
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  // Base config for JS files
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: require('@babel/eslint-parser'),
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        requireConfigFile: false,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      import: eslintPluginImport,
      jest: eslintPluginJest,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...eslint.configs.recommended.rules,
      ...sharedRules,
    },
  },
  // TypeScript config
  ...tseslint.configs.recommended.map(config => ({
    ...config,
    files: ['**/*.ts'],
  })),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: eslintPluginImport,
      jest: eslintPluginJest,
      prettier: eslintPluginPrettier,
    },
    rules: {
      ...sharedRules,
      'no-use-before-define': 'off',
      '@typescript-eslint/array-type': ['error'],
      '@typescript-eslint/no-use-before-define': [
        'error',
        { functions: false },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true },
      ],
      'jest/no-standalone-expect': [
        'error',
        { additionalTestBlockFunctions: ['each.test'] },
      ],
    },
  },
  // Jest test files
  {
    files: ['**/*test.ts'],
    plugins: {
      jest: eslintPluginJest,
    },
    rules: {
      ...eslintPluginJest.configs.recommended.rules,
    },
  },
  // Webhook directory - disable restricted imports
  {
    files: ['webhook/**'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  // Prettier config (should be last)
  eslintConfigPrettier,
];
