const express = require("express");
const {
    register,
    login,
    otpVerification,
    resendOTPController,
    logout,
} = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// Public routes
router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/verify-otp", otpVerification);
router.post("/auth/resend-otp", resendOTPController);

// Protected routes
router.get("/auth/logout", protect, logout);


module.exports = router;