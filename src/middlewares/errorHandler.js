const winston = require("winston");
const { AppError } = require("../utils/AppErrror");

// Define the InternalServerError class here
class InternalServerError extends Error {
  constructor(message = "Internal Server Error") {
    super(message);
    this.statusCode = 500;  // HTTP Status Code for Internal Server Error
    this.name = "InternalServerError";  // Error name
  }
}

const errorHandler = (err, req, res, next) => {
  if (!(err instanceof AppError)) {
    err = new InternalServerError();  // Now you can use InternalServerError directly
  }

  logError(err);

  res.status(err.statusCode || 500).json({
    status: "error",
    message: err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

const logError = (err) => {
  if (process.env.NODE_ENV === "development") {
    console.error(err.stack);
  } else {
    const logger = winston.createLogger({
      transports: [new winston.transports.File({ filename: "logs/error.log" })],
    });
    logger.error(err.stack);
  }
};

module.exports = errorHandler;
