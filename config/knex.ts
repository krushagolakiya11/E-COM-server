import knex from "knex";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const config = require("../knexfile");

const db = knex(config.development);

export default db;