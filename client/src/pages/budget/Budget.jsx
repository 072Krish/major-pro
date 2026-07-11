import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { logout } from "../../utils/auth";
import useAutoLogout from "../../hooks/useAutoLogout";
import { getTransactionsAPI } from "../../services/transactionService";
import {
    getBudgetAPI,
    updateMonthlyBudgetAPI,
    updateCategoryBudgetsAPI,
} from "../../services/budgetService";

import "../../assets/css/budget/budget.css";

function Budget() {
    useAutoLogout();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);

    const [monthlyLimit, setMonthlyLimit] = useState(0);
    const [budgetInput, setBudgetInput] = useState("");
    const [savingBudget, setSavingBudget] = useState(false);

const [categoryBudgets, setCategoryBudgets] = useState({
    food: 0,
    shopping: 0,
    transport: 0,
    entertainment: 0,
});

const [categoryInputs, setCategoryInputs] = useState({
    food: "",
    shopping: "",
    transport: "",
    entertainment: "",
});

    const [savingCategories, setSavingCategories] = useState(false);

    const currentMonthText = new Date().toLocaleString("en-IN", {
        month: "long",
        year: "numeric",
    });

    const formatCurrency = (amount) => {
        return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
    };

    const getTransactionDate = (transaction) => {
        if (transaction.date) return new Date(transaction.date);
        if (transaction.transactionDate) return new Date(transaction.transactionDate);
        if (transaction.createdAt) return new Date(transaction.createdAt);
        return new Date();
    };

    const isCurrentMonth = (transaction) => {
        const now = new Date();
        const date = getTransactionDate(transaction);

        return (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        );
    };

    const normalizeCategory = (category) => {
        const value = String(category || "").toLowerCase().trim();

        if (
            value.includes("food") ||
            value.includes("grocery") ||
            value.includes("meal") ||
            value.includes("dining")
        ) return "food";

        if (
            value.includes("shopping") ||
            value.includes("shop") ||
            value.includes("clothes") ||
            value.includes("gadget")
        ) return "shopping";

        if (
            value.includes("transport") ||
            value.includes("fuel") ||
            value.includes("cab") ||
            value.includes("metro") ||
            value.includes("travel")
        ) return "transport";

        if (
            value.includes("entertainment") ||
            value.includes("movie") ||
            value.includes("game") ||
            value.includes("subscription")
        ) return "entertainment";

        return value;
    };

    const getProgressColor = (percent) => {
        if (percent >= 100) return "#EF4444";
        if (percent >= 85) return "#F97316";
        if (percent >= 60) return "#EAB308";
        return "#22C55E";
    };

    const getRemainingDays = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const lastDay = new Date(year, month + 1, 0).getDate();
        return Math.max(lastDay - now.getDate() + 1, 1);
    };

    const fetchBudgetPage = async () => {
        try {
            setPageLoading(true);

            const startTime = Date.now();

const budgetResponse =
    await getBudgetAPI();

const budget =
    budgetResponse.budget;

setMonthlyLimit(
    Number(budget.monthlyBudget || 0)
);

setBudgetInput(
    Number(budget.monthlyBudget || 0)
);

const mappedCategories = {
    food: 0,
    shopping: 0,
    transport: 0,
    entertainment: 0,
};

budget.categoryBudgets.forEach((item) => {

    const key =
        normalizeCategory(item.category);

    if (mappedCategories.hasOwnProperty(key)) {

        mappedCategories[key] =
            item.limit;

    }

});

setCategoryBudgets(mappedCategories);

setCategoryInputs({
    food: mappedCategories.food,
    shopping: mappedCategories.shopping,
    transport: mappedCategories.transport,
    entertainment: mappedCategories.entertainment,
});

            const data = await getTransactionsAPI();
            setTransactions(data.transactions || []);

            const elapsed = Date.now() - startTime;
            const minimumDelay = 1500;

            if (elapsed < minimumDelay) {
                await new Promise((resolve) =>
                    setTimeout(resolve, minimumDelay - elapsed)
                );
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to load budget data"
            );
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        fetchBudgetPage();
    }, []);

    const currentMonthExpenses = useMemo(() => {
        return transactions.filter((transaction) => {
            return (
                String(transaction.type || "").toLowerCase() === "expense" &&
                isCurrentMonth(transaction)
            );
        });
    }, [transactions]);

    const spent = useMemo(() => {
        return currentMonthExpenses.reduce((sum, transaction) => {
            return sum + Number(transaction.amount || transaction.transactionAmount || 0);
        }, 0);
    }, [currentMonthExpenses]);

    const remaining = monthlyLimit - spent;
    const rawPercent = monthlyLimit > 0 ? (spent / monthlyLimit) * 100 : 0;
    const progressPercent = Math.min(rawPercent, 100);
    const progressColor = getProgressColor(rawPercent);

    const dailyAvailable = Math.max(remaining, 0) / getRemainingDays();

    const budgetHealth = useMemo(() => {
        if (monthlyLimit <= 0) {
            return {
                label: "Not Set",
                text: "Create a budget",
                color: "#94A3B8",
            };
        }

        if (rawPercent >= 100) {
            return {
                label: "Critical",
                text: "Budget exceeded",
                color: "#EF4444",
            };
        }

        if (rawPercent >= 85) {
            return {
                label: "Warning",
                text: "Close to limit",
                color: "#F97316",
            };
        }

        if (rawPercent >= 60) {
            return {
                label: "Good",
                text: "Spending is moderate",
                color: "#EAB308",
            };
        }

        return {
            label: "Excellent",
            text: "Healthy spending",
            color: "#22C55E",
        };
    }, [monthlyLimit, rawPercent]);

    const getCategorySpent = (categoryName) => {
        return currentMonthExpenses
            .filter((transaction) => {
                return normalizeCategory(transaction.category || transaction.transactionCategory) === categoryName;
            })
            .reduce((sum, transaction) => {
                return sum + Number(transaction.amount || transaction.transactionAmount || 0);
            }, 0);
    };

    const getCategoryInfo = (category) => {
        const limit = Number(categoryBudgets[category] || 0);
        const categorySpent = getCategorySpent(category);
        const percent = limit > 0 ? (categorySpent / limit) * 100 : 0;
        const width = Math.min(percent, 100);
        const color = getProgressColor(percent);

        return {
            limit,
            spent: categorySpent,
            percent,
            width,
            color,
        };
    };

    const foodInfo = getCategoryInfo("food");
    const shoppingInfo = getCategoryInfo("shopping");
    const transportInfo = getCategoryInfo("transport");
    const entertainmentInfo = getCategoryInfo("entertainment");

    const categoryAlert = useMemo(() => {
        const categories = [
            {
                label: "Food",
                ...foodInfo,
            },
            {
                label: "Shopping",
                ...shoppingInfo,
            },
            {
                label: "Transport",
                ...transportInfo,
            },
            {
                label: "Entertainment",
                ...entertainmentInfo,
            },
        ];

        return categories
            .filter((item) => item.limit > 0)
            .filter((item) => item.percent >= 85)
            .sort((a, b) => b.percent - a.percent)[0];
    }, [foodInfo.percent, shoppingInfo.percent, transportInfo.percent, entertainmentInfo.percent]);

    const recommendation = useMemo(() => {
        if (monthlyLimit <= 0) {
            return {
                title: "Set your monthly budget",
                text: "Add a monthly budget to start tracking your spending limits.",
                priority: "Low",
                color: "#94A3B8",
            };
        }

        if (categoryAlert) {
            return {
                title: `${categoryAlert.label} spending is high`,
                text: `${categoryAlert.label} has used ${categoryAlert.percent.toFixed(1)}% of its category budget. Reduce it to stay on track.`,
                priority: categoryAlert.percent >= 100 ? "Critical" : "High",
                color: categoryAlert.percent >= 100 ? "#EF4444" : "#F97316",
            };
        }

        if (rawPercent >= 100) {
            return {
                title: "Budget exceeded",
                text: "Your expenses have crossed the monthly budget. Reduce non-essential spending.",
                priority: "Critical",
                color: "#EF4444",
            };
        }

        if (rawPercent >= 85) {
            return {
                title: "Close to budget limit",
                text: "You have used more than 85% of your budget. Spend carefully for the rest of the month.",
                priority: "High",
                color: "#F97316",
            };
        }

        if (rawPercent >= 60) {
            return {
                title: "Spending is moderate",
                text: "You are using your budget at a stable pace. Keep monitoring category expenses.",
                priority: "Medium",
                color: "#EAB308",
            };
        }

        return {
            title: "Budget is healthy",
            text: "Your spending is under control. You still have enough budget remaining this month.",
            priority: "Low",
            color: "#22C55E",
        };
    }, [monthlyLimit, rawPercent, categoryAlert]);

    const tips = useMemo(() => {
        return {
            one: monthlyLimit > 0
                ? `Spend around ${formatCurrency(Math.round(dailyAvailable))} per day to stay within budget.`
                : "Set a realistic monthly spending limit.",
            two: categoryAlert
                ? `Reduce ${categoryAlert.label} expenses because it is close to the limit.`
                : "Your category spending looks under control.",
            three: spent > monthlyLimit && monthlyLimit > 0
                ? "Pause non-essential purchases until next month."
                : "Avoid unnecessary high-value purchases.",
            four: monthlyLimit > 0
                ? `Try to keep at least ${formatCurrency(Math.round(monthlyLimit * 0.2))} as savings.`
                : "Save a fixed amount before spending.",
        };
    }, [monthlyLimit, spent, dailyAvailable, categoryAlert]);


const handleSaveBudget = async () => {

    const value = Number(budgetInput);

    if (!value || value <= 0) {
        toast.error("Please enter a valid monthly budget.");
        return;
    }

    try {

        setSavingBudget(true);

        await updateMonthlyBudgetAPI(value);

        setMonthlyLimit(value);

        toast.success("Budget saved successfully");

    } catch (error) {

        toast.error(
            error.response?.data?.message ||
            "Unable to save budget"
        );

    } finally {

        setSavingBudget(false);

    }
};

const handleCategoryChange = (name, value) => {
    setCategoryInputs((prev) => ({
        ...prev,
        [name]: value,
    }));
};

const handleSaveCategoryBudgets = async () => {
    const updatedCategories = {
        food: Number(categoryInputs.food || 0),
        shopping: Number(categoryInputs.shopping || 0),
        transport: Number(categoryInputs.transport || 0),
        entertainment: Number(categoryInputs.entertainment || 0),
    };

    const hasInvalidValue = Object.values(
        updatedCategories
    ).some((value) => value < 0);

    if (hasInvalidValue) {
        toast.error(
            "Category budget cannot be negative."
        );
        return;
    }

    try {
        setSavingCategories(true);

        const categoryBudgetList = [
            {
                category: "Food",
                limit: updatedCategories.food,
            },
            {
                category: "Shopping",
                limit: updatedCategories.shopping,
            },
            {
                category: "Transport",
                limit: updatedCategories.transport,
            },
            {
                category: "Entertainment",
                limit: updatedCategories.entertainment,
            },
        ];

        await updateCategoryBudgetsAPI(
            categoryBudgetList
        );

        setCategoryBudgets(
            updatedCategories
        );

        toast.success(
            "Category budgets saved successfully"
        );

    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            "Unable to save category budgets"
        );

    } finally {
        setSavingCategories(false);
    }
};

    const renderCategoryCard = ({
        keyName,
        title,
        description,
        icon,
        className,
        info,
        placeholder,
    }) => {
        return (
            <div className="category-budget-card" key={keyName}>
                <div className="category-budget-top">
                    <div className={`category-budget-icon ${className}`}>
                        <i className={icon}></i>
                    </div>

                    <div>
                        <h3>{title}</h3>
                        <p>{description}</p>
                    </div>
                </div>

                <input
                    type="number"
                    value={categoryInputs[keyName]}
onChange={(e) => handleCategoryChange(keyName, e.target.value)}
                    placeholder={placeholder}
                />

                <div className="category-progress">
                    <div
                        className="category-progress-fill"
                        style={{
                            width: `${info.width}%`,
                            background: info.color,
                        }}
                    ></div>
                </div>

                <div className="category-meta">
                    <span>Spent {formatCurrency(info.spent)}</span>
                    <strong style={{ color: info.color }}>
                        {info.percent.toFixed(0)}%
                    </strong>
                </div>
            </div>
        );
    };

    return (
        <div className="budget-page">
            <div className="dashboard-wrapper budget-page">
                <aside className={`sidebar ${sidebarOpen ? "active" : ""}`}>
                    <div className="sidebar-logo">
                        <i className="fa-solid fa-chart-line"></i>
                        <span>FinWise</span>
                    </div>

                    <nav className="sidebar-menu">
                        <Link to="/dashboard">
                            <i className="fa-solid fa-table-columns"></i>
                            Dashboard
                        </Link>

                        <Link to="/transactions">
                            <i className="fa-solid fa-arrow-right-arrow-left"></i>
                            Transactions
                        </Link>

                        <Link to="/reports">
                            <i className="fa-solid fa-chart-pie"></i>
                            Analytics
                        </Link>

                        <Link to="/insights">
                            <i className="fa-solid fa-lightbulb"></i>
                            Insights
                        </Link>

                        <Link to="/budget" className="active">
                            <i className="fa-solid fa-wallet"></i>
                            Budget
                        </Link>

                        <Link to="/goals">
                            <i className="fa-solid fa-bullseye"></i>
                            Goals
                        </Link>

                        <Link to="/settings">
                            <i className="fa-solid fa-gear"></i>
                            Settings
                        </Link>
                    </nav>

                    <br />
                    <br />

                    <div className="sidebar-card">
                        <div className="sidebar-card-icon">
                            <i className="fa-solid fa-shield-halved"></i>
                        </div>

                        <h4>Smart Finance</h4>

                        <p>
                            Securely track your money and build better financial habits.
                        </p>

                        <button className="sidebar-card-btn">
                            View Insights
                        </button>
                    </div>

                    <div className="logout-card">
                        <div className="logout-header">
                            <div className="logout-icon">
                                <i className="fa-solid fa-right-from-bracket"></i>
                            </div>
                            <h4>Finished Working ?</h4>
                        </div>

                        <p>Save your changes and sign out safely.</p>

                        <button
                            className="logout-btn"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </div>
                </aside>

                <main className="main-content">
                    <header className="topbar premium-topbar">
                        <div className="topbar-left">
                            <button
                                className="menu-toggle"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            >
                                <i className="fa-solid fa-bars"></i>
                            </button>

                            <div>
                                <h2>Budget Planner 💰</h2>
                                <p>Plan monthly limits, track spending, and control your money.</p>
                            </div>
                        </div>

                        <div className="budget-month-pill">
                            <i className="fa-solid fa-calendar-days"></i>
                            <span>{currentMonthText}</span>
                        </div>
                    </header>

                    {pageLoading ? (
                        <div className="budget-skeleton">
                            <div className="budget-skel-grid">
                                <div></div>
                                <div></div>
                                <div></div>
                                <div></div>
                            </div>

                            <div className="budget-skel-wide"></div>
                            <div className="budget-skel-wide small"></div>

                            <div className="budget-skel-grid two">
                                <div></div>
                                <div></div>
                            </div>
                        </div>
                    ) : (
                        <div className="budget-content-wrap">
                            <section className="budget-overview">
                                <div className="budget-card total-budget">
                                    <div className="budget-icon">
                                        <i className="fa-solid fa-wallet"></i>
                                    </div>
                                    <div className="budget-content">
                                        <span>Monthly Budget</span>
                                        <h2>{formatCurrency(monthlyLimit)}</h2>
                                        <small></small>
                                    </div>
                                </div>

                                <div className="budget-card spent-budget">
                                    <div className="budget-icon">
                                        <i className="fa-solid fa-credit-card"></i>
                                    </div>
                                    <div className="budget-content">
                                        <span>Total Spent</span>
                                        <h2>{formatCurrency(spent)}</h2>
                                        <small></small>
                                    </div>
                                </div>

                                <div className="budget-card remaining-budget">
                                    <div className="budget-icon">
                                        <i className="fa-solid fa-piggy-bank"></i>
                                    </div>
                                    <div className="budget-content">
                                        <span>Remaining</span>
                                        <h2>{formatCurrency(Math.max(remaining, 0))}</h2>
                                        <small></small>
                                    </div>
                                </div>

                                <div className="budget-card budget-health">
                                    <div className="budget-icon">
                                        <i className="fa-solid fa-shield-heart"></i>
                                    </div>
                                    <div className="budget-content">
                                        <span>Budget Health</span>
                                        <h2 style={{ color: budgetHealth.color }}>
                                            {budgetHealth.label}
                                        </h2>
                                        <small></small>
                                    </div>
                                </div>
                            </section>

                            <section className="budget-set-card">
                                <div className="budget-set-left">
                                    <h2>Set Your Budget</h2>
                                    <p>Define your spending limit for this month.</p>
                                </div>

                                <div className="budget-set-right">
                                    <div className="budget-input">
                                        <i className="fa-solid fa-indian-rupee-sign"></i>
                                        <input
                                            type="number"
                                            value={budgetInput}
                                            onChange={(e) => setBudgetInput(e.target.value)}
                                            placeholder="Enter monthly budget"
                                        />
                                    </div>

                                    <button
                                        id="saveBudgetBtn"
                                        onClick={handleSaveBudget}
                                        disabled={savingBudget}
                                    >
                                        {savingBudget ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin"></i>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </section>

                            <section className="budget-progress-card">
                                <div className="progress-header">
                                    <div>
                                        <span className="section-label">Budget Progress</span>
                                        <p>Track how much of your budget has been used.</p>
                                    </div>

                                    <strong
                                        id="budgetPercent"
                                        style={{ color: progressColor }}
                                    >
                                        {rawPercent.toFixed(1)}%
                                    </strong>
                                </div>

                                <div className="progress-track">
                                    <div
                                        className="progress-fill"
                                        style={{
                                            width: `${progressPercent}%`,
                                            background: progressColor,
                                        }}
                                    ></div>
                                </div>

                                <div className="progress-details">
                                    <div>
                                        <span>Spent</span>
                                        <strong>{formatCurrency(spent)}</strong>
                                    </div>

                                    <div>
                                        <span>Remaining</span>
                                        <strong>{formatCurrency(Math.max(remaining, 0))}</strong>
                                    </div>

                                    <div>
                                        <span>Daily Available</span>
                                        <strong>{formatCurrency(Math.round(dailyAvailable))}/day</strong>
                                    </div>
                                </div>
                            </section>

                            <section className="category-budget-section">
                                <div className="category-budget-wrapper">
                                    <div className="section-heading">
                                        <span className="section-label">Category Budgets</span>
                                    </div>

                                    <div className="category-budget-grid">
                                        {renderCategoryCard({
                                            keyName: "food",
                                            title: "Food",
                                            description: "Meals, groceries and dining",
                                            icon: "fa-solid fa-utensils",
                                            className: "food",
                                            info: foodInfo,
                                            placeholder: "Enter food budget",
                                        })}

                                        {renderCategoryCard({
                                            keyName: "shopping",
                                            title: "Shopping",
                                            description: "Clothes, gadgets and personal items",
                                            icon: "fa-solid fa-bag-shopping",
                                            className: "shopping",
                                            info: shoppingInfo,
                                            placeholder: "Enter shopping budget",
                                        })}

                                        {renderCategoryCard({
                                            keyName: "transport",
                                            title: "Transport",
                                            description: "Fuel, cab, metro and travel",
                                            icon: "fa-solid fa-car",
                                            className: "transport",
                                            info: transportInfo,
                                            placeholder: "Enter transport budget",
                                        })}

                                        {renderCategoryCard({
                                            keyName: "entertainment",
                                            title: "Entertainment",
                                            description: "Movies, games and subscriptions",
                                            icon: "fa-solid fa-gamepad",
                                            className: "entertainment",
                                            info: entertainmentInfo,
                                            placeholder: "Enter entertainment budget",
                                        })}
                                    </div>

                                    <button
                                        className="save-category-btn"
                                        onClick={handleSaveCategoryBudgets}
                                        disabled={savingCategories}
                                    >
                                        {savingCategories ? (
                                            <>
                                                <i className="fa-solid fa-spinner fa-spin"></i>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                Save Category Budgets
                                            </>
                                        )}
                                    </button>
                                </div>
                            </section>

                            <section className="budget-recommendation-section">
                                <div className="budget-recommendation-card">
                                    <div className="recommendation-left">
                                        <div className="recommendation-icon">
                                            <i className="fa-solid fa-lightbulb"></i>
                                        </div>

                                        <div>

                                            <h2>{recommendation.title}</h2>

                                            <p>{recommendation.text}</p>
                                        </div>
                                    </div>

                                    <div className="recommendation-priority">
                                        <span>Priority</span>
                                        <h3 style={{ color: recommendation.color }}>
                                            {recommendation.priority}
                                        </h3>
                                    </div>
                                </div>
                            </section>

                            <section className="budget-tips-section">
                                <div className="budget-tips-card">
                                    <div className="section-heading">
                                        <span className="section-label">Budget Tips</span>
                                        <h2>Smart Saving Tips</h2>
                                        <p>Simple actions to stay within your budget this month.</p>
                                    </div>

                                    <div className="tips-grid">
                                        <div className="tip-item">
                                            <i className="fa-solid fa-circle-check"></i>
                                            <span>{tips.one}</span>
                                        </div>

                                        <div className="tip-item">
                                            <i className="fa-solid fa-circle-check"></i>
                                            <span>{tips.two}</span>
                                        </div>

                                        <div className="tip-item">
                                            <i className="fa-solid fa-circle-check"></i>
                                            <span>{tips.three}</span>
                                        </div>

                                        <div className="tip-item">
                                            <i className="fa-solid fa-circle-check"></i>
                                            <span>{tips.four}</span>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default Budget;
