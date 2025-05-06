const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const router = express.Router();

// Import controller (to be implemented)
const {
  getUserProfile,
  updateProfile,
  changePassword,
} = require("../controllers/user.controller");

// Protected routes - require authentication
router.get("/profile", protect, getUserProfile);
router.patch("/profile", protect, updateProfile);
router.patch("/change-password", protect, changePassword);

module.exports = router;
