import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import Swal from "sweetalert2";

import { logout } from "../../utils/auth";
import useAutoLogout from "../../hooks/useAutoLogout";
import { useSettings } from "../../context/SettingsContext";
import { addNotification } from "../../utils/notificationService";

import "../../assets/css/settings/settings.css";

function Settings() {
    useAutoLogout();

    const { settings, updateSettings, updateProfile } = useSettings();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [savingSection, setSavingSection] = useState("");

    const [profileForm, setProfileForm] = useState({
        name: settings.profile.name || "",
        email: settings.profile.email || "",
        phone: settings.profile.phone || "",
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [showPasswords, setShowPasswords] = useState({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false,
    });

    const [selectedTheme, setSelectedTheme] = useState(settings.theme);

    const [notificationForm, setNotificationForm] = useState({
        notifications: settings.notifications,
        budgetAlerts: settings.budgetAlerts,
        goalReminders: settings.goalReminders,
    });

    const [preferencesForm, setPreferencesForm] = useState({
        currency: settings.currency,
        language: "English",
        dateFormat: settings.dateFormat,
        timeFormat: settings.timeFormat,
    });

    const [twoFactorEnabled, setTwoFactorEnabled] = useState(
        settings.twoFactorEnabled
    );

    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        setProfileForm({
            name: settings.profile.name || "",
            email: settings.profile.email || "",
            phone: settings.profile.phone || "",
        });

        setSelectedTheme(settings.theme);

        setNotificationForm({
            notifications: settings.notifications,
            budgetAlerts: settings.budgetAlerts,
            goalReminders: settings.goalReminders,
        });

        setPreferencesForm({
            currency: settings.currency,
            language: "English",
            dateFormat: settings.dateFormat,
            timeFormat: settings.timeFormat,
        });

        setTwoFactorEnabled(settings.twoFactorEnabled);
    }, [settings]);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const closeSidebar = (event) => {
            if (window.innerWidth > 1050 || !sidebarOpen) return;

            const sidebar = document.querySelector(".settings-page .sidebar");
            const menuButton = document.querySelector(".settings-page .menu-toggle");

            if (
                sidebar &&
                !sidebar.contains(event.target) &&
                menuButton &&
                !menuButton.contains(event.target)
            ) {
                setSidebarOpen(false);
            }
        };

        document.addEventListener("mousedown", closeSidebar);
        return () => document.removeEventListener("mousedown", closeSidebar);
    }, [sidebarOpen]);

    const userName = settings.profile.name || "FinWise User";
    const userInitial = userName.trim().charAt(0).toUpperCase() || "U";

    const deviceInfo = useMemo(() => {
        const userAgent = navigator.userAgent;
        let operatingSystem = "Unknown OS";
        let deviceType = "Desktop";

        if (/Windows NT 10.0/.test(userAgent)) operatingSystem = "Windows 10 / 11";
        else if (/Windows/.test(userAgent)) operatingSystem = "Windows";
        else if (/Android/.test(userAgent)) operatingSystem = "Android";
        else if (/iPhone|iPad/.test(userAgent)) operatingSystem = "iOS";
        else if (/Mac OS X/.test(userAgent)) operatingSystem = "macOS";
        else if (/Linux/.test(userAgent)) operatingSystem = "Linux";

        if (/Mobi|Android|iPhone/.test(userAgent)) deviceType = "Mobile";
        else if (/iPad|Tablet/.test(userAgent)) deviceType = "Tablet";

        return {
            full: `${operatingSystem} (${deviceType})`,
            short: deviceType,
        };
    }, []);

    const browserName = useMemo(() => {
        const userAgent = navigator.userAgent;
        if (userAgent.includes("Edg/")) return "Microsoft Edge";
        if (userAgent.includes("Chrome/") && !userAgent.includes("Edg/")) return "Google Chrome";
        if (userAgent.includes("Firefox/")) return "Mozilla Firefox";
        if (userAgent.includes("Safari/") && !userAgent.includes("Chrome/")) return "Apple Safari";
        return "Web Browser";
    }, []);

    const formattedCurrentTime = currentTime.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: settings.timeFormat !== "24",
    });

    const handleProfileChange = (event) => {
        const { name, value } = event.target;
        setProfileForm((previous) => ({ ...previous, [name]: value }));
    };

    const handleSaveProfile = async () => {
        const name = profileForm.name.trim();
        const phone = profileForm.phone.trim();

        if (!name) return toast.error("Please enter your full name");
        if (phone && !/^\+?[0-9]{10,15}$/.test(phone)) {
            return toast.error("Please enter a valid phone number");
        }

        try {
            setSavingSection("profile");
            updateProfile({ name, email: profileForm.email, phone });
            addNotification({
                title: "Profile Updated",
                message: "Your profile information was updated.",
                icon: "fa-user-check",
            });
            toast.success("Profile updated successfully");
        } finally {
            setSavingSection("");
        }
    };

    const handlePasswordChange = (event) => {
        const { name, value } = event.target;
        setPasswordForm((previous) => ({ ...previous, [name]: value }));
    };

    const togglePassword = (field) => {
        setShowPasswords((previous) => ({ ...previous, [field]: !previous[field] }));
    };

    const handleUpdatePassword = () => {
        const { currentPassword, newPassword, confirmPassword } = passwordForm;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return toast.error("Please complete all password fields");
        }
        if (newPassword.length < 8) {
            return toast.error("New password must contain at least 8 characters");
        }
        if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            return toast.error("Use at least one uppercase letter and one number");
        }
        if (newPassword !== confirmPassword) {
            return toast.error("New password and confirmation do not match");
        }

        toast("Password API integration is the next backend step", { icon: "🔐" });
    };

    const handleTwoFactorChange = async (event) => {
        const newValue = event.target.checked;
        const result = await Swal.fire({
            title: newValue
                ? "Enable Two-Factor Authentication?"
                : "Disable Two-Factor Authentication?",
            text: newValue
                ? "An additional verification step will be required after OTP integration."
                : "Your account will return to standard authentication.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: newValue ? "Enable" : "Disable",
            cancelButtonText: "Cancel",
            confirmButtonColor: newValue ? "#22C55E" : "#EF4444",
            cancelButtonColor: "#2563EB",
        });

        if (!result.isConfirmed) return;
        setTwoFactorEnabled(newValue);
        updateSettings({ twoFactorEnabled: newValue });
        toast.success(newValue ? "2FA enabled" : "2FA disabled");
    };

    const handleNotificationChange = (event) => {
        const { name, checked } = event.target;
        setNotificationForm((previous) => ({ ...previous, [name]: checked }));
    };

const handleSaveNotifications = async () => {
    try {
        setSavingSection("notifications");
        await updateSettings(notificationForm);
        toast.success(
            "Notification settings updated"
        );
    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            "Unable to update notification settings"
        );
    } finally {
        setSavingSection("");
    }
};

    const handleSaveTheme = () => {
        try {
            setSavingSection("theme");
            updateSettings({ theme: selectedTheme });
            toast.success("Theme applied across FinWise");
        } finally {
            setSavingSection("");
        }
    };

    const handlePreferenceChange = (event) => {
        const { name, value } = event.target;
        setPreferencesForm((previous) => ({ ...previous, [name]: value }));
    };

const handleSavePreferences = async () => {
    try {
        setSavingSection("preferences");
        await updateSettings({
            dateFormat:
                preferencesForm.dateFormat,
            timeFormat:
                preferencesForm.timeFormat,
        });
        toast.success(
            "Application preferences updated"
        );
    } catch (error) {
        toast.error(
            error.response?.data?.message ||
            "Unable to update preferences"
        );
    } finally {
        setSavingSection("");
    }
};

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: "Logout from FinWise?",
            text: "Your account information is securely synchronized.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Logout",
            cancelButtonText: "Stay Logged In",
            confirmButtonColor: "#EF4444",
            cancelButtonColor: "#2563EB",
            reverseButtons: true,
        });

        if (result.isConfirmed) logout();
    };

    const notificationItems = [
        {
            name: "notifications",
            title: "App Notifications",
            text: "Receive important account and financial updates.",
            icon: "fa-bell",
            iconClass: "app",
        },
        {
            name: "budgetAlerts",
            title: "Budget Alerts",
            text: "Receive an alert when your budget reaches the limit.",
            icon: "fa-wallet",
            iconClass: "budget",
        },
        {
            name: "goalReminders",
            title: "Goal Reminders",
            text: "Get reminders about active and approaching goals.",
            icon: "fa-bullseye",
            iconClass: "goals",
        },
    ];

    return (
        <div className="settings-page">
            <div className="dashboard-wrapper">
                <aside className={`sidebar ${sidebarOpen ? "active" : ""}`}>
                    <div className="sidebar-logo">
                        <i className="fa-solid fa-chart-line"></i>
                        <span>FinWise</span>
                    </div>

                    <nav className="sidebar-menu">
                        <Link to="/dashboard"><i className="fa-solid fa-table-columns"></i>Dashboard</Link>
                        <Link to="/transactions"><i className="fa-solid fa-arrow-right-arrow-left"></i>Transactions</Link>
                        <Link to="/reports"><i className="fa-solid fa-chart-pie"></i>Analytics</Link>
                        <Link to="/insights"><i className="fa-solid fa-lightbulb"></i>Insights</Link>
                        <Link to="/budget"><i className="fa-solid fa-wallet"></i>Budget</Link>
                        <Link to="/goals"><i className="fa-solid fa-bullseye"></i>Goals</Link>
                        <Link to="/settings" className="active"><i className="fa-solid fa-gear"></i>Settings</Link>
                    </nav>

                    <br /><br />

                    <div className="sidebar-card">
                        <div className="sidebar-card-icon"><i className="fa-solid fa-shield-halved"></i></div>
                        <h4>Smart Finance</h4>
                        <p>Securely track your money and build better financial habits.</p>
                        <button className="sidebar-card-btn">View Insights</button>
                    </div>

                    <div className="logout-card">
                        <div className="logout-header">
                            <div className="logout-icon"><i className="fa-solid fa-right-from-bracket"></i></div>
                            <h4>Finished Working ?</h4>
                        </div>
                        <p>Save your changes and sign out safely.</p>
                        <button className="logout-btn" onClick={handleLogout}>Logout</button>
                    </div>
                </aside>

                <main className="main-content">
                    <header className="fw-settings-header">
                        <div className="fw-settings-header-left">
                            <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                                <i className="fa-solid fa-bars"></i>
                            </button>
                            <div>
                                <h1>Account Settings</h1>
                                <p>Manage your profile, security, preferences and FinWise experience.</p>
                            </div>
                        </div>
                        <div className="fw-secure-account-pill">
                            <i className="fa-solid fa-shield-halved"></i>
                            <span>Secure Account</span>
                        </div>
                    </header>

                    <section className="fw-profile-hero fw-glass-card">
                        <div className="fw-profile-identity">
                            <div className="fw-profile-avatar">{userInitial}</div>
                            <div className="fw-profile-main-info">
                                <div className="fw-profile-name-row">
                                    <h2>{userName}</h2>
                                    <span className="fw-verified-badge"><i className="fa-solid fa-circle-check"></i></span>
                                </div>
                                <p>{settings.profile.email || "No email"}</p>
                                <div className="fw-profile-badges">
                                    <span className="fw-profile-chip"><i className="fa-solid fa-calendar-days"></i>Member since <strong>2026</strong></span>
                                    <span className="fw-profile-chip fw-two-factor-chip"><i className="fa-solid fa-user-shield"></i>2FA <strong>{twoFactorEnabled ? "Enabled" : "Disabled"}</strong></span>
                                </div>
                            </div>
                        </div>

                        <div className="fw-profile-summary">
                            <div className="fw-summary-tile">
                                <div className="fw-summary-icon security"><i className="fa-solid fa-shield"></i></div>
                                <div><span>Security Level</span><strong>{twoFactorEnabled ? "Excellent" : "Good"}</strong></div>
                            </div>
                            <div className="fw-summary-tile">
                                <div className="fw-summary-icon session"><i className="fa-solid fa-laptop"></i></div>
                                <div><span>Active Device</span><strong>{deviceInfo.short}</strong></div>
                            </div>
                        </div>
                    </section>

                    <section className="fw-settings-two-column">
                        <article className="fw-settings-panel fw-glass-card">
                            <div className="fw-panel-heading">
                                <div className="fw-panel-icon profile"><i className="fa-solid fa-user-pen"></i></div>
                                <div><span>Profile</span><h2>Profile Information</h2><p>Update your personal FinWise account details.</p></div>
                            </div>

                            <div className="fw-form-field">
                                <label>Full Name</label>
                                <div className="fw-input-wrapper"><i className="fa-solid fa-user"></i><input type="text" name="name" placeholder="Enter your full name" value={profileForm.name} onChange={handleProfileChange} autoComplete="name" /></div>
                            </div>

                            <div className="fw-form-field">
                                <label>Email Address</label>
                                <div className="fw-input-wrapper readonly"><i className="fa-solid fa-envelope"></i><input type="email" name="email" value={profileForm.email} readOnly /></div>
                            </div>

                            <div className="fw-form-field">
                                <label>Phone Number</label>
                                <div className="fw-input-wrapper"><i className="fa-solid fa-phone"></i><input type="tel" name="phone" placeholder="Enter phone number" maxLength="15" value={profileForm.phone} onChange={handleProfileChange} /></div>
                            </div>

                            <button type="button" className="fw-primary-button" onClick={handleSaveProfile} disabled={savingSection === "profile"}>
                                {savingSection === "profile" ? <><i className="fa-solid fa-spinner fa-spin"></i>Saving Profile...</> : <><i className="fa-solid fa-user-check"></i>Save Profile Changes</>}
                            </button>
                        </article>

                        <article className="fw-settings-panel fw-glass-card">
                            <div className="fw-panel-heading">
                                <div className="fw-panel-icon password"><i className="fa-solid fa-lock"></i></div>
                                <div><span>Security</span><h2>Change Password</h2><p>Use a strong and unique password for your account.</p></div>
                            </div>

                            {[
                                { key: "currentPassword", label: "Current Password", placeholder: "Enter current password", autoComplete: "current-password", icon: "fa-key" },
                                { key: "newPassword", label: "New Password", placeholder: "Enter new password", autoComplete: "new-password", icon: "fa-shield-halved" },
                                { key: "confirmPassword", label: "Confirm Password", placeholder: "Confirm new password", autoComplete: "new-password", icon: "fa-check-double" },
                            ].map((field) => (
                                <div className="fw-form-field" key={field.key}>
                                    <label>{field.label}</label>
                                    <div className="fw-input-wrapper">
                                        <i className={`fa-solid ${field.icon}`}></i>
                                        <input type={showPasswords[field.key] ? "text" : "password"} name={field.key} placeholder={field.placeholder} autoComplete={field.autoComplete} value={passwordForm[field.key]} onChange={handlePasswordChange} />
                                        <button type="button" className="fw-password-toggle" onClick={() => togglePassword(field.key)} aria-label={showPasswords[field.key] ? "Hide password" : "Show password"}>
                                            <i className={`fa-solid ${showPasswords[field.key] ? "fa-eye-slash" : "fa-eye"}`}></i>
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button type="button" className="fw-primary-button" onClick={handleUpdatePassword}><i className="fa-solid fa-shield-keyhole"></i>Update Password</button>
                        </article>
                    </section>

                    <section className="fw-settings-two-column">
                        <article className="fw-settings-panel fw-security-session-card fw-glass-card">
                            <div className="fw-panel-heading">
                                <div className="fw-panel-icon two-factor"><i className="fa-solid fa-user-shield"></i></div>
                                <div><span>Account Protection</span><h2>2FA & Session Activity</h2><p>Control verification and review your current login session.</p></div>
                            </div>

                            <div className="fw-two-factor-box">
                                <div className="fw-two-factor-info">
                                    <div className="fw-two-factor-icon"><i className="fa-solid fa-fingerprint"></i></div>
                                    <div><h3>Two-Factor Authentication</h3><p>Add an extra security verification step to your login.</p></div>
                                </div>
                                <label className="fw-switch"><input type="checkbox" checked={twoFactorEnabled} onChange={handleTwoFactorChange} /><span className="fw-switch-slider"></span></label>
                            </div>

                            <div className="fw-session-divider"></div>
                            <div className="fw-session-heading">
                                <div><span>Current Session</span><h3>Session Activity</h3></div>
                                <span className="fw-active-session-badge"><span></span>Active Now</span>
                            </div>

                            <div className="fw-session-details">
                                <div className="fw-session-detail-row"><div className="fw-session-detail-icon login"><i className="fa-solid fa-right-to-bracket"></i></div><div><span>Last Login</span><strong>{formattedCurrentTime}</strong></div></div>
                                <div className="fw-session-detail-row"><div className="fw-session-detail-icon device"><i className="fa-solid fa-desktop"></i></div><div><span>Device</span><strong>{deviceInfo.full}</strong></div></div>
                                <div className="fw-session-detail-row"><div className="fw-session-detail-icon browser"><i className="fa-brands fa-chrome"></i></div><div><span>Browser</span><strong>{browserName}</strong></div></div>
                                <div className="fw-session-detail-row"><div className="fw-session-detail-icon ip"><i className="fa-solid fa-network-wired"></i></div><div><span>IP Address</span><strong>Protected by browser</strong></div></div>
                            </div>
                        </article>

                        <article className="fw-settings-panel fw-notification-card fw-glass-card">
                            <div className="fw-panel-heading">
                                <div className="fw-panel-icon notification"><i className="fa-solid fa-bell"></i></div>
                                <div><span>Notifications</span><h2>Notification Center</h2><p>Choose which FinWise updates should reach your dashboard.</p></div>
                            </div>

                            <div className="fw-toggle-list">
                                {notificationItems.map((item) => (
                                    <div className="fw-toggle-setting" key={item.name}>
                                        <div className={`fw-toggle-setting-icon ${item.iconClass}`}><i className={`fa-solid ${item.icon}`}></i></div>
                                        <div className="fw-toggle-setting-text"><h3>{item.title}</h3><p>{item.text}</p></div>
                                        <label className="fw-switch"><input type="checkbox" name={item.name} checked={notificationForm[item.name]} onChange={handleNotificationChange} /><span className="fw-switch-slider"></span></label>
                                    </div>
                                ))}
                            </div>

                            <button type="button" className="fw-primary-button fw-panel-bottom-button" onClick={handleSaveNotifications} disabled={savingSection === "notifications"}>
                                {savingSection === "notifications" ? <><i className="fa-solid fa-spinner fa-spin"></i>Saving Notifications...</> : <><i className="fa-solid fa-bell"></i>Save Notification Settings</>}
                            </button>
                        </article>
                    </section>
                    <section className="fw-settings-two-column">
                        <article className="fw-settings-panel fw-appearance-card fw-glass-card">
                            <div className="fw-panel-heading">
                                <div className="fw-panel-icon appearance"><i className="fa-solid fa-palette"></i></div>
                                <div><span>Appearance</span><h2>Theme Studio</h2><p>Choose how FinWise should look across every application page.</p></div>
                            </div>

                            <div className="fw-theme-options">
                                {[
                                    { value: "dark", label: "Dark Mode", icon: "fa-moon", isComingSoon: false },
                                    { value: "light", label: "Light Mode", icon: "fa-sun", isComingSoon: true },
                                ].map((theme) => (
                                    <button
                                        type="button"
                                        key={theme.value}
                                        className={`fw-theme-option ${selectedTheme === theme.value ? "active" : ""} ${theme.isComingSoon ? "fw-disabled-option" : ""}`}
                                        onClick={() => !theme.isComingSoon && setSelectedTheme(theme.value)}
                                        disabled={theme.isComingSoon}
                                        style={theme.isComingSoon ? { opacity: 0.5, cursor: "not-allowed", position: "relative" } : {}}
                                    >
                                        {theme.isComingSoon && (
                                            <span style={{
                                                position: "absolute",
                                                top: "10px",
                                                right: "10px",
                                                background: "#22C55E",
                                                color: "#000000",
                                                fontSize: "10px",
                                                fontWeight: "bold",
                                                padding: "2px 6px",
                                                borderRadius: "4px",
                                                textTransform: "uppercase",
                                                zIndex: 10
                                            }}>
                                                Coming Soon
                                            </span>
                                        )}
                                        <div className={`fw-theme-preview ${theme.value}`}><span></span><span></span><span></span></div>
                                        <div className="fw-theme-option-footer">
                                            <div>
                                                <i className={`fa-solid ${theme.icon}`}></i>
                                                <strong>{theme.label}</strong>
                                            </div>
                                            {!theme.isComingSoon && <i className="fa-solid fa-circle-check fw-theme-check"></i>}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <button type="button" className="fw-primary-button" onClick={handleSaveTheme} disabled={savingSection === "theme"}>
                                {savingSection === "theme" ? <><i className="fa-solid fa-spinner fa-spin"></i>Applying Theme...</> : <><i className="fa-solid fa-palette"></i>Apply Theme Everywhere</>}
                            </button>
                        </article>

                        <article className="fw-settings-panel fw-preferences-card fw-glass-card">
                            <div className="fw-panel-heading">
                                <div className="fw-panel-icon preferences"><i className="fa-solid fa-sliders"></i></div>
                                <div><span>Preferences</span><h2>App Preferences</h2><p>Personalize date, time, language and currency formats.</p></div>
                            </div>

                            <div className="fw-preference-grid">
                                <div className="fw-form-field"><label>Currency</label><div className="fw-input-wrapper"><i className="fa-solid fa-coins"></i><select name="currency" value="INR" disabled><option value="INR">INR - Indian Rupee</option><option value="USD">USD - US Dollar</option></select></div></div>
                                <div className="fw-form-field"><label>Language</label><div className="fw-input-wrapper"><i className="fa-solid fa-language"></i><select name="language" value="English" disabled><option value="English">English</option></select></div></div>
                                <div className="fw-form-field"><label>Date Format</label><div className="fw-input-wrapper"><i className="fa-solid fa-calendar"></i><select name="dateFormat" value={preferencesForm.dateFormat} onChange={handlePreferenceChange}><option value="DD/MM/YYYY">DD/MM/YYYY</option><option value="MM/DD/YYYY">MM/DD/YYYY</option><option value="YYYY-MM-DD">YYYY-MM-DD</option></select></div></div>
                                <div className="fw-form-field"><label>Time Format</label><div className="fw-input-wrapper"><i className="fa-solid fa-clock"></i><select name="timeFormat" value={preferencesForm.timeFormat} onChange={handlePreferenceChange}><option value="12">12-hour clock</option><option value="24">24-hour clock</option></select></div></div>
                            </div>

                            <button type="button" className="fw-primary-button" onClick={handleSavePreferences} disabled={savingSection === "preferences"}>
                                {savingSection === "preferences" ? <><i className="fa-solid fa-spinner fa-spin"></i>Saving Preferences...</> : <><i className="fa-solid fa-floppy-disk"></i>Save App Preferences</>}
                            </button>
                        </article>
                    </section>

                    <section className="fw-danger-zone fw-glass-card">
                        <div className="fw-danger-zone-left">
                            <div className="fw-danger-icon"><i className="fa-solid fa-right-from-bracket"></i></div>
                            <div><span>Danger Zone</span><h2>Logout from this device</h2><p>Your FinWise information is already synced securely. You can sign in again at any time.</p></div>
                        </div>
                        <button type="button" className="fw-logout-button" onClick={handleLogout}><i className="fa-solid fa-right-from-bracket"></i>Logout Securely</button>
                    </section>
                </main>
            </div>
        </div>
    );
}

export default Settings;