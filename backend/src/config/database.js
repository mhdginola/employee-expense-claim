const { Pool } = require("pg");
require("dotenv").config();

// Gunakan variabel env terpisah untuk host, port, user, password, database
const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: 5432,
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "",
  database: process.env.PGDATABASE || "medical_claim_db",
  ssl: { rejectUnauthorized: false },
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
