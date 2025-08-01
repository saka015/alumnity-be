const {
    registerUser,
    loginUser,
    verifyOTP,
    resendOTP,
    storeOTP,
    forgotPassword,
    resetPassword,
} = require("../services/auth.service");
const { User } = require("../models/user.model");
const { generateToken } = require("../utils/generate.jwt");

const register = async(req, res, next) => {
    try {
        const user = await registerUser(req.body);
        res.status(201).json({
            status: "success",
            message: "User registered, OTP sent to email",
        });
    } catch (error) {
        next(error);
    }
};

const login = async(req, res, next) => {
    try {
        const user = await loginUser(req.body);
        await storeOTP(user.email);
        res.status(200).json({ status: "success", message: "OTP sent to email" });
    } catch (error) {
        next(error);
    }
};

const otpVerification = async(req, res, next) => {
    try {
        const { email, otp } = req.body;
        await verifyOTP(email, otp);
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "User not found",
            });
        }

        if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
        }

        const token = generateToken(user._id);

        const isProduction = process.env.NODE_ENV === "production";

        const cookieOptions = {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
            domain: isProduction ? ".thekamalnayan.live" : undefined,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };

        console.log("Setting cookie with options:", cookieOptions);
        res.cookie("token", token, cookieOptions);

        res.status(200).json({
            status: "success",
            message: "OTP verified, logged in",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                isVerified: user.isVerified,
                profilePicture: user.profilePicture,
            },
        });
    } catch (error) {
        next(error);
    }
};

const resendOTPController = async(req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) throw new Error("Email is required");
        const response = await resendOTP(email);
        res.status(200).json({ status: "success", message: response.message });
    } catch (err) {
        next(err);
    }
};

const forgotPasswordController = async(req, res, next) => {
    try {
        const { email } = req.body;
        const response = await forgotPassword(email);
        res.status(200).json({ status: "success", message: response.message });
    } catch (err) {
        next(err);
    }
};

const resetPasswordController = async(req, res, next) => {
    try {
        const { email, newPassword } = req.body;
        const response = await resetPassword(email, newPassword);
        res.status(200).json({ status: "success", message: response.message });
    } catch (err) {
        next(err);
    }
};

const logout = (req, res) => {
    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        expires: new Date(0),
        path: "/",
        domain: isProduction ? ".thekamalnayan.live" : undefined,
    };

    console.log("Clearing cookie with options:", cookieOptions);
    res.cookie("token", "", cookieOptions);
    res
        .status(200)
        .json({ status: "success", message: "Logged out successfully" });
};

module.exports = {
    register,
    login,
    otpVerification,
    resendOTPController,
    logout,
    forgotPasswordController,
    resetPasswordController,
};