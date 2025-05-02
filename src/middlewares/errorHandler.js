const { AppError, InternalServerError } = require("../utils/AppError");
const winston = require("winston");

const errorHandler = (err, req, res, next) => {
  if (!(err instanceof AppError)) {
    err = new InternalServerError();
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
