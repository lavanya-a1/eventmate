require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://eventmate-frontend.onrender.com"
  ],
  credentials: true
}));app.use(express.json());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
  })
);

app.get("/", (req, res) => {
  res.send("EventMate API running");
});

app.use("/api", require("./routes/health.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/events", require("./routes/event.routes"));
app.use("/api/bookings", require("./routes/booking.routes"));
app.use("/api/admin", require("./routes/admin.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/feedback", require("./routes/feedback.routes"));
app.use("/api/payments", require("./routes/payment.routes"));
app.use("/api/qrcode", require("./routes/qr.routes"));

app.use(errorHandler);

// ─── Cron Jobs ────────────────────────────────────────────────────────────────
// Only start in non-test environments
if (process.env.NODE_ENV !== 'test') {
  require('./jobs/reminderJob');
}

module.exports = app;
