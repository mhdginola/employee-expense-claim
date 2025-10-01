import { Router } from "express";
const router = Router();
import { query } from "../config/database.js";
import { compare } from "bcrypt";
import pkg from "jsonwebtoken";
const { sign } = pkg;
import dotenv from "dotenv";

dotenv.config();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const { rows } = await query("SELECT * FROM users WHERE username=$1", [
      username,
    ]);
    if (!rows[0]) return res.status(401).json({ error: "Invalid credentials" });
    const user = rows[0];
    const ok = await compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });
    const token = sign(
      {
        id: user.id,
        username: user.username,
        manager_id: user.manager_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        manager_id: user.manager_id,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
