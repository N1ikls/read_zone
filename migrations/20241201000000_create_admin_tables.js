export async function up(knex) {
  // Таблица банов пользователей
  await knex.schema.createTable('user_bans', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    table.uuid('user_id').unsigned().notNullable().references('user.id').onDelete('CASCADE');
    table.uuid('banned_by').unsigned().notNullable().references('user.id');
    
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.datetime('expires_at').nullable(); // null = перманентный бан
    
    table.enu('type', ['full', 'mute', 'workshop', 'comments', 'forum', 'chat', 'messages']).notNullable().default('mute');
    table.text('reason').notNullable();
    table.boolean('is_active').notNullable().default(true);
    
    table.index('user_id');
    table.index('banned_by');
    table.index('expires_at');
    table.index('is_active');
  });

  // Таблица жалоб
  await knex.schema.createTable('complaints', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    table.uuid('user_id').unsigned().notNullable().references('user.id').onDelete('CASCADE'); // кто пожаловался
    table.uuid('target_user_id').unsigned().nullable().references('user.id').onDelete('CASCADE'); // на кого жалоба
    table.uuid('target_book_id').unsigned().nullable().references('book.id').onDelete('CASCADE'); // на какую книгу
    table.uuid('target_chapter_id').unsigned().nullable().references('chapter.id').onDelete('CASCADE'); // на какую главу
    table.uuid('target_comment_id').unsigned().nullable(); // на какой комментарий
    
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.datetime('updated_at').nullable();
    table.uuid('handled_by').unsigned().nullable().references('user.id'); // кто обработал
    
    table.enu('type', ['user', 'book', 'chapter', 'comment', 'copyright', 'spam', 'inappropriate', 'other']).notNullable();
    table.enu('status', ['pending', 'in_progress', 'resolved', 'rejected']).notNullable().default('pending');
    
    table.text('reason').notNullable(); // причина жалобы
    table.text('admin_comment').nullable(); // комментарий администратора
    
    table.index('user_id');
    table.index('target_user_id');
    table.index('target_book_id');
    table.index('status');
    table.index('type');
    table.index('created_at');
  });

  // Таблица уведомлений
  await knex.schema.createTable('notifications', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    table.uuid('user_id').unsigned().notNullable().references('user.id').onDelete('CASCADE');
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    
    table.enu('type', ['comment', 'book_update', 'system', 'team', 'report', 'follow']).notNullable();
    table.string('title', 255).notNullable();
    table.text('content').notNullable();
    table.json('data').nullable(); // дополнительные данные (ID книги, главы и т.д.)
    
    table.boolean('is_read').notNullable().default(false);
    
    table.index('user_id');
    table.index('type');
    table.index('is_read');
    table.index('created_at');
  });

  // Таблица заброшенных работ (запросы на перевод)
  await knex.schema.createTable('abandoned_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    table.uuid('user_id').unsigned().notNullable().references('user.id').onDelete('CASCADE'); // кто запрашивает
    table.uuid('book_id').unsigned().notNullable().references('book.id').onDelete('CASCADE'); // какую книгу
    table.uuid('handled_by').unsigned().nullable().references('user.id'); // кто обработал
    
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.datetime('updated_at').nullable();
    
    table.enu('status', ['pending', 'approved', 'rejected']).notNullable().default('pending');
    table.text('reason').notNullable(); // почему хочет взять перевод
    table.text('admin_comment').nullable();
    
    table.index('user_id');
    table.index('book_id');
    table.index('status');
    table.index('created_at');
  });

  // Таблица логов действий администраторов
  await knex.schema.createTable('admin_logs', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    table.uuid('admin_id').unsigned().notNullable().references('user.id').onDelete('CASCADE');
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    
    table.enu('action', ['ban', 'unban', 'delete_book', 'delete_comment', 'resolve_complaint', 'grant_role', 'revoke_role']).notNullable();
    table.uuid('target_user_id').unsigned().nullable().references('user.id').onDelete('SET NULL');
    table.uuid('target_book_id').unsigned().nullable().references('book.id').onDelete('SET NULL');
    
    table.text('details').nullable(); // детали действия
    table.json('data').nullable(); // дополнительные данные
    
    table.index('admin_id');
    table.index('action');
    table.index('created_at');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('admin_logs');
  await knex.schema.dropTable('abandoned_requests');
  await knex.schema.dropTable('notifications');
  await knex.schema.dropTable('complaints');
  await knex.schema.dropTable('user_bans');
}
