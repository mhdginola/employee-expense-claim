// server.js
const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./config/database.js");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/auth");
const claimsRoutes = require("./routes/claims");
const dashboardRoutes = require("./routes/dashboard");

app.use("/api/auth", authRoutes);
app.use("/api/claims", claimsRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 4000;
(async () => {
  try {
    await db.pool.connect();
    console.log("✅ Database connection successful");
    app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1);
  }
})();
