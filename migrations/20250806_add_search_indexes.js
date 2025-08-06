/**
 * Миграция для добавления индексов для оптимизации поиска манги
 * Создает индексы для полнотекстового поиска и улучшения производительности
 */

export const up = async (knex) => {
  console.log('🔍 Создание индексов для оптимизации поиска...');

  // 1. Создаем GIN индекс для полнотекстового поиска по названию книги
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_book_name_gin 
    ON book USING gin(to_tsvector('russian', name))
  `);

  // 2. Создаем GIN индекс для полнотекстового поиска по альтернативному названию
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_book_alt_name_gin 
    ON book USING gin(to_tsvector('russian', COALESCE(alt_name, '')))
  `);

  // 3. Создаем GIN индекс для полнотекстового поиска по описанию
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_book_description_gin 
    ON book USING gin(to_tsvector('russian', COALESCE(description, '')))
  `);

  // 4. Создаем индекс для поиска по имени автора
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_author_name_gin 
    ON author USING gin(to_tsvector('russian', name))
  `);

  // 5. Создаем составной индекс для быстрого поиска по статусу и типу
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_book_status_type 
    ON book (status, type)
  `);

  // 6. Создаем индекс для сортировки по дате обновления
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_book_updated_at 
    ON book (updated_at DESC)
  `);

  // 7. Создаем индекс для сортировки по рейтингу
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_book_rate 
    ON book (rate DESC) WHERE rate IS NOT NULL
  `);

  // 8. Создаем индекс для поиска по году
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_book_year 
    ON book (year) WHERE year IS NOT NULL
  `);

  // 9. Создаем индекс для связи книга-автор (если еще не существует)
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_book_author_id 
    ON book (author_id)
  `);

  // 10. Создаем индекс для связи книга-переводчик
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_book_translator_id 
    ON book (translator_id)
  `);

  // 11. Создаем функциональный индекс для case-insensitive поиска по названию
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_book_name_lower 
    ON book (LOWER(name))
  `);

  // 12. Создаем функциональный индекс для case-insensitive поиска по имени автора
  await knex.raw(`
    CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_author_name_lower 
    ON author (LOWER(name))
  `);

  console.log('✅ Индексы для поиска созданы успешно');
};

export const down = async (knex) => {
  console.log('🗑️ Удаление индексов поиска...');

  // Удаляем все созданные индексы
  const indexes = [
    'idx_book_name_gin',
    'idx_book_alt_name_gin', 
    'idx_book_description_gin',
    'idx_author_name_gin',
    'idx_book_status_type',
    'idx_book_updated_at',
    'idx_book_rate',
    'idx_book_year',
    'idx_book_author_id',
    'idx_book_translator_id',
    'idx_book_name_lower',
    'idx_author_name_lower'
  ];

  for (const index of indexes) {
    await knex.raw(`DROP INDEX CONCURRENTLY IF EXISTS ${index}`);
  }

  console.log('✅ Индексы поиска удалены');
};
