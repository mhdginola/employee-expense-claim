const express = require("express");
const router = express.Router();
const db = require("../config/database.js");
const auth = require("../middleware/auth");

// create a claim (employee)
router.post("/", auth("employee"), async (req, res) => {
  const { amount, description, receipt_url, category } = req.body;
  const userId = req.user.id;
  try {
    const { rows } = await db.query(
      `INSERT INTO claims (user_id, amount, description, receipt_url, category) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [userId, amount, description, receipt_url, category]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// list claims
router.get("/", auth(), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    let rows, total;

    if (req.user.role === "manager") {
      // hitung total
      const countRes = await db.query("SELECT COUNT(*) FROM claims");
      total = parseInt(countRes.rows[0].count, 10);

      // ambil data dengan limit offset
      const dataRes = await db.query(
        `SELECT c.*, u.full_name as requester 
         FROM claims c 
         JOIN users u ON u.id = c.user_id 
         ORDER BY created_at DESC 
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      );
      rows = dataRes.rows;
    } else {
      // employee hanya lihat claim sendiri
      const countRes = await db.query(
        "SELECT COUNT(*) FROM claims WHERE user_id=$1",
        [req.user.id]
      );
      total = parseInt(countRes.rows[0].count, 10);

      const dataRes = await db.query(
        `SELECT * 
         FROM claims 
         WHERE user_id=$1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [req.user.id, pageSize, offset]
      );
      rows = dataRes.rows;
    }

    res.json({
      data: rows,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// get claim by id
router.get("/:id", auth(), async (req, res) => {
  const id = req.params.id;
  try {
    const { rows } = await db.query(
      "SELECT c.*, u.full_name as requester FROM claims c JOIN users u ON u.id=c.user_id WHERE c.id=$1",
      [id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    const claim = rows[0];
    // if employee, ensure ownership
    if (req.user.role === "employee" && claim.user_id !== req.user.id)
      return res.status(403).json({ error: "Forbidden" });
    res.json(claim);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// approve
router.post("/:id/approve", auth("manager"), async (req, res) => {
  const id = req.params.id;
  const managerId = req.user.id;
  const { comment } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE claims SET status=$1, manager_id=$2, manager_comment=$3, updated_at=now() WHERE id=$4 RETURNING *",
      ["approved", managerId, comment, id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// reject
router.post("/:id/reject", auth("manager"), async (req, res) => {
  const id = req.params.id;
  const managerId = req.user.id;
  const { comment } = req.body;
  try {
    const { rows } = await db.query(
      "UPDATE claims SET status=$1, manager_id=$2, manager_comment=$3, updated_at=now() WHERE id=$4 RETURNING *",
      ["rejected", managerId, comment, id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
