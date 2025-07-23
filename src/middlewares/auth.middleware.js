const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");
const { ValidationError } = require("../utils/AppErrror");

const protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      status: "fail",
      message: "Not authenticated, please login",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "User no longer exists",
      });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        status: "fail",
        message: "Please verify your email first",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      status: "fail",
      message: "Invalid token or session expired",
    });
  }
};

module.exports = { protect };
