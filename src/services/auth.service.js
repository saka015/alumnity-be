require("dotenv").config();
const { NotFoundError, ValidationError } = require("../utils/AppErrror");
const { User } = require("../models/user.model");
const { sendOtpEmail } = require("../utils/mailer");
const { OTP } = require("../models/otp.model");

const validateRegistrationData = (userData) => {
    const { name, email, password, username } = userData;

    if (!name || !email || !password || !username) {
        throw new ValidationError(
            "All fields are required: name, email, password, username"
        );
    }

    if (password.length < 6) {
        throw new ValidationError("Password must be at least 6 characters long");
    }

    if (username.length < 5) {
        throw new ValidationError("Username must be at least 5 characters long");
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
        throw new ValidationError("Please provide a valid email address");
    }
};

const registerUser = async(userData) => {
    // Validate input data
    validateRegistrationData(userData);

    // Check if user exists
    const existingUser = await User.findOne({
        $or: [{ email: userData.email }, { username: userData.username }],
    });

    if (existingUser) {
        if (existingUser.email === userData.email) {
            throw new ValidationError("Email already registered");
        }
        throw new ValidationError("Username already taken");
    }

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate and send OTP
    await storeOTP(user.email);

    return user;
};

const loginUser = async(userData) => {
    const { email, password } = userData;

    if (!email || !password) {
        throw new ValidationError("Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        throw new NotFoundError("User not found");
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        throw new ValidationError("Invalid credentials");
    }

    return user;
};

// otp-service

const generateOTP = () => {
    if (process.env.NODE_ENV === "development") {
        return "111111";
    }
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const storeOTP = async(email) => {
    try {
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await OTP.deleteOne({ email });

        const otpRecord = new OTP({
            email,
            otp,
            expiresAt,
        });

        await otpRecord.save();
        await sendOtpEmail(email, otp);
    } catch (error) {
        console.error("Error in storeOTP:", error);
        throw new ValidationError(error.message || "Failed to send OTP");
    }
};

const verifyOTP = async(email, enteredOTP) => {
    if (!email || !enteredOTP) {
        throw new ValidationError("Email and OTP are required");
    }

    const otpRecord = await OTP.findOne({ email });

    if (!otpRecord) {
        throw new ValidationError("OTP not found or expired");
    }

    if (otpRecord.otp !== enteredOTP) {
        throw new ValidationError("Invalid OTP");
    }

    if (new Date() > otpRecord.expiresAt) {
        await OTP.deleteOne({ email });
        throw new ValidationError("OTP expired");
    }

    await OTP.deleteOne({ email });
};

const resendOTP = async(email) => {
    if (!email) {
        throw new ValidationError("Email is required");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new NotFoundError("User not found");
    }

    await storeOTP(email);
    return { message: "OTP resent successfully" };
};

const forgotPassword = async(email) => {
    if (!email) {
        throw new ValidationError("Email is required");
    }
    const user = await User.findOne({ email });
    if (!user) {
        throw new NotFoundError("User not found");
    }

    await storeOTP(email);
    return { message: "Password reset OTP sent to email" };
};

const resetPassword = async(email, newPassword) => {
    if (!email || !newPassword) {
        throw new ValidationError("Email and new password are required");
    }

    if (newPassword.length < 6) {
        throw new ValidationError("Password must be at least 6 characters long");
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new NotFoundError("User not found");
    }

    user.password = newPassword;
    await user.save();

    return { message: "Password reset successfully" };
};

module.exports = {
    registerUser,
    loginUser,
    storeOTP,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
};