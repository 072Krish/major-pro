const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getSettings,
    updateSettings,
    updateProfile,
    changePassword,
} = require("../controllers/settingsController");


// ==========================================
// GET SETTINGS
// ==========================================

router.get(
    "/",
    protect,
    getSettings
);


// ==========================================
// UPDATE SETTINGS
// ==========================================

router.put(
    "/",
    protect,
    updateSettings
);

// ==========================================
// UPDATE PROFILE
// ==========================================

router.put(
    "/profile",
    protect,
    updateProfile
);

// ==========================================
// CHANGE PASSWORD
// ==========================================

router.put(
    "/password",
    protect,
    changePassword
);


module.exports = router;