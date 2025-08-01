import knex from 'knex';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  client: 'pg',
  connection: {
    port: 5432,
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'read_zone_db',
  },
  migrations: {
    directory: __dirname + '/migrations',
  },
  seeds: {
    directory: __dirname + '/seeds',
  },
};
