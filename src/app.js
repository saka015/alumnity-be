const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");
// const authRoutes = require('./routes/auth.routes');
// const userRoutes = require('./routes/user.routes');
// const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);

// 404 handler
// app.use('*', (req, res) => {
//   res.status(404).json({ success: false, message: 'API endpoint not found' });
// });

// Global Error Handler
app.use(errorHandler);

app.get("/", (req, res) => {
  res.send("Hello World");
});

module.exports = app;
