const express = require("express");
const {
  register,
  login,
  otpVerification,
  resendOTPController,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/login", login);
router.post("/auth/verify-otp", otpVerification);
router.post("/auth/resend-otp", resendOTPController);

// protected
// router.get("/profile", protect, getUserProfile);

module.exports = router;
