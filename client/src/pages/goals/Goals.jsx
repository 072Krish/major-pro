import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

import { logout } from "../../utils/auth";
import useAutoLogout from "../../hooks/useAutoLogout";
import { addNotification } from "../../utils/notificationService";

import "../../assets/css/goals/goals.css";

function Goals() {
    useAutoLogout();

    const storageKey = "finwise_goals_data";

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [goals, setGoals] = useState([]);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        category: "Savings",
        targetAmount: "",
        savedAmount: "",
        deadline: "",
    });

    useEffect(() => {
        const savedGoals =
            JSON.parse(localStorage.getItem(storageKey)) || [];

        const sortedGoals = [...savedGoals].sort((a, b) => {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });

        setGoals(sortedGoals);
    }, []);

    const saveGoalsToStorage = (updatedGoals) => {
        localStorage.setItem(
            storageKey,
            JSON.stringify(updatedGoals)
        );
    };

    const formatCurrency = (amount) => {
        return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
    };

    const formatDate = (date) => {
        if (!date) return "No deadline";

        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const getRawProgress = (goal) => {
        const target = Number(goal.targetAmount || 0);
        const saved = Number(goal.savedAmount || 0);

        if (target <= 0) return 0;

        return (saved / target) * 100;
    };

    const getProgress = (goal) => {
        return Math.min(getRawProgress(goal), 100);
    };

    const getGoalStatus = (progress) => {
        if (progress >= 100) {
            return {
                text: "Completed",
                className: "goals-status-done",
            };
        }

        if (progress >= 80) {
            return {
                text: "Almost There",
                className: "goals-status-almost",
            };
        }

        if (progress >= 50) {
            return {
                text: "In Progress",
                className: "goals-status-progress",
            };
        }

        return {
            text: "Started",
            className: "goals-status-started",
        };
    };

    const stats = useMemo(() => {
        const completed = goals.filter(
            (goal) => getRawProgress(goal) >= 100
        );

        const active = goals.filter(
            (goal) => getRawProgress(goal) < 100
        );

        const saved = goals.reduce((sum, goal) => {
            return sum + Number(goal.savedAmount || 0);
        }, 0);

        return {
            total: goals.length,
            active: active.length,
            completed: completed.length,
            saved,
        };
    }, [goals]);

    const goalAdvice = useMemo(() => {
        if (goals.length === 0) {
            return {
                text: "Start with a realistic savings goal to build financial discipline.",
                status: "Begin",
                color: "#3B82F6",
            };
        }

        const completed = goals.find(
            (goal) => getRawProgress(goal) >= 100
        );

        if (completed) {
            return {
                text: `Great job! You completed your ${completed.title} goal.`,
                status: "Success",
                color: "#22C55E",
            };
        }

        const almost = goals.find(
            (goal) => getRawProgress(goal) >= 80
        );

        if (almost) {
            return {
                text: `${almost.title} is close to completion. A small push can help you finish it.`,
                status: "High",
                color: "#F59E0B",
            };
        }

        return {
            text: "Your goals are active. Add saved amounts regularly to reach them faster.",
            status: "Active",
            color: "#3B82F6",
        };
    }, [goals]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const resetGoalForm = () => {
        setEditingId("");

        setFormData({
            title: "",
            category: "Savings",
            targetAmount: "",
            savedAmount: "",
            deadline: "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const title = formData.title.trim();
        const target = Number(formData.targetAmount);
        const saved = Number(formData.savedAmount || 0);

        if (!title || !target || target <= 0) {
            Swal.fire({
                icon: "warning",
                title: "Invalid Goal",
                text: "Please enter goal title and valid target amount.",
                confirmButtonColor: "#2563EB",
            });
            return;
        }

        try {
            setSaving(true);

            const isEdit = Boolean(editingId);

            const payload = {
                title,
                category: formData.category,
                targetAmount: target,
                savedAmount: saved,
                deadline: formData.deadline,
                updatedAt: new Date().toISOString(),
            };

            let updatedGoals;

            if (isEdit) {
                updatedGoals = goals.map((goal) =>
                    goal.id === editingId
                        ? {
                            ...goal,
                            ...payload,
                        }
                        : goal
                );

                Swal.fire({
                    icon: "success",
                    title: "Goal Updated",
                    text: "Your goal has been updated successfully.",
                    timer: 1400,
                    showConfirmButton: false,
                });

                addNotification({
                    title: "Goal Updated",
                    message: `${title} goal updated.`,
                    icon: "fa-bullseye",
                });
            } else {
                const newGoal = {
                    id: crypto.randomUUID
                        ? crypto.randomUUID()
                        : String(Date.now()),
                    ...payload,
                    createdAt: new Date().toISOString(),
                };

                updatedGoals = [newGoal, ...goals];

                Swal.fire({
                    icon: "success",
                    title: "Goal Created",
                    text: "Your new goal has been created.",
                    timer: 1400,
                    showConfirmButton: false,
                });

                addNotification({
                    title: "Goal Created",
                    message: `${title} goal created.`,
                    icon: "fa-bullseye",
                });
            }

            const sortedGoals = [...updatedGoals].sort((a, b) => {
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            });

            setGoals(sortedGoals);
            saveGoalsToStorage(sortedGoals);
            resetGoalForm();
        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Something went wrong while saving goal.",
                confirmButtonColor: "#EF4444",
            });
        } finally {
            setSaving(false);
        }
    };

    const handleEditGoal = (goal) => {
        setEditingId(goal.id);

        setFormData({
            title: goal.title || "",
            category: goal.category || "Savings",
            targetAmount: goal.targetAmount || "",
            savedAmount: goal.savedAmount || "",
            deadline: goal.deadline || "",
        });

        setTimeout(() => {
            document
                .querySelector(".goals-form-panel")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                });
        }, 50);
    };

    const handleDeleteGoal = async (id) => {
        const result = await Swal.fire({
            title: "Delete Goal?",
            text: "This goal will be permanently removed.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#2563EB",
            confirmButtonText: "Delete",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        const goalToDelete = goals.find((goal) => goal.id === id);

        const updatedGoals = goals.filter((goal) => goal.id !== id);

        setGoals(updatedGoals);
        saveGoalsToStorage(updatedGoals);

        await Swal.fire({
            icon: "success",
            title: "Deleted",
            text: "Goal deleted successfully.",
            timer: 1400,
            showConfirmButton: false,
        });

        addNotification({
            title: "Goal Deleted",
            message: `${goalToDelete?.title || "Goal"} deleted.`,
            icon: "fa-trash",
        });

        if (editingId === id) {
            resetGoalForm();
        }
    };

    return (
        <div className="goals-page">
            <div className="dashboard-wrapper">

                {/* SIDEBAR */}
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

                        <Link to="/budget">
                            <i className="fa-solid fa-wallet"></i>
                            Budget
                        </Link>

                        <Link to="/goals" className="active">
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

                        <p>
                            Save your changes and sign out safely.
                        </p>

                        <button
                            className="logout-btn"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </div>
                </aside>

                {/* MAIN CONTENT */}
                <main className="main-content">

                    <header className="goals-topbar">
                        <div className="goals-top-left">
                            <button
                                className="menu-toggle"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            >
                                <i className="fa-solid fa-bars"></i>
                            </button>

                            <div>
                                <h2>Goals Tracker 🎯</h2>
                                <p>Create savings goals, track progress, and stay motivated.</p>
                            </div>
                        </div>

                        <div className="goals-mode-pill">
                            <i className="fa-solid fa-bullseye"></i>
                            <span>Goal Mode</span>
                        </div>
                    </header>

                    <section className="goals-stats-grid">
                        <div className="goals-stat-box glass-hover">
                            <div className="goals-stat-icon goals-total-icon">
                                <i className="fa-solid fa-layer-group"></i>
                            </div>
                            <div>
                                <span>Total Goals</span>
                                <h2>{stats.total}</h2>
                            </div>
                        </div>

                        <div className="goals-stat-box glass-hover">
                            <div className="goals-stat-icon goals-active-icon">
                                <i className="fa-solid fa-hourglass-half"></i>
                            </div>
                            <div>
                                <span>Active Goals</span>
                                <h2>{stats.active}</h2>
                            </div>
                        </div>

                        <div className="goals-stat-box glass-hover">
                            <div className="goals-stat-icon goals-completed-icon">
                                <i className="fa-solid fa-circle-check"></i>
                            </div>
                            <div>
                                <span>Completed</span>
                                <h2>{stats.completed}</h2>
                            </div>
                        </div>

                        <div className="goals-stat-box glass-hover">
                            <div className="goals-stat-icon goals-saved-icon">
                                <i className="fa-solid fa-piggy-bank"></i>
                            </div>
                            <div>
                                <span>Total Saved</span>
                                <h2>{formatCurrency(stats.saved)}</h2>
                            </div>
                        </div>
                    </section>

                    <section className="goals-form-panel glass-hover">
                        <div className="goals-form-info">
                            <span className="goals-mini-label">
                                Savings Goal
                            </span>

                            <h2>
                                {editingId ? "Update Goal" : "Create New Goal"}
                            </h2>

                            <p>Set your target amount, saved amount and deadline.</p>

                            <div className="goal-info-features">
                                <div className="goal-feature">
                                    <i className="fa-solid fa-bullseye"></i>
                                    <div>
                                        <h4>Track Progress</h4>
                                        <span>Monitor every saving milestone.</span>
                                    </div>
                                </div>

                                <div className="goal-feature">
                                    <i className="fa-solid fa-calendar-check"></i>
                                    <div>
                                        <h4>Stay On Schedule</h4>
                                        <span>Reach your goal before deadline.</span>
                                    </div>
                                </div>

                                <div className="goal-feature">
                                    <i className="fa-solid fa-piggy-bank"></i>
                                    <div>
                                        <h4>Build Better Habits</h4>
                                        <span>Small savings create big results.</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <form
                            className="goals-form-box"
                            onSubmit={handleSubmit}
                        >
                            <div className="goals-field">
                                <label>Goal Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    placeholder="Example: Buy Laptop"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="goals-field">
                                <label>Category</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="Savings">Savings</option>
                                    <option value="Education">Education</option>
                                    <option value="Travel">Travel</option>
                                    <option value="Gadget">Gadget</option>
                                    <option value="Emergency">Emergency</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="goals-form-row">
                                <div className="goals-field">
                                    <label>Target Amount</label>
                                    <input
                                        type="number"
                                        name="targetAmount"
                                        placeholder="₹ Target"
                                        value={formData.targetAmount}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="goals-field">
                                    <label>Saved Amount</label>
                                    <input
                                        type="number"
                                        name="savedAmount"
                                        placeholder="₹ Saved"
                                        value={formData.savedAmount}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="goals-field">
                                <label>Deadline</label>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                />
                            </div>

                            <button
                                type="submit"
                                className={`goals-save-btn ${
                                    editingId ? "editing" : ""
                                }`}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <i className="fa-solid fa-spinner fa-spin"></i>
                                        {editingId ? "Updating..." : "Saving..."}
                                    </>
                                ) : editingId ? (
                                    <>
                                        <i className="fa-solid fa-pen-to-square"></i>
                                        Update Goal
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-floppy-disk"></i>
                                        Save Goal
                                    </>
                                )}
                            </button>
                        </form>
                    </section>

                    <section className="goals-list-section">
                        <div className="goals-block-title">
                            <span>Active Goals</span>
                            <p>Track all your financial goals in one place.</p>
                        </div>

                        <div className="goals-card-grid">
                            {goals.length === 0 ? (
                                <div className="goals-empty-box">
                                    <i className="fa-solid fa-bullseye"></i>
                                    <h3>No Goals Yet</h3>
                                    <p>Create your first savings goal to start tracking progress.</p>
                                </div>
                            ) : (
                                goals.map((goal) => {
                                    const rawProgress = getRawProgress(goal);
                                    const progress = getProgress(goal);
                                    const status = getGoalStatus(rawProgress);

                                    const remaining = Math.max(
                                        Number(goal.targetAmount || 0) -
                                        Number(goal.savedAmount || 0),
                                        0
                                    );

                                    return (
                                        <div
                                            className="goals-item-card glass-hover"
                                            key={goal.id}
                                        >
                                            <div className="goals-item-head">
                                                <div className="goals-title-wrap">
                                                    <h3>{goal.title}</h3>
                                                    <span>
                                                        {goal.category || "Savings"} • {formatDate(goal.deadline)}
                                                    </span>
                                                </div>

                                                <div
                                                    className={`goals-status-badge ${status.className}`}
                                                >
                                                    {status.text}
                                                </div>
                                            </div>

                                            <div className="goals-value-grid">
                                                <div className="goals-value-box">
                                                    <span>Target</span>
                                                    <strong>{formatCurrency(goal.targetAmount)}</strong>
                                                </div>

                                                <div className="goals-value-box">
                                                    <span>Saved</span>
                                                    <strong>{formatCurrency(goal.savedAmount)}</strong>
                                                </div>

                                                <div className="goals-value-box">
                                                    <span>Remaining</span>
                                                    <strong>{formatCurrency(remaining)}</strong>
                                                </div>
                                            </div>

                                            <div className="goals-progress-head">
                                                <span>Progress</span>
                                                <strong>{rawProgress.toFixed(1)}%</strong>
                                            </div>

                                            <div className="goals-progress-bar">
                                                <div
                                                    className="goals-progress-fill"
                                                    style={{
                                                        width: `${progress}%`,
                                                    }}
                                                ></div>
                                            </div>

                                            <div className="goals-action-row">
                                                <button
                                                    className="goals-edit-btn"
                                                    onClick={() => handleEditGoal(goal)}
                                                >
                                                    <i className="fa-solid fa-pen"></i>
                                                    Edit
                                                </button>

                                                <button
                                                    className="goals-delete-btn"
                                                    onClick={() => handleDeleteGoal(goal.id)}
                                                >
                                                    <i className="fa-solid fa-trash"></i>
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </section>

                    <section className="goals-advice-section">
                        <div className="goals-advice-card glass-hover">
                            <div className="goals-advice-left">
                                <div className="goals-advice-icon">
                                    <i className="fa-solid fa-lightbulb"></i>
                                </div>

                                <div>
                                    <span className="goals-mini-label">
                                        Goal Recommendation
                                    </span>

                                    <p>
                                        {goalAdvice.text}
                                    </p>
                                </div>
                            </div>

                            <div className="goals-advice-status">
                                <span>Status</span>
                                <h3 style={{ color: goalAdvice.color }}>
                                    {goalAdvice.status}
                                </h3>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Goals;
