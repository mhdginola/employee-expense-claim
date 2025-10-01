import { Router } from "express";
const router = Router();
import { query } from "../config/database.js";
import auth from "../middleware/auth.js";

// Get notifications for logged in user
router.get("/", auth(), async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Mark as read
router.post("/:id/read", auth(), async (req, res) => {
  try {
    await query(
      "UPDATE notifications SET is_read = TRUE WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// mark all as read
router.post("/read-all", auth(), async (req, res) => {
  try {
    await query(
      `UPDATE notifications 
         SET is_read = true 
         WHERE user_id = $1`,
      [req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
