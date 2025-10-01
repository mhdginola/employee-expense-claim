import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: 5432,
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "",
  database: process.env.PGDATABASE || "medical_claim_db",
  ssl: { rejectUnauthorized: false },
});

export const query = (text, params) => pool.query(text, params);
export { pool };
