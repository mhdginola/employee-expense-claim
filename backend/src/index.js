import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

// import custom modules
import { query, pool } from "./config/database.js";
import { startReminderJob } from "./jobs/reminderApproveClaim.js";

// import routes
import authRoutes from "./routes/auth.js";
import claimsRoutes from "./routes/claims.js";
import dashboardRoutes from "./routes/dashboard.js";
import notificationsRoutes from "./routes/notifications.js";
import categoriesRoutes from "./routes/categories.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Simpan socket per manager
const managerSockets = new Map();

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Saat manager join (kirim userId via frontend)
  socket.on("registerManager", (userId) => {
    managerSockets.set(String(userId), socket.id);
    console.log(`Manager registered: userId=${userId}, socketId=${socket.id}`);
    console.log(
      "Current managerSockets:",
      Array.from(managerSockets.entries())
    );
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    for (const [userId, id] of managerSockets.entries()) {
      if (id === socket.id) {
        managerSockets.delete(userId);
        console.log(`Manager unregistered: userId=${userId}`);
      }
    }
    console.log(
      "Current managerSockets:",
      Array.from(managerSockets.entries())
    );
  });
});

// Trigger notifikasi ke manager tertentu
export async function notifyManager(managerId, message) {
  const key = String(managerId);
  await query(
    `INSERT INTO notifications (user_id, message)
     VALUES ($1, $2)`,
    [managerId, `Claim  pending > 7 days`]
  );

  const socketId = managerSockets.get(key);
  console.log(`Notify managerId=${key}, socketId=${socketId}`);
  console.log("Current managerSockets:", Array.from(managerSockets.entries()));
  if (socketId) {
    io.to(socketId).emit("newNotification", {
      message,
      created_at: new Date(),
    });
  }
}

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/claims", claimsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/uploads", express.static("uploads"));

// Start reminder job
startReminderJob();

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await pool.connect();
    console.log("✅ Database connection successful");
    server.listen(PORT, () =>
      console.log(`Server + WebSocket listening on ${PORT}`)
    );
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
})();
