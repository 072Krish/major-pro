const Transaction = require("../models/Transaction");

// ==========================
// Add Transaction
// ==========================

exports.addTransaction = async (req, res) => {
    try {
        const { title, amount, type, category, date } = req.body;

        const transaction = await Transaction.create({
            user: req.user.id,
            title,
            amount,
            type,
            category,
            date,
        });

        res.status(201).json({
            success: true,
            message: "Transaction added successfully.",
            transaction,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// ==========================
// Get All Transactions
// ==========================

exports.getTransactions = async (req, res) => {
    try {

        const transactions = await Transaction.find({
            user: req.user.id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: transactions.length,
            transactions,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// ==========================
// Delete Transaction
// ==========================

exports.deleteTransaction = async (req, res) => {
    try {

        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found.",
            });
        }

        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized.",
            });
        }

        await transaction.deleteOne();

        res.status(200).json({
            success: true,
            message: "Transaction deleted successfully.",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// ==========================
// Update Transaction
// ==========================

exports.updateTransaction = async (req, res) => {
    try {

        const { title, amount, type, category, date } = req.body;

        const transaction = await Transaction.findById(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found.",
            });
        }

        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized.",
            });
        }

        transaction.title = title;
        transaction.amount = amount;
        transaction.type = type;
        transaction.category = category;
        transaction.date = date;

        await transaction.save();

        res.status(200).json({
            success: true,
            message: "Transaction updated successfully.",
            transaction,
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};