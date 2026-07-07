import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import { logout } from "../../utils/auth";
import useAutoLogout from "../../hooks/useAutoLogout";
import { getTransactionsAPI } from "../../services/transactionService";

import "../../assets/css/insights/insights.css";

function Insights() {
    useAutoLogout();

    const user = JSON.parse(localStorage.getItem("user")) || {};
    const userName = user.name || "User";
    const userInitial = userName.charAt(0).toUpperCase();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);

    const formatCurrency = (amount) =>
        "₹" + Number(amount || 0).toLocaleString("en-IN");

    const getMonthName = (index) => {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];

        return months[index];
    };

    const fetchInsights = async () => {
        try {
            setPageLoading(true);

            const startTime = Date.now();
            const data = await getTransactionsAPI();

            setTransactions(data.transactions || []);

            const elapsed = Date.now() - startTime;
            const minimumDelay = 1800;

            if (elapsed < minimumDelay) {
                await new Promise((resolve) =>
                    setTimeout(resolve, minimumDelay - elapsed)
                );
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to load insights"
            );
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        fetchInsights();
    }, []);

    const visibleTransactions = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthData = transactions.filter((transaction) => {
            const date = new Date(transaction.date || transaction.createdAt);

            return (
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
            );
        });

        return currentMonthData;
    }, [transactions]);

    const totals = useMemo(() => {
        let income = 0;
        let expense = 0;

        visibleTransactions.forEach((transaction) => {
            const amount = Number(transaction.amount || 0);

            if (transaction.type === "income") {
                income += amount;
            }

            if (transaction.type === "expense") {
                expense += amount;
            }
        });

        return {
            income,
            expense,
            balance: income - expense,
        };
    }, [visibleTransactions]);

    const savingRate =
        totals.income > 0
            ? Math.max(0, (totals.balance / totals.income) * 100)
            : 0;

    const healthScore = useMemo(() => {
        if (totals.income <= 0) return 0;

        const rate = (totals.balance / totals.income) * 100;
        const expenseRate = (totals.expense / totals.income) * 100;

        let score =
            Math.max(0, rate) * 0.65 +
            Math.max(0, 100 - expenseRate) * 0.35;

        score += Math.min(visibleTransactions.length, 20);

        return Math.round(Math.min(100, Math.max(0, score)));
    }, [totals, visibleTransactions]);

    const expenses = visibleTransactions.filter(
        (transaction) => transaction.type === "expense"
    );

    const categoryTotals = useMemo(() => {
        const data = {};

        expenses.forEach((transaction) => {
            const category = transaction.category || "Others";
            const amount = Number(transaction.amount || 0);

            data[category] = (data[category] || 0) + amount;
        });

        return Object.entries(data)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount);
    }, [expenses]);

    const categoryCounts = useMemo(() => {
        const data = {};

        expenses.forEach((transaction) => {
            const category = transaction.category || "Others";
            data[category] = (data[category] || 0) + 1;
        });

        return Object.entries(data)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count);
    }, [expenses]);

    const topCategory = categoryTotals[0];
    const frequentCategory = categoryCounts[0];

    const largestExpense = expenses.length > 0
        ? expenses.reduce((max, transaction) =>
            Number(transaction.amount) > Number(max.amount)
                ? transaction
                : max,
            expenses[0]
        )
        : null;

    const bestSavingMonth = useMemo(() => {
        const months = Array.from({ length: 12 }, (_, index) => ({
            month: getMonthName(index),
            income: 0,
            expense: 0,
            savings: 0,
        }));

        visibleTransactions.forEach((transaction) => {
            const date = new Date(transaction.date || transaction.createdAt);
            const month = date.getMonth();
            const amount = Number(transaction.amount || 0);

            if (transaction.type === "income") {
                months[month].income += amount;
            }

            if (transaction.type === "expense") {
                months[month].expense += amount;
            }
        });

        months.forEach((item) => {
            item.savings = item.income - item.expense;
        });

        const best = months.reduce(
            (max, item) => item.savings > max.savings ? item : max,
            months[0]
        );

        return best.savings > 0
            ? best
            : { month: "--", savings: 0 };
    }, [visibleTransactions]);

    const recommendation = useMemo(() => {
        if (visibleTransactions.length === 0) {
            return {
                title: "No insights available yet",
                text: "Add income and expense transactions to generate personalized financial recommendations.",
                priority: "Low",
                color: "#94A3B8",
            };
        }

        if (totals.expense > totals.income && totals.income > 0) {
            return {
                title: "Overspending detected",
                text: "Your expenses are higher than your income. Try reducing non-essential spending first.",
                priority: "Critical",
                color: "#EF4444",
            };
        }

        if (topCategory && totals.expense > 0) {
            const categoryShare = (topCategory.amount / totals.expense) * 100;

            if (categoryShare >= 40) {
                return {
                    title: `Reduce ${topCategory.category} expenses`,
                    text: `${categoryShare.toFixed(1)}% of your spending is on ${topCategory.category}. Reducing it can improve your monthly savings.`,
                    priority: "High",
                    color: "#F59E0B",
                };
            }
        }

        if (savingRate >= 40) {
            return {
                title: "Excellent saving habit",
                text: "You are saving a strong portion of your income. Keep maintaining this financial discipline.",
                priority: "Low",
                color: "#22C55E",
            };
        }

        return {
            title: "Improve your savings rate",
            text: "Try saving at least 20% of your income every month to build stronger financial stability.",
            priority: "Medium",
            color: "#38BDF8",
        };
    }, [visibleTransactions, totals, topCategory, savingRate]);

    const habitOne = savingRate >= 40
        ? {
            title: "Excellent Saver",
            text: "You are saving a strong portion of your income.",
        }
        : {
            title: "Savings Builder",
            text: "Try increasing your savings rate step by step.",
        };

    const habitTwo = totals.expense <= totals.income
        ? {
            title: "Budget Conscious",
            text: "Your expenses are under control.",
        }
        : {
            title: "High Spender",
            text: "Expenses are higher than income this month.",
        };

    const incomeTransactions = visibleTransactions.filter(
        (transaction) => transaction.type === "income"
    );

    const habitThree = incomeTransactions.length >= 2
        ? {
            title: "Consistent Earner",
            text: "Income records show regular money inflow.",
        }
        : {
            title: "Income Tracker",
            text: "Add income regularly for better insights.",
        };

    const habitFour = healthScore >= 75
        ? {
            title: "Smart Planner",
            text: "Your financial health score is strong.",
        }
        : {
            title: "Planning Needed",
            text: "Review spending and set monthly saving targets.",
        };

    const tipOne = topCategory
        ? {
            title: `Reduce ${topCategory.category}`,
            text: `Your highest spending is in ${topCategory.category}. Try reducing it by 10% next month.`,
        }
        : {
            title: "Reduce Shopping",
            text: "Reduce unnecessary shopping expenses this month.",
        };

    const tipThree = savingRate < 20
        ? {
            title: "Increase Savings",
            text: "Try saving at least 20% of your income for better financial stability.",
        }
        : {
            title: "Maintain Savings",
            text: "Your savings are on track. Keep this habit consistent.",
        };

    return (
        <div className="dashboard-wrapper insights-page">
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

                    <Link to="/insights" className="active">
                        <i className="fa-solid fa-lightbulb"></i>
                        Insights
                    </Link>

                    <a href="#">
                        <i className="fa-solid fa-wallet"></i>
                        Budget
                    </a>

                    <a href="#">
                        <i className="fa-solid fa-bullseye"></i>
                        Goals
                    </a>

                    <a href="#">
                        <i className="fa-solid fa-gear"></i>
                        Settings
                    </a>
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
                            <h2>Insights Center 💡</h2>

                            <p>
                                AI-powered insights to help you save more and spend wisely.
                            </p>
                        </div>
                    </div>

<div className="topbar-actions">

    <div className="insight-status">
        <i className="fa-solid fa-circle-check"></i>
        Live Insights
    </div>

    <div className="profile-card">

        <div className="user-avatar">
            {userInitial}
        </div>

        <div className="user-info">
            <h4>{userName}</h4>
            <span>Verified User</span>
        </div>

    </div>

</div>
                </header>

                {pageLoading ? (
                    <div className="insights-skeleton">
                        <div className="skeleton-card skeleton-hero"></div>

                        <div className="skeleton-grid four">
                            <div className="skeleton-card"></div>
                            <div className="skeleton-card"></div>
                            <div className="skeleton-card"></div>
                            <div className="skeleton-card"></div>
                        </div>

                        <div className="skeleton-grid two">
                            <div className="skeleton-card skeleton-medium"></div>
                            <div className="skeleton-card skeleton-medium"></div>
                        </div>

                        <div className="skeleton-grid two">
                            <div className="skeleton-card skeleton-small"></div>
                            <div className="skeleton-card skeleton-small"></div>
                        </div>
                    </div>
                ) : (
                    <div className="insights-content" style={{ display: "block" }}>
                        <section className="snapshot-grid">
                            <div className="snapshot-card income">
                                <div className="snapshot-icon">
                                    <i className="fa-solid fa-wallet"></i>
                                </div>

                                <div className="snapshot-content">
                                    <span>Monthly Income</span>
                                    <h2>{formatCurrency(totals.income)}</h2>
                                    <small>
                                        {totals.income > 0
                                            ? "Money received"
                                            : "No income recorded"}
                                    </small>
                                </div>
                            </div>

                            <div className="snapshot-card expense">
                                <div className="snapshot-icon">
                                    <i className="fa-solid fa-credit-card"></i>
                                </div>

                                <div className="snapshot-content">
                                    <span>Monthly Expense</span>
                                    <h2>{formatCurrency(totals.expense)}</h2>
                                    <small>
                                        {totals.expense <= totals.income
                                            ? "Within Budget"
                                            : "Overspending"}
                                    </small>
                                </div>
                            </div>

                            <div className="snapshot-card savings">
                                <div className="snapshot-icon">
                                    <i className="fa-solid fa-sack-dollar"></i>
                                </div>

                                <div className="snapshot-content">
                                    <span>Savings Rate</span>
                                    <h2>{savingRate.toFixed(1)}%</h2>
                                    <small>
                                        {savingRate >= 40
                                            ? "Excellent Saving"
                                            : savingRate >= 20
                                                ? "Good Saving"
                                                : "Needs Improvement"}
                                    </small>
                                </div>
                            </div>

                            <div className="snapshot-card health">
                                <div className="snapshot-icon">
                                    <i className="fa-solid fa-heart-pulse"></i>
                                </div>

                                <div className="snapshot-content">
                                    <span>Financial Health</span>
                                    <h2>{healthScore}%</h2>
                                    <small>
                                        {healthScore >= 85
                                            ? "Excellent"
                                            : healthScore >= 70
                                                ? "Good"
                                                : healthScore >= 50
                                                    ? "Average"
                                                    : "Needs Attention"}
                                    </small>
                                </div>
                            </div>
                        </section>

                        <section className="recommendation-section">
                            <div className="recommendation-card">
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

                        <section className="analysis-section">
                            <div className="section-heading">
                                <span className="section-label">Spending Analysis</span>
                                <h2>Financial Breakdown</h2>
                                <p>
                                    Understand where your money goes and identify your spending habits.
                                </p>
                            </div>

                            <div className="analysis-grid">
                                <div className="analysis-card">
                                    <div className="analysis-top">
                                        <div className="analysis-icon highest">
                                            <i className="fa-solid fa-arrow-trend-up"></i>
                                        </div>

                                        <div className="analysis-title">
                                            <h4>Highest Spending</h4>
                                            <small>Category where you spend the most</small>
                                        </div>
                                    </div>

                                    <div className="analysis-body">
                                        <h3>{topCategory?.category || "--"}</h3>
                                        <p>{formatCurrency(topCategory?.amount || 0)}</p>
                                    </div>
                                </div>

                                <div className="analysis-card">
                                    <div className="analysis-top">
                                        <div className="analysis-icon frequent">
                                            <i className="fa-solid fa-repeat"></i>
                                        </div>

                                        <div className="analysis-title">
                                            <h4>Most Frequent</h4>
                                            <small>Most used expense category</small>
                                        </div>
                                    </div>

                                    <div className="analysis-body">
                                        <h3>{frequentCategory?.category || "--"}</h3>
                                        <p>{frequentCategory?.count || 0} Transactions</p>
                                    </div>
                                </div>

                                <div className="analysis-card">
                                    <div className="analysis-top">
                                        <div className="analysis-icon transaction">
                                            <i className="fa-solid fa-money-bill-wave"></i>
                                        </div>

                                        <div className="analysis-title">
                                            <h4>Largest Expense</h4>
                                            <small>Biggest single expense</small>
                                        </div>
                                    </div>

                                    <div className="analysis-body">
                                        <h3>{largestExpense?.title || "--"}</h3>
                                        <p>{formatCurrency(largestExpense?.amount || 0)}</p>
                                    </div>
                                </div>

                                <div className="analysis-card">
                                    <div className="analysis-top">
                                        <div className="analysis-icon saving">
                                            <i className="fa-solid fa-piggy-bank"></i>
                                        </div>

                                        <div className="analysis-title">
                                            <h4>Best Saving Month</h4>
                                            <small>Highest monthly savings</small>
                                        </div>
                                    </div>

                                    <div className="analysis-body">
                                        <h3>{bestSavingMonth.month}</h3>
                                        <p>{formatCurrency(bestSavingMonth.savings)} Saved</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="habits-section">
                            <div className="section-heading">
                                <span className="section-label">Financial Habits</span>
                                <h2>Your Money Personality</h2>
                                <p>
                                    Based on your transactions, we've identified your financial habits.
                                </p>
                            </div>

                            <div className="habits-grid">
                                <div className="habit-card">
                                    <div className="habit-icon excellent">
                                        <i className="fa-solid fa-piggy-bank"></i>
                                    </div>
                                    <div className="habit-content">
                                        <h4>{habitOne.title}</h4>
                                        <p>{habitOne.text}</p>
                                    </div>
                                </div>

                                <div className="habit-card">
                                    <div className="habit-icon budget">
                                        <i className="fa-solid fa-wallet"></i>
                                    </div>
                                    <div className="habit-content">
                                        <h4>{habitTwo.title}</h4>
                                        <p>{habitTwo.text}</p>
                                    </div>
                                </div>

                                <div className="habit-card">
                                    <div className="habit-icon income">
                                        <i className="fa-solid fa-chart-line"></i>
                                    </div>
                                    <div className="habit-content">
                                        <h4>{habitThree.title}</h4>
                                        <p>{habitThree.text}</p>
                                    </div>
                                </div>

                                <div className="habit-card">
                                    <div className="habit-icon planner">
                                        <i className="fa-solid fa-lightbulb"></i>
                                    </div>
                                    <div className="habit-content">
                                        <h4>{habitFour.title}</h4>
                                        <p>{habitFour.text}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="tips-section">
                            <div className="section-heading">
                                <span className="section-label">Money Saving Tips</span>
                                <h2>Personalized Recommendations</h2>
                                <p>
                                    Smart suggestions to improve your financial habits and maximize your savings.
                                </p>
                            </div>

                            <div className="tips-grid">
                                <div className="tip-card">
                                    <div className="tip-top">
                                        <div className="tip-icon shopping">
                                            <i className="fa-solid fa-cart-shopping"></i>
                                        </div>
                                        <div className="tip-content">
                                            <h4>{tipOne.title}</h4>
                                            <p>{tipOne.text}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="tip-card">
                                    <div className="tip-top">
                                        <div className="tip-icon food">
                                            <i className="fa-solid fa-utensils"></i>
                                        </div>
                                        <div className="tip-content">
                                            <h4>Set Weekly Limits</h4>
                                            <p>
                                                Divide your monthly expense budget into weekly limits to avoid overspending.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="tip-card">
                                    <div className="tip-top">
                                        <div className="tip-icon saving">
                                            <i className="fa-solid fa-piggy-bank"></i>
                                        </div>
                                        <div className="tip-content">
                                            <h4>{tipThree.title}</h4>
                                            <p>{tipThree.text}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="tip-card">
                                    <div className="tip-top">
                                        <div className="tip-icon tracking">
                                            <i className="fa-solid fa-chart-line"></i>
                                        </div>
                                        <div className="tip-content">
                                            <h4>Track Every Expense</h4>
                                            <p>
                                                Recording every transaction helps identify unnecessary spending patterns.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
            </main>
        </div>
    );
}

export default Insights;
