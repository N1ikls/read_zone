export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  devServer: {
    port: 3001,
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    'nuxt-swiper',
    '@pinia/nuxt',
    '@nuxt/ui',
    'nuxt-rating',
  ],
  ui: {
    colorMode: false,
  },
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    },
  ],
  vue: {
    propsDestructure: true,
  },
  css: ['./public/app.scss', '~/assets/css/main.css'],
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
