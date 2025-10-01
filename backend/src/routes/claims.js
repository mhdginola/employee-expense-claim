import { Router } from "express";
const router = Router();
import upload from "../middleware/upload.js";
import { query } from "../config/database.js";
import auth from "../middleware/auth.js";
import PDFDocument from "pdfkit";
import { notifyManager } from "../index.js";

// create a claim (employee)
router.post(
  "/",
  auth("employee"),
  upload.single("receipt_file"),
  async (req, res) => {
    const { amount, description, receipt_url, category } = req.body;
    const filePath = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.user.id;
    try {
      const { rows } = await query(
        `INSERT INTO claims (user_id, amount, description, receipt_url, category, receipt_file) VALUES ($1,$2,$3,$4,$5, $6) RETURNING *`,
        [userId, amount, description, receipt_url, category, filePath]
      );

      await notifyManager(
        req.user.manager_id,
        `New claim submitted: ${category} - $${amount}`
      );

      res.status(201).json(rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// list claims
router.get("/", auth(), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    let rows, total;

    if (req.user.role === "manager") {
      // hitung total
      const countRes = await query("SELECT COUNT(*) FROM claims");
      total = parseInt(countRes.rows[0].count, 10);

      // ambil data dengan limit offset
      const dataRes = await query(
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
      const countRes = await query(
        "SELECT COUNT(*) FROM claims WHERE user_id=$1",
        [req.user.id]
      );
      total = parseInt(countRes.rows[0].count, 10);

      const dataRes = await query(
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
    const { rows } = await query(
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
    const { rows } = await query(
      "UPDATE claims SET status=$1, manager_id=$2, manager_comment=$3, updated_at=now() WHERE id=$4 RETURNING *",
      ["approved", managerId, comment, id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    const claim = rows[0];

    await notifyManager(
      claim.user_id,
      `Your claim #${claim.id} has been ${claim.status} by manager.`
    );
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
    const { rows } = await query(
      "UPDATE claims SET status=$1, manager_id=$2, manager_comment=$3, updated_at=now() WHERE id=$4 RETURNING *",
      ["rejected", managerId, comment, id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found" });
    const claim = rows[0];

    await notifyManager(
      claim.user_id,
      `Your claim #${claim.id} has been ${claim.status} by manager.`
    );
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Download PDF summary
router.get("/:id/pdf", auth(), async (req, res) => {
  try {
    const { id } = req.params;

    const claim = await query(
      `SELECT c.id, c.category, c.amount, c.created_at, c.status, 
              e.full_name as employee_name, e.role 
       FROM claims c 
       JOIN users e ON c.user_id = e.id
       WHERE c.id = $1`,
      [id]
    );

    if (claim.rowCount === 0) {
      return res.status(404).json({ error: "Claim not found" });
    }

    const data = claim.rows[0];

    if (data.status !== "approved") {
      return res.status(400).json({ error: "Claim not approved yet" });
    }

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `claim-${id}.pdf`;

    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
    res.setHeader("Content-Type", "application/pdf");

    doc.pipe(res);

    // Header
    doc
      .fontSize(20)
      .text("PT. Expense Management System", { align: "center" })
      .moveDown();

    doc
      .fontSize(16)
      .text("Claim Approval Summary", { align: "center" })
      .moveDown(2);

    // Claim Info
    doc.fontSize(12).text(`Claim ID: ${data.id}`);
    doc.text(`Employee: ${data.employee_name}`);
    doc.text(`Departement: ${data.role}`);
    doc.text(`Category: ${data.category}`);
    doc.text(`Amount: $${Number(data.amount).toFixed(2)}`);
    doc.text(`Submitted: ${new Date(data.created_at).toLocaleDateString()}`);
    doc.text(`Status: ${data.status.toUpperCase()}`);
    doc.moveDown(2);

    // Signature block
    doc.text("Approved By:", { align: "right" }).moveDown(4);
    doc.text("__________________________", { align: "right" });
    doc.text("Manager Signature", { align: "right" });
    doc.text(new Date().toLocaleDateString(), { align: "right" });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
