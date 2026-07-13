import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    getSettingsAPI,
    updateSettingsAPI,
    updateProfileAPI,
    changePasswordAPI,
} from "../services/settingsService";

const SettingsContext = createContext(null);

const DEFAULT_SETTINGS = {
    theme: "dark",

    language: "English",

    dateFormat: "DD/MM/YYYY",

    // Frontend par existing values 12 aur 24 hi rakhenge.
    timeFormat: "12",

    notifications: true,

    budgetAlerts: true,

    goalReminders: true,

    twoFactorEnabled: false,

    profile: {
        name: "",
        email: "",
        phone: "",
        avatar: "",
    },
};

const STORAGE_KEY = "finwise_app_settings";

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(() => {
        try {
            const storedSettings =
                JSON.parse(
                    localStorage.getItem(STORAGE_KEY)
                ) || {};

            const loggedInUser =
                JSON.parse(
                    localStorage.getItem("user")
                ) || {};

            return {
                ...DEFAULT_SETTINGS,
                ...storedSettings,

                profile: {
                    ...DEFAULT_SETTINGS.profile,
                    ...storedSettings.profile,

                    name:
                        storedSettings.profile?.name ||
                        loggedInUser.name ||
                        "FinWise User",

                    email:
                        storedSettings.profile?.email ||
                        loggedInUser.email ||
                        "",
                },
            };

        } catch {
            return DEFAULT_SETTINGS;
        }
    });

    const [settingsLoading, setSettingsLoading] =
        useState(false);


    // ==========================================
    // LOAD MONGODB SETTINGS
    // ==========================================

    useEffect(() => {
        const fetchMongoSettings = async () => {
            const token =
                localStorage.getItem("token");

            if (!token) return;

            try {
                setSettingsLoading(true);

                const response =
                    await getSettingsAPI();

                const mongoSettings =
                    response.settings || {};

                setSettings((previousSettings) => ({
                    ...previousSettings,

                    notifications:
                        mongoSettings.notifications
                            ?.appNotifications ??
                        previousSettings.notifications,

                    budgetAlerts:
                        mongoSettings.notifications
                            ?.budgetAlerts ??
                        previousSettings.budgetAlerts,

                    goalReminders:
                        mongoSettings.notifications
                            ?.goalReminders ??
                        previousSettings.goalReminders,

                    dateFormat:
                        mongoSettings.dateFormat ||
                        previousSettings.dateFormat,

                    timeFormat:
                        mongoSettings.timeFormat ===
                        "24-hour"
                            ? "24"
                            : "12",
                }));

            } catch (error) {
                console.error(
                    "Settings Load Error:",
                    error.response?.data?.message ||
                    error.message
                );

            } finally {
                setSettingsLoading(false);
            }
        };

        fetchMongoSettings();
    }, []);


    // ==========================================
    // LOCAL SETTINGS CACHE
    // ==========================================

    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(settings)
        );
    }, [settings]);


    // ==========================================
    // THEME
    // ==========================================

    useEffect(() => {
        document.documentElement.setAttribute(
            "data-theme",
            settings.theme
        );

        document.body.classList.remove(
            "light-mode",
            "dark-mode"
        );

        document.body.classList.add(
            settings.theme === "light"
                ? "light-mode"
                : "dark-mode"
        );

    }, [settings.theme]);


    // ==========================================
    // UPDATE SETTINGS
    // ==========================================

    const updateSettings = async (updates) => {
        const shouldUpdateMongo =
            updates.notifications !== undefined ||
            updates.budgetAlerts !== undefined ||
            updates.goalReminders !== undefined ||
            updates.dateFormat !== undefined ||
            updates.timeFormat !== undefined;

        if (shouldUpdateMongo) {
            const nextSettings = {
                ...settings,
                ...updates,
            };

            const mongoPayload = {
                notifications: {
                    appNotifications:
                        Boolean(
                            nextSettings.notifications
                        ),

                    budgetAlerts:
                        Boolean(
                            nextSettings.budgetAlerts
                        ),

                    goalReminders:
                        Boolean(
                            nextSettings.goalReminders
                        ),
                },

                dateFormat:
                    nextSettings.dateFormat,

                timeFormat:
                    nextSettings.timeFormat === "24"
                        ? "24-hour"
                        : "12-hour",
            };

            const response =
                await updateSettingsAPI(
                    mongoPayload
                );

            const savedSettings =
                response.settings || {};

            setSettings((previousSettings) => ({
                ...previousSettings,
                ...updates,

                notifications:
                    savedSettings.notifications
                        ?.appNotifications ??
                    nextSettings.notifications,

                budgetAlerts:
                    savedSettings.notifications
                        ?.budgetAlerts ??
                    nextSettings.budgetAlerts,

                goalReminders:
                    savedSettings.notifications
                        ?.goalReminders ??
                    nextSettings.goalReminders,

                dateFormat:
                    savedSettings.dateFormat ||
                    nextSettings.dateFormat,

                timeFormat:
                    savedSettings.timeFormat ===
                    "24-hour"
                        ? "24"
                        : "12",
            }));

            return response;
        }

        // Theme aur 2FA abhi local/UI-only rahenge.
        setSettings((previousSettings) => ({
            ...previousSettings,
            ...updates,
        }));

        return {
            success: true,
        };
    };


    // ==========================================
    // UPDATE PROFILE
    // ==========================================

const updateProfile = async (
    profileUpdates
) => {

    const response =
        await updateProfileAPI(profileUpdates);

    const updatedUser =
        response.user;

    setSettings((previousSettings) => ({
        ...previousSettings,

        profile: {
            ...previousSettings.profile,

            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            avatar:
                updatedUser.profileImage ||
                previousSettings.profile.avatar,
        },
    }));

    localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
    );

    return response;

};

// ==========================================
// CHANGE PASSWORD
// ==========================================

const changePassword = async (
    passwordData
) => {

    return await changePasswordAPI(
        passwordData
    );

};


    // ==========================================
    // CONTEXT VALUE
    // ==========================================

const value = useMemo(
    () => ({
        settings,
        settingsLoading,
        updateSettings,
        updateProfile,
        changePassword,
    }),
        [
            settings,
            settingsLoading,
        ]
    );

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
}


export function useSettings() {
    const context =
        useContext(SettingsContext);

    if (!context) {
        throw new Error(
            "useSettings must be used inside SettingsProvider"
        );
    }

    return context;
}