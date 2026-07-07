import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";

import { Bar, Doughnut, Line } from "react-chartjs-2";

import { logout } from "../../utils/auth";
import useAutoLogout from "../../hooks/useAutoLogout";
import { getTransactionsAPI } from "../../services/transactionService";

import "../../assets/css/reports/reports.css";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    Filler
);

function Reports() {
    useAutoLogout();

    const user = JSON.parse(localStorage.getItem("user")) || {};
    const userName = user.name || "User";
    const userInitial = userName.charAt(0).toUpperCase();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);
    const [monthFilter, setMonthFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState("all");

    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];

    const years = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return Array.from({ length: 5 }, (_, i) => currentYear - i);
    }, []);

    const formatCurrency = (amount) =>
        "₹" + Number(amount || 0).toLocaleString("en-IN");

    const fetchReports = async () => {
        try {
            setPageLoading(true);

            const startTime = Date.now();
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
                "Failed to load reports"
            );
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const filteredTransactions = useMemo(() => {
        return transactions.filter((item) => {
            const date = new Date(item.date || item.createdAt);

            const monthMatch =
                monthFilter === "all" ||
                date.getMonth() === Number(monthFilter);

            const yearMatch =
                yearFilter === "all" ||
                date.getFullYear() === Number(yearFilter);

            return monthMatch && yearMatch;
        });
    }, [transactions, monthFilter, yearFilter]);

    const totalIncome = filteredTransactions
        .filter((item) => item.type === "income")
        .reduce((sum, item) => sum + Number(item.amount), 0);

    const totalExpense = filteredTransactions
        .filter((item) => item.type === "expense")
        .reduce((sum, item) => sum + Number(item.amount), 0);

    const netBalance = totalIncome - totalExpense;

    const monthlyData = useMemo(() => {
        const data = monthNames.map((month) => ({
            month,
            income: 0,
            expense: 0,
            savings: 0,
        }));

        filteredTransactions.forEach((item) => {
            const month = new Date(item.date || item.createdAt).getMonth();

            if (item.type === "income") {
                data[month].income += Number(item.amount);
            }

            if (item.type === "expense") {
                data[month].expense += Number(item.amount);
            }
        });

        data.forEach((item) => {
            item.savings = item.income - item.expense;
        });

        return data;
    }, [filteredTransactions]);

    const categoryTotals = useMemo(() => {
        const totals = {};

        filteredTransactions.forEach((item) => {
            if (item.type !== "expense") return;

            totals[item.category] =
                (totals[item.category] || 0) + Number(item.amount);
        });

        return totals;
    }, [filteredTransactions]);

    const topCategories = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

    const expenses = filteredTransactions.filter(
        (item) => item.type === "expense"
    );

    const highestExpense =
        expenses.length > 0
            ? Math.max(...expenses.map((item) => Number(item.amount)))
            : 0;

    const averageExpense =
        expenses.length > 0
            ? Math.round(
                expenses.reduce((sum, item) => sum + Number(item.amount), 0) /
                expenses.length
            )
            : 0;

    const bestSavingMonth = monthlyData.reduce(
        (best, current) =>
            current.savings > best.savings ? current : best,
        monthlyData[0]
    );

    const healthScore = useMemo(() => {
        if (totalIncome <= 0) return 0;

        const savingRate = (netBalance / totalIncome) * 100;
        const expenseRate = (totalExpense / totalIncome) * 100;

        const score =
            Math.max(0, savingRate) * 0.65 +
            Math.max(0, 100 - expenseRate) * 0.35;

        return Math.round(Math.min(100, Math.max(0, score)));
    }, [totalIncome, totalExpense, netBalance]);

    const healthData = useMemo(() => {
        if (healthScore >= 85) {
            return {
                status: "Excellent",
                message: "Your savings pattern is strong. Keep maintaining this discipline.",
                color: "#22C55E",
            };
        }

        if (healthScore >= 70) {
            return {
                status: "Good",
                message: "Your finances look healthy. Try increasing your savings rate slowly.",
                color: "#38BDF8",
            };
        }

        if (healthScore >= 55) {
            return {
                status: "Average",
                message: "You are stable, but expenses can be optimized for better savings.",
                color: "#EAB308",
            };
        }

        if (healthScore > 0) {
            return {
                status: "Needs Attention",
                message: "Expenses are too close to income. Review your spending categories.",
                color: "#EF4444",
            };
        }

        return {
            status: "No Data",
            message: "Add income and expense transactions to calculate your score.",
            color: "#64748B",
        };
    }, [healthScore]);

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1500,
            easing: "easeOutQuart",
        },
        interaction: {
            mode: "index",
            intersect: false,
        },
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    color: "#CBD5E1",
                    usePointStyle: true,
                    pointStyle: "circle",
                    padding: 18,
                },
            },
            tooltip: {
                backgroundColor: "#020617",
                titleColor: "#F8FAFC",
                bodyColor: "#CBD5E1",
                borderColor: "rgba(255,255,255,.10)",
                borderWidth: 1,
                padding: 14,
                cornerRadius: 14,
                callbacks: {
                    label: (context) =>
                        `${context.dataset.label || "Amount"}: ${formatCurrency(context.raw)}`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: "#94A3B8",
                    callback: (value) => "₹" + value,
                },
                grid: {
                    color: "rgba(255,255,255,.06)",
                },
            },
            x: {
                ticks: {
                    color: "#94A3B8",
                },
                grid: {
                    display: false,
                },
            },
        },
    };

    const incomeExpenseData = {
        labels: monthlyData.map((item) => item.month),
        datasets: [
            {
                label: "Income",
                data: monthlyData.map((item) => item.income),
                backgroundColor: "rgba(34,197,94,.65)",
                borderRadius: 8,
                maxBarThickness: 22,
            },
            {
                label: "Expense",
                data: monthlyData.map((item) => item.expense),
                backgroundColor: "rgba(239,68,68,.65)",
                borderRadius: 8,
                maxBarThickness: 22,
            },
        ],
    };

    const categoryData = {
        labels: Object.keys(categoryTotals).length
            ? Object.keys(categoryTotals)
            : ["No Data"],
        datasets: [
            {
                data: Object.values(categoryTotals).length
                    ? Object.values(categoryTotals)
                    : [1],
                backgroundColor: [
                    "rgba(37,99,235,.8)",
                    "rgba(34,197,94,.8)",
                    "rgba(239,68,68,.8)",
                    "rgba(168,85,247,.8)",
                    "rgba(245,158,11,.8)",
                    "rgba(14,165,233,.8)",
                ],
                borderWidth: 0,
            },
        ],
    };

    const cashFlowData = {
        labels: monthlyData.map((item) => item.month),
        datasets: [
            {
                label: "Income",
                data: monthlyData.map((item) => item.income),
                borderColor: "rgba(34,197,94,1)",
                backgroundColor: "rgba(34,197,94,.12)",
                tension: 0.4,
                fill: true,
            },
            {
                label: "Expense",
                data: monthlyData.map((item) => item.expense),
                borderColor: "rgba(239,68,68,1)",
                backgroundColor: "rgba(239,68,68,.12)",
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const monthlySpendingData = {
        labels: monthlyData.map((item) => item.month),
        datasets: [
            {
                label: "Expense",
                data: monthlyData.map((item) => item.expense),
                backgroundColor: "rgba(239,68,68,.75)",
                borderRadius: 12,
                borderSkipped: false,
            },
        ],
    };

    const savingsData = {
        labels: monthlyData.map((item) => item.month),
        datasets: [
            {
                label: "Savings",
                data: monthlyData.map((item) => item.savings),
                borderColor: "rgba(56,189,248,1)",
                backgroundColor: "rgba(56,189,248,.12)",
                tension: 0.4,
                fill: true,
            },
        ],
    };

    return (
        <div className="dashboard-wrapper reports-page">

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

                    <Link to="/reports" className="active">
                        <i className="fa-solid fa-chart-pie"></i>
                        Analytics
                    </Link>

                    <Link to="/insights">
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
                            <h2>Reports & Analytics</h2>
                            <p>
                                Visualize your financial performance with interactive charts and insights.
                            </p>
                        </div>
                    </div>

<div className="topbar-actions">

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
                    <div className="reports-loader" style={{ display: "block" }}>
                        <div className="loader-card"></div>

                        <div className="loader-cards">
                            <div className="loader-small"></div>
                            <div className="loader-small"></div>
                            <div className="loader-small"></div>
                            <div className="loader-small"></div>
                        </div>

                        <div className="loader-chart"></div>
                        <div className="loader-chart"></div>
                    </div>
                ) : (
                    <>
                        <section className="reports-filter-bar">
                            <div>
                                <span className="section-label">
                                    Analytics Overview
                                </span>

                                <p>
                                    Analyze your income, expenses, savings and category trends.
                                </p>
                            </div>

                            <div className="report-filters">
                                <select
                                    value={monthFilter}
                                    onChange={(e) => setMonthFilter(e.target.value)}
                                >
                                    <option value="all">All Months</option>
                                    <option value="0">January</option>
                                    <option value="1">February</option>
                                    <option value="2">March</option>
                                    <option value="3">April</option>
                                    <option value="4">May</option>
                                    <option value="5">June</option>
                                    <option value="6">July</option>
                                    <option value="7">August</option>
                                    <option value="8">September</option>
                                    <option value="9">October</option>
                                    <option value="10">November</option>
                                    <option value="11">December</option>
                                </select>

                                <select
                                    value={yearFilter}
                                    onChange={(e) => setYearFilter(e.target.value)}
                                >
                                    <option value="all">All Years</option>

                                    {years.map((year) => (
                                        <option key={year} value={year}>
                                            {year}
                                        </option>
                                    ))}
                                </select>

                                <button
                                    onClick={() => {
                                        setMonthFilter("all");
                                        setYearFilter("all");
                                    }}
                                >
                                    <i className="fa-solid fa-rotate-right"></i>
                                    Reset
                                </button>
                            </div>
                        </section>

                        {filteredTransactions.length === 0 ? (
                            <div className="reports-empty" style={{ display: "block" }}>
                                <i className="fa-solid fa-chart-column"></i>

                                <h2>No Reports Yet</h2>

                                <p>
                                    Start adding income and expense transactions to generate beautiful financial reports.
                                </p>
                            </div>
                        ) : (
                            <>
                                <section className="report-cards">
                                    <div className="report-card income-card">
                                        <div className="report-card-top">
                                            <div className="card-icon income">
                                                <i className="fa-solid fa-arrow-trend-up"></i>
                                            </div>
                                            <span>Total Income</span>
                                        </div>

                                        <h3>{formatCurrency(totalIncome)}</h3>
                                        <p>Total money received</p>
                                    </div>

                                    <div className="report-card expense-card">
                                        <div className="report-card-top">
                                            <div className="card-icon expense">
                                                <i className="fa-solid fa-arrow-trend-down"></i>
                                            </div>
                                            <span>Total Expense</span>
                                        </div>

                                        <h3>{formatCurrency(totalExpense)}</h3>
                                        <p>Total money spent</p>
                                    </div>

                                    <div className="report-card savings-card">
                                        <div className="report-card-top">
                                            <div className="card-icon balance">
                                                <i className="fa-solid fa-piggy-bank"></i>
                                            </div>
                                            <span>Net Savings</span>
                                        </div>

                                        <h3>{formatCurrency(netBalance)}</h3>
                                        <p>Income minus expenses</p>
                                    </div>

                                    <div className="report-card transaction-card">
                                        <div className="report-card-top">
                                            <div className="card-icon transactions">
                                                <i className="fa-solid fa-receipt"></i>
                                            </div>
                                            <span>Transactions</span>
                                        </div>

                                        <h3>{filteredTransactions.length}</h3>
                                        <p>Total records analyzed</p>
                                    </div>
                                </section>

                                <section className="health-section">
                                    <div className="health-card">
                                        <div className="health-left">
                                            <span className="section-label">
                                                Financial Health
                                            </span>

                                            <h3>Your Money Score</h3>

                                            <p>
                                                Score is calculated from income, expenses,
                                                savings and spending balance.
                                            </p>
                                        </div>

                                        <div className="health-score-box">
                                            <div
                                                className="score-circle"
                                                style={{
                                                    background: `conic-gradient(
                                                        ${healthData.color} 0deg,
                                                        ${healthData.color} ${(healthScore / 100) * 360}deg,
                                                        rgba(255,255,255,.08) ${(healthScore / 100) * 360}deg
                                                    )`,
                                                }}
                                            >
                                                <span>{healthScore}%</span>
                                            </div>

                                            <div>
                                                <h4 style={{ color: healthData.color }}>
                                                    {healthData.status}
                                                </h4>

                                                <p>{healthData.message}</p>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="charts-grid">
                                    <div className="chart-card chart-large">
                                        <div className="chart-header">
                                            <div>
                                                <h3>Income vs Expense</h3>
                                                <p>Compare total income and spending</p>
                                            </div>
                                            <span className="chart-badge">Overview</span>
                                        </div>

                                        <div className="chart-box">
                                            <Bar
                                                data={incomeExpenseData}
                                                options={commonOptions}
                                            />
                                        </div>
                                    </div>

                                    <div className="chart-card">
                                        <div className="chart-header">
                                            <div>
                                                <h3>Category Breakdown</h3>
                                                <p>Spending by category</p>
                                            </div>
                                            <span className="chart-badge">Category</span>
                                        </div>

                                        <div className="chart-box">
                                            <Doughnut
                                                data={categoryData}
                                                options={{
                                                    responsive: true,
                                                    maintainAspectRatio: false,
                                                    cutout: "68%",
                                                    plugins: {
                                                        legend: {
                                                            position: "bottom",
                                                            labels: {
                                                                color: "#CBD5E1",
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="chart-card">
                                        <div className="chart-header">
                                            <div>
                                                <h3>Cash Flow Trend</h3>
                                                <p>Income and expense movement</p>
                                            </div>
                                            <span className="chart-badge">Trend</span>
                                        </div>

                                        <div className="chart-box">
                                            <Line
                                                data={cashFlowData}
                                                options={commonOptions}
                                            />
                                        </div>
                                    </div>

                                    <div className="chart-card">
                                        <div className="chart-header">
                                            <div>
                                                <h3>Monthly Spending</h3>
                                                <p>Month-wise expense history</p>
                                            </div>
                                            <span className="chart-badge">Monthly</span>
                                        </div>

                                        <div className="chart-box">
                                            <Bar
                                                data={monthlySpendingData}
                                                options={commonOptions}
                                            />
                                        </div>
                                    </div>

                                    <div className="chart-card">
                                        <div className="chart-header">
                                            <div>
                                                <h3>Savings Performance</h3>
                                                <p>Monthly savings comparison</p>
                                            </div>
                                            <span className="chart-badge">Savings</span>
                                        </div>

                                        <div className="chart-box">
                                            <Line
                                                data={savingsData}
                                                options={commonOptions}
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="insights-grid">
                                    <div className="insight-card">
                                        <div className="insight-header">
                                            <div>
                                                <h3>Top Spending Categories</h3>
                                                <p>Your highest expense areas</p>
                                            </div>

                                            <i className="fa-solid fa-ranking-star"></i>
                                        </div>

                                        <div className="top-category-list">
                                            {topCategories.length === 0 ? (
                                                <div className="category-row">
                                                    <span>No expense data found</span>
                                                    <strong>₹0</strong>
                                                </div>
                                            ) : (
                                                topCategories.map(([category, amount]) => (
                                                    <div
                                                        className="category-row"
                                                        key={category}
                                                    >
                                                        <span>{category}</span>
                                                        <strong>{formatCurrency(amount)}</strong>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div className="insight-card">
                                        <div className="insight-header">
                                            <div>
                                                <h3>Quick Financial Stats</h3>
                                                <p>Important numbers from your records</p>
                                            </div>

                                            <i className="fa-solid fa-chart-simple"></i>
                                        </div>

                                        <div className="quick-stats">
                                            <div>
                                                <span>Highest Expense</span>
                                                <strong>{formatCurrency(highestExpense)}</strong>
                                            </div>

                                            <div>
                                                <span>Average Expense</span>
                                                <strong>{formatCurrency(averageExpense)}</strong>
                                            </div>

                                            <div>
                                                <span>Best Saving Month</span>
                                                <strong>
                                                    {bestSavingMonth?.savings > 0
                                                        ? bestSavingMonth.month
                                                        : "-"}
                                                </strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="insight-card smart-insight">
                                        <div className="insight-header">
                                            <div>
                                                <h3>Smart Insight</h3>
                                                <p>Personalized financial suggestion</p>
                                            </div>

                                            <i className="fa-solid fa-lightbulb"></i>
                                        </div>

                                        <div className="smart-box">
                                            <h4>
                                                {totalExpense > totalIncome
                                                    ? "Expenses are higher than income"
                                                    : totalIncome > 0 &&
                                                      totalExpense <= totalIncome * 0.5
                                                        ? "Great savings performance"
                                                        : "Balanced financial activity"}
                                            </h4>

                                            <p>
                                                {totalExpense > totalIncome
                                                    ? "Your spending is above your income. Try reducing high expense categories first."
                                                    : totalIncome > 0 &&
                                                      totalExpense <= totalIncome * 0.5
                                                        ? "You are spending less than half of your income. This is a strong saving pattern."
                                                        : "Your income and expenses look balanced. Keep tracking regularly for better control."}
                                            </p>
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default Reports;