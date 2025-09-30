export async function up(knex) {
  await knex.schema.createTable('team_application', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    
    table.uuid('team_id').unsigned().notNullable().references('team.id').onDelete('CASCADE');
    table.uuid('user_id').unsigned().notNullable().references('user.id').onDelete('CASCADE');
    
    table.text('message').nullable();
    table.enu('status', ['pending', 'approved', 'rejected']).notNullable().default('pending');
    
    table.uuid('reviewed_by').unsigned().nullable().references('user.id');
    table.text('admin_comment').nullable();
    
    table.datetime('created_at').notNullable().defaultTo(knex.fn.now());
    table.datetime('reviewed_at').nullable();
    
    table.unique(['team_id', 'user_id']);
    
    table.index('team_id');
    table.index('user_id');
    table.index('status');
    table.index('created_at');
  });
}

export async function down(knex) {
  await knex.schema.dropTable('team_application');
}
