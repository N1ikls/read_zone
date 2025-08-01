export async function up(knex) {
  // Создаем таблицу команд, если её нет
  const exists = await knex.schema.hasTable('team');
  
  if (!exists) {
    await knex.schema.createTable('team', (table) => {
      table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
      
      table.string('name', 255).notNullable();
      table.text('description').nullable();
      table.string('avatar', 500).nullable();
      
      table.uuid('creator_id').unsigned().notNullable().references('user.id').onDelete('CASCADE');
      
      table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
      table.datetime('updated_at').nullable();
      
      table.integer('members_count').notNullable().default(1);
      table.integer('books_count').notNullable().default(0);
      
      table.boolean('is_active').notNullable().default(true);
      table.boolean('is_public').notNullable().default(true);
      
      table.index('creator_id');
      table.index('is_active');
      table.index('is_public');
      table.index('created_at');
    });
    
    console.log('✅ Таблица team создана');
  } else {
    console.log('ℹ️ Таблица team уже существует');
  }
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('team');
}
