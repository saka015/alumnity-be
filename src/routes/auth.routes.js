const express = require("express");
const {
    register,
    login,
    otpVerification,
    resendOTPController,
    logout,
    forgotPasswordController,
    resetPasswordController,
} = require("../controllers/auth.controller");
const {
    googleLogin,
    googleCallback,
} = require("../controllers/google.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/verify-otp", otpVerification);
router.post("/auth/resend-otp", resendOTPController);
router.post("/auth/forgot-password", forgotPasswordController);
router.post("/auth/reset-password", resetPasswordController);

// Google OAuth routes
router.get("/auth/google", googleLogin);
router.get("/auth/google/callback", googleCallback);

// Protected routes
router.get("/auth/logout", protect, logout);

module.exports = router;