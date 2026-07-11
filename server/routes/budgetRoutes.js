const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
    getBudget,
    updateMonthlyBudget,
    updateCategoryBudgets,
} = require("../controllers/budgetController");


// ==============================
// GET USER BUDGET
// ==============================

router.get(
    "/",
    protect,
    getBudget
);


// ==============================
// UPDATE MONTHLY BUDGET
// ==============================

router.put(
    "/monthly",
    protect,
    updateMonthlyBudget
);


// ==============================
// UPDATE CATEGORY BUDGETS
// ==============================

router.put(
    "/categories",
    protect,
    updateCategoryBudgets
);

module.exports = router;