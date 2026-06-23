const js = require('@eslint/js');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');

// Flat config (ESLint 9). Replaces the legacy .eslintrc — same rule set as before:
// eslint:recommended + @typescript-eslint eslint-recommended + recommended, with no-explicit-any off.
// Only src TypeScript is linted; built output (lib/), tests, and one-off scripts are ignored
// (the old `eslint . --ext .ts` also walked built lib/*.d.ts, which is what broke CI).
module.exports = [
    {
        ignores: ['lib/**', 'node_modules/**', 'coverage/**', 'src/scripts/**', '**/*.test.ts', '**/*.test.cjs']
    },
    js.configs.recommended,
    {
        // This config file (and any other CommonJS .js) — give it CommonJS module scope.
        files: ['**/*.js'],
        languageOptions: { sourceType: 'commonjs', ecmaVersion: 2022 }
    },
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: 'module'
        },
        plugins: {
            '@typescript-eslint': tsPlugin
        },
        rules: {
            ...tsPlugin.configs['eslint-recommended'].overrides[0].rules,
            ...tsPlugin.configs.recommended.rules,
            '@typescript-eslint/no-explicit-any': 'off'
        }
    }
];
