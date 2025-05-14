const express = require("express");
const { protect } = require("../middlewares/auth.middleware");
const router = express.Router();

// Import controller (to be implemented)
const {
    getUserProfile,
    updateProfile,
    changePassword,
    exploreAlumni,
    alumniByUsername,
} = require("../controllers/user.controller");

// Protected routes - require authentication
router.get("/profile", protect, getUserProfile);

router.patch("/update-profile", protect, updateProfile);
router.patch("/change-password", protect, changePassword);

//

router.get("/explore-alumni", protect, exploreAlumni);
router.get("/alumni/:username", protect, alumniByUsername);

module.exports = router;