require("dotenv").config();   // ✅ FIRST
const helmet = require("helmet");
const morgan = require("morgan");

const connectDB = require("./config/db");
connectDB();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
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

const eventRoutes = require("./routes/event.routes");
app.use("/api/events", eventRoutes);

app.use("/api/admin", require("./routes/admin.routes"));

const errorHandler = require("./middleware/errorHandler");

app.use(errorHandler);

const rateLimit = require("express-rate-limit");
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});
app.use(limiter);
