const winston = require("winston");
const { AppError } = require("../utils/AppErrror");
const mongoose = require("mongoose");

// Define the InternalServerError class here
class InternalServerError extends Error {
  constructor(message = "Internal Server Error") {
    super(message);
    this.statusCode = 500; // HTTP Status Code for Internal Server Error
    this.name = "InternalServerError"; // Error name
  }
}

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logError(err);

  // Mongoose validation error
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((val) => val.message);
    error = new AppError(messages.join(". "), 400);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = new AppError(
      `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`,
      400
    );
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    error = new AppError("Invalid token. Please log in again.", 401);
  }
  if (err.name === "TokenExpiredError") {
    error = new AppError("Your token has expired. Please log in again.", 401);
  }

  // Operational, trusted error: send error message to client
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // Programming or other unknown error: don't leak error details
  console.error("ERROR 💥", err);
  return res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong!",
  });
};

const logError = (err) => {
  if (process.env.NODE_ENV === "development") {
    console.error("💥 ERROR:", err);
  } else {
    const logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({
          filename: "logs/error.log",
          level: "error",
        }),
      ],
    });
    logger.error({
      message: err.message,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = errorHandler;
