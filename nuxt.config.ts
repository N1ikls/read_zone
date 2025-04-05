export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxt/content',
    '@ant-design-vue/nuxt',
  ],
  antd: {
    extractStyle: true,
  },
  app: {
    head: {
      title: 'ReadZone',
      htmlAttrs: {
        lang: 'en',
      },
      link: [{ rel: 'icon', type: 'image/png', href: '/head.png' }],
    },
  },
});
