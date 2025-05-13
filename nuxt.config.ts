export default defineNuxtConfig({
  devtools: { enabled: true },

  devServer: {
    port: 3001,
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/icon',
    '@nuxt/fonts',
    // '@sidebase/nuxt-session',
    // '@sidebase/nuxt-auth',
    '@ant-design-vue/nuxt',
    'nuxt-swiper',
    'nuxt-openapi-docs-module',
  ],
  // auth: {
  //   globalAppMiddleware: {
  //     isEnabled: false,
  //   },
  //   provider: {
  //     type: 'authjs',
  //   },
  // },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  antd: {
    extractStyle: true,
  },
  vue: {
    propsDestructure: true,
  },
  nitro: {
    devStorage: {
      cache: { driver: 'memory' },
    },
  },
  vite: {
    server: {
      hmr: { overlay: false },
    },
  },
  css: ['./public/app.scss'],
  icon: {
    provider: 'server',
    customCollections: [
      {
        prefix: 'my-icons',
        dir: './public/svg',
      },
    ],
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

  compatibilityDate: '2025-04-07',
});
