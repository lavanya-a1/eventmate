require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const passport = require("./config/passport");
const { verifyCsrf } = require("./middleware/csrf");
const secrets = require("./config/secrets");

const errorHandler = require("./middleware/errorHandler");

const app = express();
const corsOrigins = new Set(
  (process.env.CORS_ORIGINS || ["http://localhost:5173", secrets.clientUrl, "https://eventmate-frontend.onrender.com"].join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
);

// Trust Render's reverse proxy so rate-limit, secure cookies, and
// req.ip / req.protocol work correctly behind HTTPS termination.
app.set("trust proxy", 1);

app.use(morgan("dev"));
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(verifyCsrf);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
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
app.use("/api/organizer", require("./routes/organizer.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/feedback", require("./routes/feedback.routes"));
app.use("/api/payments", require("./routes/payment.routes"));
app.use("/api/qrcode", require("./routes/qr.routes"));
app.use("/api/realtime", require("./routes/realtime.routes"));

app.use(errorHandler);

// ─── Cron Jobs ────────────────────────────────────────────────────────────────
// Only start in non-test environments
if (process.env.NODE_ENV !== 'test') {
  require('./jobs/reminderJob');
}

module.exports = app;
