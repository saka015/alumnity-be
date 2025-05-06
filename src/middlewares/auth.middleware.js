const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: No token provided",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // You can access user ID with req.user.id
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Token is invalid or expired",
    });
  }
};

module.exports = protect;
