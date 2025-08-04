export async function up(knex) {
  await knex.schema.alterTable('book', (table) => {
    table.string('cover', 500).nullable().after('description');
  });
}

export async function down(knex) {
  await knex.schema.alterTable('book', (table) => {
    table.dropColumn('cover');
  });
}
