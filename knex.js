import knex from 'knex';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  client: 'pg',
  connection: {
    port: 5432,
    host: '127.0.0.1',
    user: 'kiforenko_na',
    database: 'db_test',
  },
  migrations: {
    directory: __dirname + '/migrations',
  },
  seeds: {
    directory: __dirname + '/seeds',
  },
};
