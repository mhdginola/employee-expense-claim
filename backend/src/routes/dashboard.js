import { Router } from "express";
const router = Router();
import { query } from "../config/database.js";
import auth from "../middleware/auth.js";

// GET Dashboard Summary
router.get("/", auth(), async (req, res) => {
  try {
    // Claims by Status
    const statusResult = await query(
      `SELECT status, COUNT(*) as count 
       FROM claims 
       ${req.user.role === "manager" ? "" : "WHERE user_id=$1"}
       GROUP BY status`,
      req.user.role === "manager" ? [] : [req.user.id]
    );

    // Expenses by Category
    const categoryResult = await query(
      `SELECT category, SUM(amount) as total 
       FROM claims 
       ${req.user.role === "manager" ? "" : "WHERE user_id=$1"}
       GROUP BY category`,
      req.user.role === "manager" ? [] : [req.user.id]
    );

    // Monthly Total (current year)
    const monthlyResult = await query(
      `SELECT EXTRACT(MONTH FROM created_at) as month, SUM(amount) as total 
       FROM claims 
       ${req.user.role === "manager" ? "WHERE" : "WHERE user_id=$1 AND"}
       EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
       GROUP BY month
       ORDER BY month`,
      req.user.role === "manager" ? [] : [req.user.id]
    );

    res.json({
      status: statusResult.rows,
      category: categoryResult.rows,
      monthly: monthlyResult.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Pending claims (for managers only)
router.get("/pending", auth(), async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const result = await query(
      `SELECT id, (SELECT full_name FROM users WHERE users.id = claims.user_id) AS employee_name, category, amount, created_at, status
         FROM claims
         WHERE status = 'pending'
         ORDER BY created_at ASC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
