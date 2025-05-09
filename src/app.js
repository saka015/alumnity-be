const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const cookieParser = require("cookie-parser"); // Import cookie-parser
const errorHandler = require("./middlewares/errorHandler"); // Global error handler
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");

// Create express app
const app = express();

// Apply Middleware
// 1. Security Headers
app.use(helmet());

// 2. Request Logging
app.use(morgan("dev"));

// 3. Enable CORS (with credentials enabled for cookie support)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

// 4. Body Parsing Middleware
app.use(express.json());

// 5. Cookie Parsing Middleware (for JWT in cookies)
app.use(cookieParser());

// 6. Compression Middleware (gzip or deflate content)
app.use(compression());

// 7. Rate Limiting (to prevent abuse)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Routes
// 1. Auth routes (for register, login, etc.)
app.use("/api/v1", authRoutes);

// 2. User routes (for user profile, etc.)
app.use("/api/v1/user", userRoutes);

// 3. Default Route (for testing or fallback)
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Global 404 handler for undefined routes
// app.all("*", (req, res) => {
//   res.status(404).json({ success: false, message: "API endpoint not found" });
// });

// Global Error Handler (catch all errors)
app.use(errorHandler);

// Export the app
module.exports = app;
