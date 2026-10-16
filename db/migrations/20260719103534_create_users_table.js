exports.up = function(knex){
  return knex.schema. createTable("users", (table) => {
    table.increments("id").primary();

    table.string("first_name", 100).notNullable();
    table.string("last_name", 100).notNullable();
    table.string("email", 200).notNullable().unique();
    table.string("password").notNullable();
    table.date("dob");
    table.enum("gender", ["male", "female", "other"]).notNullable();
    table.string("phone", 20).unique();
    table.boolean("is_verified").defaultTo(false);
    table.timestamp(true, true);
  });
};

exports.down = function(knex){
  return knex.schema.dropTableIfExists("users");
}

