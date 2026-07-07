const express = require("express");

const router = express.Router();

const {
    addTransaction,
    getTransactions,
    deleteTransaction,
    updateTransaction,
} = require("../controllers/transactionController");

const protect = require("../middleware/authMiddleware");

// ===============================
// Transaction Routes
// ===============================

// Add Transaction
router.post("/", protect, addTransaction);

// Get All Transactions
router.get("/", protect, getTransactions);

// Delete Transaction
router.delete("/:id", protect, deleteTransaction);

router.put("/:id", protect, updateTransaction);

module.exports = router;