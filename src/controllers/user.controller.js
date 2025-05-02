const { registerUser, getUserById } = require("../services/userService");
const { ValidationError, NotFoundError } = require("../utils/AppError");

const register = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ status: "success", data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, getUser };
