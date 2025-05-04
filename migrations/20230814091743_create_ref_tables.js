export async function up(knex) {
  const hasFandomTable = await knex.schema.hasTable('fandom');
  if (!hasFandomTable) {
    await knex.schema.createTable('fandom', (table) => {
      table.bigIncrements('id');
      table.string('name', 255).notNullable();
      table.unique('name');
    });
  }

  const hasGenreTable = await knex.schema.hasTable('genre');
  if (!hasGenreTable) {
    await knex.schema.createTable('genre', (table) => {
      table.bigIncrements('id');
      table.string('name', 255).notNullable();
      table.unique('name');
    });
  }

  const hasTagTable = await knex.schema.hasTable('tag');
  if (!hasTagTable) {
    await knex.schema.createTable('tag', (table) => {
      table.bigIncrements('id');
      table.string('name', 255).notNullable();
      table.unique('name');
    });
  }
}
export async function down(knex) {
  await knex.schema.dropTable('fandom');
  await knex.schema.dropTable('genre');
  await knex.schema.dropTable('tag');
}
