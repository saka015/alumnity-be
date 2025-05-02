const { ValidationError, NotFoundError } = require("../utils/AppError");
const User = require("../models/User");

const registerUser = async (userData) => {
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new ValidationError("User with this email already exists");
  }

  const user = new User(userData);
  await user.save();
  return user;
};

const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError("User not found");
  }

  return user;
};

module.exports = { registerUser, getUserById };
