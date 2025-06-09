export async function up(knex) {
  await knex.schema.createTable('fandom', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.string('name', 255).notNullable();

    table.unique('name');
  });

  await knex.schema.createTable('genre', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.string('name', 255).notNullable();

    table.unique('name');
  });

  await knex.schema.createTable('tag', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));

    table.string('name', 255).notNullable();

    table.unique('name');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('tag');
  await knex.schema.dropTable('genre');
  await knex.schema.dropTable('fandom');
}
