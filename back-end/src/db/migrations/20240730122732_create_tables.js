exports.up = function(knex) {
  return knex.schema.createTable('tables', table => {
    table.increments('table_id').primary();
    table.string('table_name').notNullable();
    table.integer('capacity').notNullable();
    table.integer('reservation_id').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('tables');
};
