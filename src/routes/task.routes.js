const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const { createTask, fetchMyTasks } = require("../controllers/task.controller");
const router = express.Router();

// Protected routes - require authentication
router.post("/create-task", protect, createTask);
router.get("/my-tasks", protect, fetchMyTasks)
    // router.get("/all-tasks", protect, )

module.exports = router;