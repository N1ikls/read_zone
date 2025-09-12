// Конфигурация базы данных с использованием переменных окружения
export const databaseConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres', 
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'read_zone_db',
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
