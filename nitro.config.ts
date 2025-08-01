export default defineNitroConfig({
  experimental: {
    wasm: true
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
      'connect-session-knex'
    ]
  },
  esbuild: {
    options: {
      target: 'es2022'
    }
  },
  alias: {
    'bcrypt': 'unenv/runtime/mock/proxy',
    'mysql': 'unenv/runtime/mock/proxy',
    'mysql2': 'unenv/runtime/mock/proxy',
    'pg': 'unenv/runtime/mock/proxy',
    'knex': 'unenv/runtime/mock/proxy'
  }
})
