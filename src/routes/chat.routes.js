const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const { protect } = require("../middlewares/auth.middleware");

// Get messages between current user and specified user
router.get("/:userId", protect, chatController.getMessages);

module.exports = router;