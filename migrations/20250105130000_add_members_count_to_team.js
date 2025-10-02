export async function up(knex) {
  await knex.schema.alterTable('team', (table) => {
    table.integer('members_count').notNullable().defaultTo(0);
  });
}

export async function down(knex) {
  await knex.schema.alterTable('team', (table) => {
    table.dropColumn('members_count');
  });
}
