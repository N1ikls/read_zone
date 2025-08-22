export async function up(knex) {
  // Таблица уведомлений (расширенная версия)
  // Сначала удаляем старую версию если она существует
  await knex.schema.dropTableIfExists('notifications');

  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table
      .uuid('user_id')
      .unsigned()
      .notNullable()
      .references('user.id')
      .onDelete('CASCADE');

    table
      .enu('type', [
        'user_new_book', // Новая книга от подписки
        'user_new_chapter', // Новая глава от подписки
        'user_book_status', // Изменение статуса книги подписки
        'book_new_chapter', // Новая глава в закладке
        'book_updated', // Обновление книги в закладке
        'book_rating_changed', // Изменение рейтинга книги
        'comment_reply', // Ответ на комментарий
        'comment_on_content', // Комментарий к нашему контенту
        'comment_liked', // Лайк комментария
        'system_moderation', // Модерация контента
        'system_announcement', // Объявления системы
        'system_maintenance', // Технические работы
      ])
      .notNullable();

    table.string('title', 255).notNullable();
    table.text('message').notNullable();
    table.boolean('is_read').notNullable().defaultTo(false);

    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());

    // Связанная сущность (книга, глава, комментарий и т.д.)
    table.uuid('related_entity_id').nullable();
    table
      .enu('related_entity_type', ['book', 'chapter', 'comment', 'user'])
      .nullable();

    // Дополнительные данные в JSON формате
    table.json('metadata').nullable();

    // Индексы для производительности
    table.index('user_id');
    table.index(['user_id', 'is_read']);
    table.index(['user_id', 'created_at']);
    table.index('type');
    table.index('created_at');
    table.index(['related_entity_id', 'related_entity_type']);
  });

  // Таблица настроек уведомлений пользователей
  await knex.schema.createTable('user_notification_settings', (table) => {
    table.uuid('user_id').primary().references('user.id').onDelete('CASCADE');

    // Настройки для каждого типа уведомлений
    table.boolean('user_new_book_enabled').notNullable().defaultTo(true);
    table.boolean('user_new_chapter_enabled').notNullable().defaultTo(true);
    table.boolean('user_book_status_enabled').notNullable().defaultTo(true);
    table.boolean('book_new_chapter_enabled').notNullable().defaultTo(true);
    table.boolean('book_updated_enabled').notNullable().defaultTo(true);
    table.boolean('book_rating_changed_enabled').notNullable().defaultTo(false);
    table.boolean('comment_reply_enabled').notNullable().defaultTo(true);
    table.boolean('comment_on_content_enabled').notNullable().defaultTo(true);
    table.boolean('comment_liked_enabled').notNullable().defaultTo(false);
    table.boolean('system_moderation_enabled').notNullable().defaultTo(true);
    table.boolean('system_announcement_enabled').notNullable().defaultTo(true);
    table.boolean('system_maintenance_enabled').notNullable().defaultTo(true);

    // Email уведомления
    table.boolean('email_notifications_enabled').notNullable().defaultTo(false);
    table.boolean('email_digest_enabled').notNullable().defaultTo(false);
    table
      .enu('email_digest_frequency', ['daily', 'weekly', 'monthly'])
      .defaultTo('weekly');

    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.datetime('updated_at').nullable();
  });

  // Таблица для группировки уведомлений (например, "5 новых глав от автора X")
  await knex.schema.createTable('notification_groups', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table
      .uuid('user_id')
      .unsigned()
      .notNullable()
      .references('user.id')
      .onDelete('CASCADE');
    table.string('group_key', 255).notNullable(); // Ключ для группировки
    table.string('title', 255).notNullable();
    table.text('summary').notNullable();
    table.integer('count').notNullable().defaultTo(1);
    table.boolean('is_read').notNullable().defaultTo(false);

    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.datetime('updated_at').notNullable().defaultTo(knex.fn.now());

    table.index('user_id');
    table.index(['user_id', 'group_key']);
    table.index(['user_id', 'is_read']);
    table.unique(['user_id', 'group_key']);
  });
}

export async function down(knex) {
  await knex.schema.dropTable('notification_groups');
  await knex.schema.dropTable('user_notification_settings');
  await knex.schema.dropTable('notifications');
}
