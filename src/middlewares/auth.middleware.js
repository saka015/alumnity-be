const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");
const { UnauthorizedError } = require("../utils/AppErrror");

const protect = async (req, res, next) => {
  try {
    // 1) Get token from cookies or Authorization header
    let token;
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new UnauthorizedError(
          "You are not logged in. Please log in to get access."
        )
      );
    }

    // 2) Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3) Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(
        new UnauthorizedError(
          "The user belonging to this token no longer exists."
        )
      );
    }

    // 4) Grant access
    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === "JsonWebTokenError") {
      return next(new UnauthorizedError("Invalid token. Please log in again."));
    }
    if (err.name === "TokenExpiredError") {
      return next(
        new UnauthorizedError("Your token has expired. Please log in again.")
      );
    }
    next(err);
  }
};

// Middleware to restrict access to certain roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new UnauthorizedError(
          "You do not have permission to perform this action"
        )
      );
    }
    next();
  };
};

module.exports = { protect, restrictTo };
