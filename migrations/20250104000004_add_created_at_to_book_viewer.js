export async function up(knex) {
  // Добавляем поле created_at в таблицу book_viewer для отслеживания времени просмотров
  await knex.schema.alterTable('book_viewer', (table) => {
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    
    // Добавляем индекс для оптимизации запросов по времени
    table.index('created_at');
  });

  // Изменяем первичный ключ, чтобы разрешить множественные просмотры одной книги одним пользователем
  // Сначала удаляем старый первичный ключ
  await knex.schema.alterTable('book_viewer', (table) => {
    table.dropPrimary();
  });

  // Добавляем новый составной первичный ключ с created_at для уникальности записей
  await knex.raw(`
    ALTER TABLE book_viewer 
    ADD CONSTRAINT book_viewer_pkey 
    PRIMARY KEY (book_id, viewer_id, created_at)
  `);
}

export async function down(knex) {
  // Возвращаем обратно старый первичный ключ
  await knex.schema.alterTable('book_viewer', (table) => {
    table.dropPrimary();
  });

  await knex.raw(`
    ALTER TABLE book_viewer 
    ADD CONSTRAINT book_viewer_pkey 
    PRIMARY KEY (book_id, viewer_id)
  `);

  // Удаляем добавленные поля и индексы
  await knex.schema.alterTable('book_viewer', (table) => {
    table.dropIndex('created_at');
    table.dropColumn('created_at');
  });
}
