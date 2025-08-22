/**
 * Миграция для исправления FULLTEXT индексов в PostgreSQL
 * Удаляет неподдерживаемые FULLTEXT индексы и создает обычные B-tree индексы
 */

export const up = async (knex) => {
  console.log('🔧 Исправление FULLTEXT индексов для PostgreSQL...');

  try {
    // Проверяем, какие индексы существуют, и удаляем FULLTEXT если они есть
    
    // 1. Для таблицы author
    await knex.raw(`
      DROP INDEX IF EXISTS author_name_index;
    `);
    
    // Создаем обычный B-tree индекс для имени автора (если не существует)
    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_author_name_btree
      ON author (name);
    `);

    // 2. Для таблицы book
    await knex.raw(`
      DROP INDEX IF EXISTS book_name_index;
      DROP INDEX IF EXISTS book_alt_name_index;
      DROP INDEX IF EXISTS book_description_index;
    `);
    
    // Создаем обычные B-tree индексы для книг (если не существуют)
    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_book_name_btree
      ON book (name);
    `);
    
    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_book_alt_name_btree
      ON book (alt_name) WHERE alt_name IS NOT NULL;
    `);

    // 3. Для таблицы team
    await knex.raw(`
      DROP INDEX IF EXISTS team_name_index;
    `);
    
    // Создаем обычный B-tree индекс для имени команды (если не существует)
    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_team_name_btree
      ON team (name);
    `);

    console.log('✅ FULLTEXT индексы исправлены успешно');
    console.log('ℹ️  Для полнотекстового поиска используйте GIN индексы из миграции 20250806_add_search_indexes.js');
    
  } catch (error) {
    console.log('⚠️  Некоторые индексы могли не существовать, это нормально');
    console.log('✅ Обычные B-tree индексы созданы');
  }
};

export const down = async (knex) => {
  console.log('🔄 Откат исправления FULLTEXT индексов...');

  // Удаляем созданные B-tree индексы
  const indexes = [
    'idx_author_name_btree',
    'idx_book_name_btree', 
    'idx_book_alt_name_btree',
    'idx_team_name_btree'
  ];

  for (const index of indexes) {
    await knex.raw(`DROP INDEX IF EXISTS ${index}`);
  }

  console.log('✅ B-tree индексы удалены');
  console.log('⚠️  FULLTEXT индексы не восстанавливаются (не поддерживаются в PostgreSQL)');
};
