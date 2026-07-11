const mongoose = require("mongoose");

const categoryBudgetSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            trim: true,
        },

        limit: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
    },
    {
        _id: false,
    }
);

const budgetSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        monthlyBudget: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },

        categoryBudgets: {
            type: [categoryBudgetSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Budget", budgetSchema);