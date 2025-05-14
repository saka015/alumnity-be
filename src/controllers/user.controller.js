const { User } = require("../models/user.model");
const { ValidationError, NotFoundError } = require("../utils/AppErrror");
const {
    getExploreSeniors,
    getAlumniById,
    updateUserProfile,
} = require("../services/user.service");

const getUserProfile = async(req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.json(user);
    } catch (err) {
        next(err);
    }
};

const exploreAlumni = async(req, res, next) => {
    try {
        const { searchTerm } = req.query;
        const seniors = await getExploreSeniors(req.user._id, searchTerm);
        res.status(200).json(seniors);
    } catch (error) {
        next(error);
    }
};

const alumniByUsername = async(req, res) => {
    try {
        const { username } = req.params;
        const alumni = await User.findOne({ username }).select("-password");

        if (!alumni) {
            return res.status(404).json({ message: "Alumni not found" });
        }

        res.json(alumni);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

const updateProfile = async(req, res, next) => {
    try {
        const userId = req.user._id;
        const updatedUser = await updateUserProfile(userId, req.body);
        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
};

const changePassword = async(req, res, next) => {
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
    updateProfile,
    changePassword,
    exploreAlumni,
    alumniByUsername,
    getUserProfile,
};