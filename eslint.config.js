// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginAstro from 'eslint-plugin-astro';
import eslintConfigPrettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strict,
  ...eslintPluginAstro.configs['flat/recommended'],
  {
    ignores: ['dist/**', '.astro/**', 'node_modules/**'],
  },
  {
    files: ['src/scripts/**/*.js', 'public/assets/js/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        echarts: 'readonly',
      },
    },
  },
  eslintConfigPrettier,
);
