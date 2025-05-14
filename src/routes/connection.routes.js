const express = require("express");
const router = express.Router();
const controller = require("../controllers/connection.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/send", protect, controller.sendRequest);
router.post("/accept", protect, controller.acceptRequest);
router.get("/my-connections", protect, controller.getConnections);
router.get("/status/:userId", protect, controller.getConnectionStatus);

module.exports = router;