const bcrypt = require("bcryptjs");

exports.seed = async function (knex) {
  await knex("users").del();

  const hashedPassword = await bcrypt.hash("123456", 10);

  await knex("users").insert([
    {
      first_name: "Admin",
      last_name: "User",
      email: "admin@example.com",
      password: hashedPassword,
      phone: "9999999999",
      is_verified: true,
      gender: "male",
      dob: "1990-01-01",
    },
  ]);
};