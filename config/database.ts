// Конфигурация базы данных с использованием переменных окружения
export const databaseConfig = {
  client: 'pg',
  connection: {
    host: process.env.VITE_DB_HOST || 'localhost',
    port: parseInt(process.env.VITE_DB_PORT || '5432'),
    user: process.env.VITE_DB_USER || 'postgres',
    password: process.env.VITE_DB_PASSWORD || 'postgres',
    database: process.env.VITE_DB_NAME || 'read_zone_db',
  },
  migrations: {
    directory: './migrations',
    loadExtensions: ['.js'],
  },
  seeds: {
    directory: './seeds',
    loadExtensions: ['.js'],
  },
};
