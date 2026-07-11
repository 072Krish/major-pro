const Budget = require("../models/Budget");


// ==========================================
// GET CURRENT USER BUDGET
// ==========================================

const getBudget = async (req, res) => {
    try {
        const userId = req.user._id;

        let budget = await Budget.findOne({
            user: userId,
        });

        // Agar user ka budget document nahi hai,
        // to default budget document create hoga.
        if (!budget) {
            budget = await Budget.create({
                user: userId,
                monthlyBudget: 0,
                categoryBudgets: [],
            });
        }

        return res.status(200).json({
            success: true,
            budget,
        });

    } catch (error) {
        console.error("Get Budget Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch budget",
        });
    }
};


// ==========================================
// UPDATE MONTHLY BUDGET
// ==========================================

const updateMonthlyBudget = async (req, res) => {
    try {
        const userId = req.user._id;

        const { monthlyBudget } = req.body;

        const parsedBudget = Number(monthlyBudget);

        if (
            monthlyBudget === undefined ||
            monthlyBudget === null ||
            monthlyBudget === "" ||
            Number.isNaN(parsedBudget) ||
            parsedBudget < 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid monthly budget",
            });
        }

        const budget = await Budget.findOneAndUpdate(
            {
                user: userId,
            },
            {
                $set: {
                    monthlyBudget: parsedBudget,
                },
            },
            {
    returnDocument: "after",
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
}
        );

        return res.status(200).json({
            success: true,
            message: "Monthly budget updated successfully",
            budget,
        });

    } catch (error) {
        console.error("Update Monthly Budget Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update monthly budget",
        });
    }
};


// ==========================================
// UPDATE CATEGORY BUDGETS
// ==========================================

const updateCategoryBudgets = async (req, res) => {
    try {
        const userId = req.user._id;

        const { categoryBudgets } = req.body;

        if (!Array.isArray(categoryBudgets)) {
            return res.status(400).json({
                success: false,
                message: "Category budgets must be an array",
            });
        }

        const normalizedCategoryBudgets = categoryBudgets.map((item) => ({
            category: String(item.category || "").trim(),
            limit: Number(item.limit),
        }));

        const hasInvalidCategory = normalizedCategoryBudgets.some(
            (item) =>
                !item.category ||
                Number.isNaN(item.limit) ||
                item.limit < 0
        );

        if (hasInvalidCategory) {
            return res.status(400).json({
                success: false,
                message:
                    "Each category budget must contain a valid category and limit",
            });
        }

        const budget = await Budget.findOneAndUpdate(
            {
                user: userId,
            },
            {
                $set: {
                    categoryBudgets: normalizedCategoryBudgets,
                },
            },
            {
    returnDocument: "after",
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true,
}
        );

        return res.status(200).json({
            success: true,
            message: "Category budgets updated successfully",
            budget,
        });

    } catch (error) {
        console.error("Update Category Budgets Error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update category budgets",
        });
    }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    getBudget,
    updateMonthlyBudget,
    updateCategoryBudgets,
};