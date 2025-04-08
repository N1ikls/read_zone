export default defineNuxtConfig({
  devtools: { enabled: true },
  devServer: {
    port: 3001,
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@ant-design-vue/nuxt',
  ],

  antd: {
    extractStyle: true,
  },

  vue: {
    propsDestructure: true,
  },
  nitro: {
    devStorage: {
      cache: { driver: 'memory' }, // Использует RAM вместо файлового кеша
    },
  },
  vite: {
    server: {
      hmr: { overlay: false }, // Отключить HMR overlay, если мешает
    },
  },
  css: ['./public/app.scss'],

  app: {
    head: {
      title: 'ReadZone',
      htmlAttrs: {
        lang: 'en',
      },
      link: [{ rel: 'icon', type: 'image/png', href: '/head.png' }],
    },
  },

  compatibilityDate: '2025-04-07',
});
