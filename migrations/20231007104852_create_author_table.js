export async function up(knex) {
  await knex.schema.createTable('author', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').unsigned().notNullable().references('user.id');

    table.datetime('updated_at').nullable();
    table.uuid('updated_by').unsigned().nullable().references('user.id');

    table.string('name', 255).notNullable();
    table.date('birth_date').nullable();
    table.string('avatar', 255).nullable();

    table.integer('books_count').notNullable().defaultTo(0);
    table.integer('chapters_in_month').notNullable().defaultTo(0);
    table.integer('likers_count').notNullable().defaultTo(0);
    table.integer('subscribers_count').notNullable().defaultTo(0);

    table.index('name', null, { indexType: 'FULLTEXT' });
    table.unique('avatar');
  });

  await knex.schema.createTable('author_social', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.uuid('author_id').unsigned().notNullable().references('author.id');
    table.string('uri', 255).notNullable();
    table.string('name', 255).nullable();
    table.enu('type', ['vk']).nullable();

    table.unique(['author_id', 'uri']);
  });

  await knex.schema.createTable('author_liker', (table) => {
    table.uuid('author_id').unsigned().notNullable().references('author.id');
    table.uuid('liker_id').unsigned().notNullable().references('user.id');

    table.primary(['author_id', 'liker_id']);
    table.index('liker_id');
  });

  await knex.schema.createTable('author_subscriber', (table) => {
    table.uuid('author_id').unsigned().notNullable().references('author.id');
    table.uuid('subscriber_id').unsigned().notNullable().references('user.id');

    table.primary(['author_id', 'subscriber_id']);
    table.index('subscriber_id');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('author_subscriber');
  await knex.schema.dropTable('author_liker');
  await knex.schema.dropTable('author_social');
  await knex.schema.dropTable('author');
}
