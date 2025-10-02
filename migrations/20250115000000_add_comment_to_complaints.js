export async function up(knex) {
  await knex.schema.alterTable('complaints', (table) => {
    table.text('comment').nullable(); // комментарий пользователя к жалобе
  });
}

export async function down(knex) {
  await knex.schema.alterTable('complaints', (table) => {
    table.dropColumn('comment');
  });
}
