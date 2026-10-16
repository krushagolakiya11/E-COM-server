exports.up = function(knex) {
  return knex.schema.createTable("products", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.text("description").notNullable();
    table.decimal("price").notNullable();
    table.integer("stock").notNullable();
    table.string("brand");
    table.string("image");

    table.integer("categories_id").unsigned().references("id").inTable("categories").onDelete("CASCADE");
    
    table.timestamp(true, true);

  })
};

exports.down = function(knex) {
  
};
