import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  client: 'pg',
  connection: {
    host: process.env.VITE_DB_HOST || 'localhost',
    port: parseInt(process.env.VITE_DB_PORT || '5432'),
    user: process.env.VITE_DB_USER || 'postgres',
    password: process.env.VITE_DB_PASSWORD || 'postgres',
    database: process.env.VITE_DB_NAME || 'read_zone_db',
  },
  migrations: {
    directory: __dirname + '/migrations',
    loadExtensions: ['.js'],
  },
  seeds: {
    directory: __dirname + '/seeds',
    loadExtensions: ['.js'],
  },
};
