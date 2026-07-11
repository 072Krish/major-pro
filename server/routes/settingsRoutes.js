const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getSettings,
    updateSettings,
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


module.exports = router;