const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
// const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");
const http = require("http");
const errorHandler = require("./middlewares/error.middleware");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const taskRoutes = require("./routes/task.routes");
const productRoutes = require("./routes/product.routes");
const connectionRoutes = require("./routes/connection.routes");
const chatRoutes = require("./routes/chat.routes");
const { Server } = require("socket.io");

// Import passport config
require("./config/passport");

// Create express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
        allowedHeaders: ["Content-Type", "Authorization"],
    },
    allowEIO3: true,
    transports: ["websocket", "polling"],
});

const socketHandler = require("./socket/index");
socketHandler(io);

// Apply Middleware
// 1. Security Headers
// app.use(
//     helmet({
//         crossOriginResourcePolicy: { policy: "cross-origin" },
//         crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
//         crossOriginEmbedderPolicy: false,
//         contentSecurityPolicy: {
//             directives: {
//                 defaultSrc: ["'self'"],
//                 scriptSrc: ["'self'", "'unsafe-inline'"],
//                 styleSrc: ["'self'", "'unsafe-inline'"],
//                 imgSrc: ["'self'", "data:", "https:"],
//                 connectSrc: [
//                     "'self'",
//                     process.env.FRONTEND_URL || "http://localhost:3000",
//                 ],
//             },
//         },
//     })
// );

// 2. Request Logging
app.use(morgan("dev"));

// 3. Enable CORS (with credentials enabled for cookie support)
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
        exposedHeaders: ["Set-Cookie"],
    })
);

// 4. Body Parsing Middleware
app.use(express.json());

// 5. Cookie Parsing Middleware (for JWT in cookies)
app.use(cookieParser());

// 6. Session Middleware (for Passport.js)
app.use(
    session({
        secret: process.env.SESSION_SECRET || "your-secret-key",
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        },
    })
);

// 7. Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// 8. Compression Middleware (gzip or deflate content)
app.use(compression());

// 9. Rate Limiting (to prevent abuse)
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
app.use("/api/v1/task", taskRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/connection", connectionRoutes);
app.use("/api/v1/chat", chatRoutes);

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

// Export the server instead of app for socket.io
module.exports = { app, server };