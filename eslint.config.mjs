import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  rules: {
    'vue/no-multiple-objects-in-class': ['error'],
    'vue/component-options-name-casing': ['error', 'PascalCase'],
    'vue/component-name-in-template-casing': [
      'error',
      'kebab-case',
      {
        registeredComponentsOnly: true,
        ignores: [],
      },
    ],
  },

  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:boundaries/recommended',
    '@vue/airbnb',
    '@vue/eslint-config-typescript',
    '@vue/eslint-config-prettier',
  ],
});
