require("dotenv").config();
// Local service credentials are deliberately separated from shared settings.
require("dotenv").config({ path: ".env.duffel.local", override: true });

const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("./utils/logger");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const errorHandler = require("./middleware/errorHandler");
const { isSupabaseConfigured } = require("./config/supabase");

app.use(helmet());
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",");
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy: This origin is not allowed"));
      }
    },
  })
);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 60,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "SKYNORA Travel Booking API is running",
  });
});

app.get("/health", (req, res) => {
  const supabaseStatus = isSupabaseConfigured() ? "connected" : "unconfigured";
  res.status(200).json({
    success: true,
    database: "supabase_postgresql",
    status: supabaseStatus,
  });
});

const hotelController = require("./controllers/hotels.controller.js");
const authRoute = require("./routes/auth");
const bookedFlightRoute = require("./routes/BookedFlight");
const bookedHotelRoute = require("./routes/BookedHotel");
const flightController = require("./controllers/flightController/flight.controller");
const aiRoute = require("./routes/ai");

app.use("/hotels", hotelController);
app.use("/auth", authRoute);
app.use("/bookings", bookedFlightRoute);
app.use("/bookings", bookedHotelRoute);
app.use("/flights", flightController);
app.use("/ai", aiRoute);

app.use(errorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} with Supabase PostgreSQL`);
});

module.exports = app;
