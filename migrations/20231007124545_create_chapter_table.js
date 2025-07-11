export async function up(knex) {
  await knex.schema.createTable('chapter', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').unsigned().notNullable().references('user.id');

    table.datetime('updated_at').nullable();
    table.uuid('updated_by').unsigned().nullable().references('user.id');

    table.uuid('book_id').unsigned().notNullable().references('book.id');

    table
      .enu('status', ['discarded', 'done', 'frozen', 'progress'])
      .notNullable()
      .default('progress');
    table.boolean('is_public').notNullable().default(false);
    table.string('volume', 255).nullable();
    table.integer('number').unsigned().notNullable();
    table.integer('price').unsigned().nullable();
    table.string('name', 255).nullable();
    table.text('content', 'mediumtext').notNullable();

    table.integer('likers_count').unsigned().notNullable().default(0);
    table.integer('viewers_count').unsigned().notNullable().default(0);

    table.unique(['book_id', 'number']);
    table.index('number');
  });

  await knex.schema.createTable('chapter_comment', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').unsigned().notNullable().references('user.id');

    table.datetime('updated_at').nullable();
    table.uuid('updated_by').unsigned().nullable().references('user.id');

    table
      .uuid('chapter_id')
      .unsigned()
      .notNullable()
      .references('chapter.id')
      .onDelete('CASCADE');
    table
      .uuid('parent_id')
      .unsigned()
      .nullable()
      .references('chapter_comment.id');

    table.integer('likers_count').unsigned().notNullable().default(0);
    table.integer('dislikers_count').unsigned().notNullable().default(0);

    table.text('content', 'mediumtext').notNullable();
  });

  await knex.schema.createTable('chapter_comment_liker', (table) => {
    table
      .uuid('chapter_comment_id')
      .unsigned()
      .notNullable()
      .references('chapter_comment.id')
      .onDelete('CASCADE');

    table.uuid('liker_id').unsigned().notNullable().references('user.id');
    table.boolean('positive').notNullable().default(true);

    table.primary(['chapter_comment_id', 'liker_id']);
    table.index('liker_id');
    table.index('positive');
  });

  await knex.schema.createTable('chapter_buyer', (table) => {
    table
      .uuid('chapter_id')
      .unsigned()
      .notNullable()
      .references('chapter.id')
      .onDelete('CASCADE');

    table.uuid('user_id').unsigned().notNullable().references('user.id');
    table.uuid('pay_id').unsigned().notNullable().references('pay.id');

    table.datetime('start_time').notNullable().defaultTo(knex.fn.now());
    table.datetime('end_time').nullable();

    table.unique(['user_id', 'chapter_id']);
    table.index(['start_time', 'end_time']);
  });

  await knex.schema.createTable('chapter_liker', (table) => {
    table
      .uuid('chapter_id')
      .unsigned()
      .notNullable()
      .references('chapter.id')
      .onDelete('CASCADE');

    table.uuid('liker_id').unsigned().notNullable().references('user.id');

    table.primary(['chapter_id', 'liker_id']);
    table.index('liker_id');
  });

  await knex.schema.createTable('chapter_viewer', (table) => {
    table
      .uuid('chapter_id')
      .unsigned()
      .notNullable()
      .references('chapter.id')
      .onDelete('CASCADE');

    table.uuid('viewer_id').unsigned().notNullable().references('user.id');

    table.primary(['chapter_id', 'viewer_id']);
    table.index('viewer_id');
  });

  await knex.schema.createTable('chapter_error', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table
      .uuid('chapter_id')
      .unsigned()
      .notNullable()
      .references('chapter.id')
      .onDelete('CASCADE');

    table.uuid('created_by').unsigned().notNullable().references('user.id');
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.boolean('fixed').notNullable().default(false);

    table.text('source', 'mediumtext').notNullable();
    table.text('correct', 'mediumtext').notNullable();

    table.integer('paragraph').unsigned().notNullable();
    table.integer('line').unsigned().notNullable();
  });
}

export async function down(knex) {
  await knex.schema.dropTable('chapter_error');
  await knex.schema.dropTable('chapter_viewer');
  await knex.schema.dropTable('chapter_liker');
  await knex.schema.dropTable('chapter_buyer');
  await knex.schema.dropTable('chapter_comment_liker');
  await knex.schema.dropTable('chapter_comment');
  await knex.schema.dropTable('chapter');
}
