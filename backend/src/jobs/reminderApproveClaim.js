import { schedule } from "node-cron";
import { createTransport } from "nodemailer";
import { query } from "../config/database.js"; // koneksi ke PostgreSQL

// Setup mailer
const transporter = createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // TLS
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Fungsi job
const sendReminderJob = async () => {
  console.log("Running daily pending claim reminder job...");

  try {
    const result = await query(
      `SELECT c.id as claim_id, u.full_name as employee_name, c.category, c.amount, c.created_at, (SELECT email FROM users uu WHERE uu.id = u.manager_id ) as manager_email
       FROM claims c
       JOIN users u ON u.id = c.user_id
       WHERE c.status = 'pending'
       AND c.created_at < NOW() - INTERVAL '7 days'`
    );

    if (process.env.MAIL_ENABLE != "Y") {
      console.log(`[SUCCESS] Email disable`);
      return;
    }
    for (const claim of result.rows) {
      try {
        await transporter.sendMail({
          from: `"Expense System" <${process.env.MAIL_USER}>`,
          to: claim.manager_email,
          subject: `Reminder: Pending Claim ${claim.claim_id}`,
          text: `
Dear Manager,

The following claim has been pending for more than 7 days:

Claim ID: ${claim.claim_id}
Employee: ${claim.employee_name}
Category: ${claim.category}
Amount: $${claim.amount}
Submitted: ${new Date(claim.created_at).toLocaleDateString()}

Please review and take action.
          `,
        });

        console.log(
          `[SUCCESS] Reminder sent for claim ${claim.claim_id} to ${claim.manager_email}`
        );
      } catch (mailErr) {
        console.error(
          `[FAILED] Failed to send reminder for claim ${claim.claim_id} to ${claim.manager_email}:`,
          mailErr
        );
      }
    }
  } catch (err) {
    console.error("Reminder job failed:", err);
  }
};

// Start job
const startReminderJob = () => {
  // Jalankan langsung saat start
  sendReminderJob();

  // Schedule job setiap jam 8
  schedule("0 8 * * *", () => {
    sendReminderJob();
  });
};

export { startReminderJob };
