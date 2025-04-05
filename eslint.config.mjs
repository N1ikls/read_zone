// @ts-check
import { rules } from 'eslint-plugin-prettier';
import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt(
  // Your custom configs here
  {
    rules: {
      'vue/no-multiple-objects-in-class': ['error'],
    },
  },
);
