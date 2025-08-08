/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
  await knex.schema.alterTable('book', (table) => {
    table.text('typography_settings').nullable().comment('JSON настройки типографики для книги');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
  await knex.schema.alterTable('book', (table) => {
    table.dropColumn('typography_settings');
  });
};
