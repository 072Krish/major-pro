const Goal = require("../models/Goal");

/* =========================
   GET ALL GOALS
========================= */

const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({
            user: req.user.id,
        }).sort({
            createdAt: -1,
        });

        res.status(200).json({
            success: true,
            goals,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch goals",
        });
    }
};

/* =========================
   CREATE GOAL
========================= */

const createGoal = async (req, res) => {
    try {
        const {
            title,
            category,
            targetAmount,
            savedAmount,
            deadline,
        } = req.body;

        if (
            !title ||
            !targetAmount ||
            Number(targetAmount) <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Title and valid target amount are required",
            });
        }

        const goal = await Goal.create({
            user: req.user.id,
            title: title.trim(),
            category: category || "Savings",
            targetAmount: Number(targetAmount),
            savedAmount: Number(savedAmount || 0),
            deadline: deadline || null,
        });

        res.status(201).json({
            success: true,
            message: "Goal created successfully",
            goal,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create goal",
        });
    }
};

/* =========================
   UPDATE GOAL
========================= */

const updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findOne({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Goal not found",
            });
        }

        const {
            title,
            category,
            targetAmount,
            savedAmount,
            deadline,
        } = req.body;

        if (title !== undefined) {
            goal.title = title.trim();
        }

        if (category !== undefined) {
            goal.category = category;
        }

        if (targetAmount !== undefined) {
            if (Number(targetAmount) <= 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Target amount must be greater than 0",
                });
            }

            goal.targetAmount = Number(targetAmount);
        }

        if (savedAmount !== undefined) {
            if (Number(savedAmount) < 0) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Saved amount cannot be negative",
                });
            }

            goal.savedAmount = Number(savedAmount);
        }

        if (deadline !== undefined) {
            goal.deadline = deadline || null;
        }

        await goal.save();

        res.status(200).json({
            success: true,
            message: "Goal updated successfully",
            goal,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update goal",
        });
    }
};

/* =========================
   DELETE GOAL
========================= */

const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({
            _id: req.params.id,
            user: req.user.id,
        });

        if (!goal) {
            return res.status(404).json({
                success: false,
                message: "Goal not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Goal deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete goal",
        });
    }
};

module.exports = {
    getGoals,
    createGoal,
    updateGoal,
    deleteGoal,
};