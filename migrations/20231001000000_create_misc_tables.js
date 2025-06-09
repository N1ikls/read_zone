export async function up(knex) {
  await knex.schema.createTable('faq', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.integer('number').unsigned().notNullable();
    table.string('name', 255).notNullable();
    table.text('content', 'mediumtext').notNullable();

    table.unique('number');
  });

  await knex.schema.createTable('news', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').unsigned().notNullable().references('user.id');

    table.string('name', 255).notNullable();
    table.text('content', 'mediumtext').notNullable();

    table.index('created_at');
  });

  await knex.schema.createTable('pay', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.uuid('created_by').unsigned().notNullable().references('user.id');

    table.datetime('updated_at').nullable();
    table.uuid('updated_by').unsigned().nullable().references('user.id');

    table.enu('type', ['chapters']).notNullable();
    table.boolean('payed').default(false);
    table.text('details', 'mediumtext').notNullable();

    table.index('type');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('pay');
  await knex.schema.dropTable('news');
  await knex.schema.dropTable('faq');
}
