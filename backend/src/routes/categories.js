import express from "express";
import { query } from "../config/database.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// Get all categories
router.get("/", auth(), async (req, res) => {
  try {
    const { rows } = await query(
      "SELECT id, name FROM categories ORDER BY name ASC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
