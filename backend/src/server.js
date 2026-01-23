require("dotenv").config();   // ✅ FIRST

const connectDB = require("./config/db");
connectDB();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("EventMate API running");
});

const healthRoutes = require("./routes/health.routes");
app.use("/api", healthRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const authRoutes = require("./routes/auth.routes");
app.use("/api/auth", authRoutes);
