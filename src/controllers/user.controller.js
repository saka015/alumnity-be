const { User } = require("../models/user.model");
const { ValidationError, NotFoundError } = require("../utils/AppErrror");

const getUserProfile = async (req, res, next) => {
  try {
    const user = req.user;

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, username } = req.body;

    // Check if username is taken (if username is being updated)
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new ValidationError("Username is already taken");
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, username },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Check if passwords are provided
    if (!currentPassword || !newPassword) {
      throw new ValidationError(
        "Current password and new password are required"
      );
    }

    // Get user with password
    const user = await User.findById(req.user._id).select("+password");

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ValidationError("Current password is incorrect");
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: "success",
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  changePassword,
};
