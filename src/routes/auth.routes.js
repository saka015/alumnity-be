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
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/verify-otp", otpVerification);
router.post("/auth/resend-otp", resendOTPController);
router.post("/auth/forgot-password", forgotPasswordController);
router.post("/auth/reset-password", resetPasswordController);

// Protected routes
router.get("/auth/logout", protect, logout);

module.exports = router;