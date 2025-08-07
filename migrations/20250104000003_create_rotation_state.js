/**
 * Migration: Create rotation_state table for managing cyclic rotations
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function up(knex) {
  return knex.schema.createTable('rotation_state', function (table) {
    table.increments('id').primary();
    table
      .string('rotation_key', 50)
      .notNullable()
      .unique()
      .comment('Unique key for rotation type (e.g., novelties)');
    table
      .integer('current_offset')
      .defaultTo(0)
      .notNullable()
      .comment('Current position in rotation cycle');
    table
      .integer('total_items')
      .defaultTo(0)
      .notNullable()
      .comment('Total number of items in rotation');
    table
      .integer('items_per_page')
      .defaultTo(4)
      .notNullable()
      .comment('Number of items per page');
    table
      .timestamp('last_updated')
      .defaultTo(knex.fn.now())
      .comment('Last time rotation was updated');
    table
      .timestamp('cycle_started_at')
      .defaultTo(knex.fn.now())
      .comment('When current cycle started');
    table
      .integer('cycle_count')
      .defaultTo(0)
      .notNullable()
      .comment('Number of completed cycles');
    table
      .json('metadata')
      .nullable()
      .comment('Additional metadata for rotation');
    table.timestamps(true, true);

    // Indexes for performance
    table.index(['rotation_key'], 'idx_rotation_state_key');
    table.index(['last_updated'], 'idx_rotation_state_updated');
  });
}

/**
 * @param {import('knex').Knex} knex
 * @returns {Promise<void>}
 */
export async function down(knex) {
  return knex.schema.dropTable('rotation_state');
}
