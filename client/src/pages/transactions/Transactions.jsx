import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import { logout } from "../../utils/auth";
import useAutoLogout from "../../hooks/useAutoLogout";

import {
    getTransactionsAPI,
    addTransactionAPI,
    deleteTransactionAPI,
    updateTransactionAPI,
} from "../../services/transactionService";

import "../../assets/css/transactions/transactions.css";

function Transactions() {
    useAutoLogout();

    const rowsPerPage = 10;

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [transactions, setTransactions] = useState([]);

    const [modalOpen, setModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [filterOpen, setFilterOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [sortType, setSortType] = useState("latest");

    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        amount: "",
        type: "",
        category: "",
        date: "",
    });

    const fetchTransactions = async () => {
        try {
            setPageLoading(true);

            const startTime = Date.now();
            const data = await getTransactionsAPI();

            setTransactions(data.transactions || []);
            resetModal();

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
                "Failed to load transactions"
            );
        } finally {
            setPageLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const formatCurrency = (amount) =>
        "₹" + Number(amount || 0).toLocaleString("en-IN");

    const formatDate = (dateValue) => {
        if (!dateValue) return "No Date";

        return new Date(dateValue).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const totalIncome = useMemo(() => {
        return transactions
            .filter((item) => item.type === "income")
            .reduce((sum, item) => sum + Number(item.amount), 0);
    }, [transactions]);

    const totalExpense = useMemo(() => {
        return transactions
            .filter((item) => item.type === "expense")
            .reduce((sum, item) => sum + Number(item.amount), 0);
    }, [transactions]);

    const netBalance = totalIncome - totalExpense;

    const filteredTransactions = useMemo(() => {
        let data = [...transactions];

        if (search.trim()) {
            data = data.filter((item) =>
                item.title.toLowerCase().includes(search.toLowerCase()) ||
                item.category.toLowerCase().includes(search.toLowerCase())
            );
        }

        if (typeFilter) {
            data = data.filter((item) => item.type === typeFilter);
        }

        if (categoryFilter) {
            data = data.filter((item) => item.category === categoryFilter);
        }

        if (sortType === "oldest") {
            data.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (sortType === "high") {
            data.sort((a, b) => Number(b.amount) - Number(a.amount));
        } else if (sortType === "low") {
            data.sort((a, b) => Number(a.amount) - Number(b.amount));
        } else {
            data.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        }

        return data;
    }, [transactions, search, typeFilter, categoryFilter, sortType]);

    const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);

    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const activeFilters =
        search.trim() ||
        typeFilter ||
        categoryFilter ||
        sortType !== "latest";

    const resetFilters = () => {
        setSearch("");
        setTypeFilter("");
        setCategoryFilter("");
        setSortType("latest");
        setCurrentPage(1);
        setFilterOpen(false);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const resetModal = () => {
        setFormData({
            title: "",
            amount: "",
            type: "",
            category: "",
            date: "",
        });
        setEditingId(null);
        setModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.title ||
            !formData.amount ||
            !formData.type ||
            !formData.category ||
            !formData.date
        ) {
            toast.error("Please fill all fields");
            return;
        }

        if (Number(formData.amount) <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }

        try {
            setSaving(true);

            const payload = {
                title: formData.title.trim(),
                amount: Number(formData.amount),
                type: formData.type,
                category: formData.category,
                date: formData.date,
            };

            if (editingId) {

                await updateTransactionAPI(
                    editingId,
                    payload
                );

                toast.success(
                    "Transaction updated successfully"
                );

            } else {

                await addTransactionAPI(
                    payload
                );

                toast.success(
                    "Transaction added successfully"
                );

                

            }
            resetModal();

            const data = await getTransactionsAPI();
            setTransactions(data.transactions || []);
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to add transaction"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {

        const result = await Swal.fire({
            title: "Delete Transaction?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#64748B",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
            reverseButtons: true,
        });

        if (!result.isConfirmed) return;

        try {

            await deleteTransactionAPI(id);

            await Swal.fire({
                icon: "success",
                title: "Deleted!",
                text: "Transaction deleted successfully.",
                timer: 1800,
                showConfirmButton: false,
            });

            setTransactions((prev) =>
                prev.filter((item) => item._id !== id)
            );

        } catch (error) {

            Swal.fire({
                icon: "error",
                title: "Oops...",
                text:
                    error.response?.data?.message ||
                    "Failed to delete transaction.",
            });

        }

    };

    const openEdit = (transaction) => {

        setEditingId(transaction._id);

        setFormData({

            title: transaction.title,
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category,
            date: transaction.date.split("T")[0],

        });

        setModalOpen(true);

    };

    return (
        <div className="dashboard-wrapper">
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

                    <Link to="/transactions" className="active">
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

                    <a href="/budget">
                        <i className="fa-solid fa-wallet"></i>
                        Budget
                    </a>

                    <a href="/goals">
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
                <header className="topbar">
                    <div className="header-left">
                        <button
                            className="menu-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <i className="fa-solid fa-bars"></i>
                        </button>

                        <div className="welcome">
                            <h1>All Transactions</h1>
                            <p>
                                Search, filter, edit and organize your financial records.
                            </p>
                        </div>
                    </div>

                    <div className="top-actions">
                        <button
                            className={`reset-filter-btn ${activeFilters ? "show" : ""}`}
                            title="Reset Filters"
                            onClick={resetFilters}
                        >
                            <i className="fa-solid fa-rotate-left"></i>
                        </button>

                        <button
                            className="filter-btn"
                            onClick={() => setFilterOpen(true)}
                        >
                            <i className="fa-solid fa-filter"></i>
                            Filters
                        </button>

                        <button
                            className="add-transaction-btn"
                            onClick={() => setModalOpen(true)}
                        >
                            <i className="fa-solid fa-plus"></i>
                            Add Transaction
                        </button>
                    </div>
                </header>

                {pageLoading ? (
                    <div className="transactions-loader" style={{ display: "block" }}>
                        <div className="loader-cards">
                            <div className="loader-small"></div>
                            <div className="loader-small"></div>
                            <div className="loader-small"></div>
                            <div className="loader-small"></div>
                        </div>

                        <div className="loader-chart"></div>
                    </div>
                ) : (
                    <section className="transactions-content">
                        <div className="transactions-stats">
                            <div className="transaction-stat-card">
                                <div className="stat-icon income-stat">
                                    <i className="fa-solid fa-arrow-up"></i>
                                </div>

                                <div>
                                    <p>Total Income</p>
                                    <h3>{formatCurrency(totalIncome)}</h3>
                                </div>
                            </div>

                            <div className="transaction-stat-card">
                                <div className="stat-icon expense-stat">
                                    <i className="fa-solid fa-arrow-down"></i>
                                </div>

                                <div>
                                    <p>Total Expense</p>
                                    <h3>{formatCurrency(totalExpense)}</h3>
                                </div>
                            </div>

                            <div className="transaction-stat-card">
                                <div className="stat-icon balance-stat">
                                    <i className="fa-solid fa-wallet"></i>
                                </div>

                                <div>
                                    <p>Net Balance</p>
                                    <h3>{formatCurrency(netBalance)}</h3>
                                </div>
                            </div>

                            <div className="transaction-stat-card">
                                <div className="stat-icon count-stat">
                                    <i className="fa-solid fa-list-check"></i>
                                </div>

                                <div>
                                    <p>Total Records</p>
                                    <h3>{filteredTransactions.length}</h3>
                                </div>
                            </div>
                        </div>

                        <div className="transactions-panel">
                            <div className="table-header">
                                <div>
                                    <h2>Transaction Records</h2>
                                    <p>
                                        All your income and expense entries in one place.
                                    </p>
                                </div>
                            </div>

                            <div className="table-wrapper">
                                <table className="transactions-table">
                                    <thead>
                                        <tr>
                                            <th>Transaction</th>
                                            <th>Category</th>
                                            <th>Type</th>
                                            <th>Date</th>
                                            <th>Amount</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {paginatedTransactions.length === 0 ? (
                                            <tr>
                                                <td colSpan="6">
                                                    <div className="premium-empty-state">
                                                        <div className="empty-icon">
                                                            <i className="fa-solid fa-chart-simple"></i>
                                                        </div>

                                                        <h3>No Transactions Found</h3>

                                                        <p>
                                                            Try changing your filters or add a new transaction
                                                            to start tracking your finances.
                                                        </p>

                                                        <button
                                                            className="empty-add-btn"
                                                            onClick={() => setModalOpen(true)}
                                                        >
                                                            <i className="fa-solid fa-plus"></i>
                                                            Add Transaction
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedTransactions.map((transaction) => {
                                                const isIncome = transaction.type === "income";

                                                return (
                                                    <tr key={transaction._id}>
                                                        <td>
                                                            <strong>{transaction.title}</strong>
                                                        </td>

                                                        <td>{transaction.category}</td>

                                                        <td>
                                                            <span className={`type-badge ${transaction.type}`}>
                                                                {transaction.type}
                                                            </span>
                                                        </td>

                                                        <td>{formatDate(transaction.date)}</td>

                                                        <td className={isIncome ? "income-text" : "expense-text"}>
                                                            {isIncome ? "+" : "-"} {formatCurrency(transaction.amount)}
                                                        </td>

                                                        <td>
                                                            <div className="table-actions">
                                                                <button
                                                                    className="action-btn edit-btn"
                                                                    onClick={() => openEdit(transaction)}
                                                                >
                                                                    <i className="fa-solid fa-pen"></i>
                                                                </button>

                                                                <button
                                                                    className="action-btn delete-btn"
                                                                    onClick={() => handleDelete(transaction._id)}
                                                                >
                                                                    <i className="fa-solid fa-trash"></i>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>

                                <div className="pagination-wrapper">
                                    <p className="pagination-info">
                                        {filteredTransactions.length === 0
                                            ? "Showing 0 of 0 transactions"
                                            : `Showing ${(currentPage - 1) * rowsPerPage + 1
                                            }-${Math.min(
                                                currentPage * rowsPerPage,
                                                filteredTransactions.length
                                            )} of ${filteredTransactions.length} transactions`}
                                    </p>

                                    <div className="pagination">
<button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(1)}
>
    <span className="page-arrow">«</span>
</button>

<button
    disabled={currentPage === 1}
    onClick={() => setCurrentPage(currentPage - 1)}
>
    <span className="page-arrow">‹</span>
</button>

                                        {[...Array(totalPages || 1)].map((_, index) => (
                                            <button
                                                key={index}
                                                className={currentPage === index + 1 ? "active" : ""}
                                                onClick={() => setCurrentPage(index + 1)}
                                            >
                                                {index + 1}
                                            </button>
                                        ))}

                                        <button
                                            disabled={currentPage === totalPages || totalPages === 0}
                                            onClick={() => setCurrentPage(currentPage + 1)}
                                        >
                                        
                                            <span className="page-arrow">›</span>
                                        </button>

                                        <button
                                            disabled={currentPage === totalPages || totalPages === 0}
                                            onClick={() => setCurrentPage(totalPages)}
                                        >
                                            <span className="page-arrow">»</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            <div
                className={`filter-overlay ${filterOpen ? "active" : ""}`}
                onClick={() => setFilterOpen(false)}
            ></div>

            <aside className={`filter-drawer ${filterOpen ? "active" : ""}`}>
                <div className="filter-drawer-header">
                    <div>
                        <h3>Filter Transactions</h3>
                        <p>Search, filter and sort your records.</p>
                    </div>

                    <button
                        className="close-filter"
                        onClick={() => setFilterOpen(false)}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="filter-form">
                    <div className="filter-group">
                        <label>Search Transaction</label>

                        <div className="drawer-search">
                            <i className="fa-solid fa-magnifying-glass"></i>

                            <input
                                type="text"
                                placeholder="Search by title or category"
                                value={search}
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Filter By Type</label>

                        <select
                            value={typeFilter}
                            onChange={(e) => {
                                setTypeFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Filter Category</label>

                        <select
                            value={categoryFilter}
                            onChange={(e) => {
                                setCategoryFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="">All Categories</option>
                            <option value="Salary">Salary</option>
                            <option value="Food">Food</option>
                            <option value="Transport">Transport</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Bills">Bills</option>
                            <option value="Savings">Savings</option>
                            <option value="Others">Others</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <label>Sort Transactions</label>

                        <select
                            value={sortType}
                            onChange={(e) => {
                                setSortType(e.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="latest">Latest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="high">Highest Amount</option>
                            <option value="low">Lowest Amount</option>
                        </select>
                    </div>
                </div>

                <div className="filter-actions">
                    <button
                        className="apply-filter-btn"
                        onClick={() => setFilterOpen(false)}
                    >
                        <i className="fa-solid fa-check"></i>
                        Apply Filters
                    </button>

                    <button
                        className="drawer-reset-btn"
                        onClick={resetFilters}
                    >
                        <i className="fa-solid fa-rotate-left"></i>
                        Reset
                    </button>
                </div>
            </aside>

            <div
                className={`modal-overlay ${modalOpen ? "active" : ""}`}
                onClick={resetModal}
            >
                <div
                    className="transaction-modal"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <div>
                            <h3>
                                {editingId
                                    ? "Edit Transaction"
                                    : "Add Transaction"}
                            </h3>
                            <p>
                                {editingId
                                    ? "Update your transaction"
                                    : "Record your income or expense"}
                            </p>
                        </div>

                        <button
                            className="close-modal"
                            onClick={resetModal}
                        >
                            <i className="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Transaction Title</label>

                            <input
                                type="text"
                                name="title"
                                placeholder="e.g. Salary, Food, Rent"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Amount</label>

                            <input
                                type="number"
                                name="amount"
                                placeholder="Enter amount"
                                value={formData.amount}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Type</label>

                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Type</option>
                                    <option value="income">Income</option>
                                    <option value="expense">Expense</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Category</label>

                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    <option value="Salary">Salary</option>
                                    <option value="Food">Food</option>
                                    <option value="Transport">Transport</option>
                                    <option value="Shopping">Shopping</option>
                                    <option value="Bills">Bills</option>
                                    <option value="Savings">Savings</option>
                                    <option value="Others">Others</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Date</label>

                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                max={new Date().toISOString().split("T")[0]}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <i className="fa-solid fa-spinner fa-spin"></i>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-plus"></i>
                                    {editingId
                                        ? "Update Transaction"
                                        : "Save Transaction"}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Transactions;