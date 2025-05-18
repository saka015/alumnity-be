const {
    registerUser,
    loginUser,
    verifyOTP,
    resendOTP,
    storeOTP,
} = require("../services/auth.services");
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

        // Mark user as verified
        if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
        }

        const token = generateToken(user._id);

        console.log("cookie: ", process.env.NODE_ENV);

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        console.log("Cookie 'token' set with value:", token);

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

const logout = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0),
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
    });
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
};