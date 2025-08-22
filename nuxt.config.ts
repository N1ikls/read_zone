export default defineNuxtConfig({
  devtools: { enabled: true },
  ssr: true,
  devServer: {
    port: 3001,
    host: 'localhost', // Используем localhost для лучшей совместимости
  },
  modules: [
    '@nuxt/eslint',
    'nuxt-swiper',
    '@pinia/nuxt',
    '@nuxt/ui',
    'nuxt-rating',
    '@nuxt/image',
  ],
  colorMode: {
    preference: 'light',
    storage: 'localStorage',
  },

  components: [
    {
      path: '~/components',
      pathPrefix: false,
      extensions: ['.vue'],
    },
    {
      path: '~/widgest',
      pathPrefix: false,
      extensions: ['.vue'],
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
  ui: {
    fonts: false,
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

  nitro: {
    preset: 'cloudflare-pages',
    experimental: {
      wasm: true,
    },
    rollupConfig: {
      external: [
        'mock-aws-s3',
        'aws-sdk',
        'nock',
        'bcrypt',
        'mysql',
        'mysql2',
        'pg',
        'knex',
        'express',
        'express-session',
        'connect-session-knex',
      ],
    },
    esbuild: {
      options: {
        target: 'es2022',
      },
    },
    alias: {
      bcrypt: 'unenv/runtime/mock/proxy',
      mysql: 'unenv/runtime/mock/proxy',
      mysql2: 'unenv/runtime/mock/proxy',
      pg: 'unenv/runtime/mock/proxy',
      knex: 'unenv/runtime/mock/proxy',
    },
    unenv: {
      polyfill: ['buffer', 'process', 'util'],
    },
  },

  compatibilityDate: '2025-04-07',
});
