import knex from 'knex';

const db = knex({
  client: 'pg',
  connection: {
    port: 5432,
    host: 'localhost',
    user: 'postgres',
    password: 'postgres',
    database: 'read_zone_db',
  }
});

async function createTables() {
  try {
    console.log('🗂️ Создание таблиц для системы уведомлений...');
    
    // Удаляем существующие таблицы если есть
    await db.schema.dropTableIfExists('notification_groups');
    await db.schema.dropTableIfExists('user_notification_settings');
    await db.schema.dropTableIfExists('notifications');
    
    console.log('🧹 Старые таблицы удалены');

    // Создаем таблицу уведомлений
    await db.schema.createTable('notifications', (table) => {
      table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
      table.uuid('user_id').unsigned().notNullable().references('user.id').onDelete('CASCADE');
      table.enu('type', [
        'user_new_book',        // Новая книга от подписки
        'user_new_chapter',     // Новая глава от подписки  
        'user_book_status',     // Изменение статуса книги подписки
        'book_new_chapter',     // Новая глава в закладке
        'book_updated',         // Обновление книги в закладке
        'book_rating_changed',  // Изменение рейтинга книги
        'comment_reply',        // Ответ на комментарий
        'comment_on_content',   // Комментарий к нашему контенту
        'comment_liked',        // Лайк комментария
        'system_moderation',    // Модерация контента
        'system_announcement',  // Объявления системы
        'system_maintenance'    // Технические работы
      ]).notNullable();
      table.string('title', 255).notNullable();
      table.text('message').notNullable();
      table.boolean('is_read').notNullable().defaultTo(false);
      table.datetime('created_at').notNullable().defaultTo(db.fn.now());
      table.uuid('related_entity_id').nullable();
      table.enu('related_entity_type', ['book', 'chapter', 'comment', 'user']).nullable();
      table.json('metadata').nullable();
      
      // Индексы для производительности
      table.index('user_id');
      table.index(['user_id', 'is_read']);
      table.index(['user_id', 'created_at']);
      table.index('type');
      table.index('created_at');
      table.index(['related_entity_id', 'related_entity_type']);
    });
    
    console.log('✅ Таблица notifications создана');

    // Создаем таблицу настроек уведомлений
    await db.schema.createTable('user_notification_settings', (table) => {
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
      table.enu('email_digest_frequency', ['daily', 'weekly', 'monthly']).defaultTo('weekly');
      
      table.datetime('created_at').notNullable().defaultTo(db.fn.now());
      table.datetime('updated_at').nullable();
    });
    
    console.log('✅ Таблица user_notification_settings создана');

    // Создаем таблицу для группировки уведомлений
    await db.schema.createTable('notification_groups', (table) => {
      table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
      table.uuid('user_id').unsigned().notNullable().references('user.id').onDelete('CASCADE');
      table.string('group_key', 255).notNullable(); // Ключ для группировки
      table.string('title', 255).notNullable();
      table.text('summary').notNullable();
      table.integer('count').notNullable().defaultTo(1);
      table.boolean('is_read').notNullable().defaultTo(false);
      
      table.datetime('created_at').notNullable().defaultTo(db.fn.now());
      table.datetime('updated_at').notNullable().defaultTo(db.fn.now());
      
      table.index('user_id');
      table.index(['user_id', 'group_key']);
      table.index(['user_id', 'is_read']);
      table.unique(['user_id', 'group_key']);
    });
    
    console.log('✅ Таблица notification_groups создана');
    
    // Проверяем созданные таблицы
    const tables = await db.raw("SELECT table_name FROM information_schema.tables WHERE table_name IN ('notifications', 'user_notification_settings', 'notification_groups')");
    console.log('📋 Созданные таблицы:', tables.rows.map(r => r.table_name));
    
    // Создаем настройки по умолчанию для существующих пользователей
    console.log('👥 Создание настроек по умолчанию для существующих пользователей...');
    await db.raw(`
      INSERT INTO user_notification_settings (user_id)
      SELECT id FROM "user"
      ON CONFLICT (user_id) DO NOTHING
    `);
    
    const settingsCount = await db('user_notification_settings').count('* as count').first();
    console.log(`✅ Настройки созданы для ${settingsCount.count} пользователей`);
    
  } catch (error) {
    console.error('❌ Ошибка при создании таблиц:', error);
  } finally {
    await db.destroy();
  }
}

createTables();
