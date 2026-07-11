const User = require("../models/User");

const DEFAULT_SETTINGS = {
    notifications: {
        appNotifications: true,
        budgetAlerts: true,
        goalReminders: true,
    },

    dateFormat: "DD/MM/YYYY",
    timeFormat: "12-hour",
};


// ==========================================
// GET CURRENT USER SETTINGS
// ==========================================

const getSettings = async (req, res) => {
    try {
        const user = await User.findById(
            req.user._id
        ).select("settings");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const storedSettings =
            user.settings?.toObject?.() ||
            user.settings ||
            {};

        const settings = {
            notifications: {
                appNotifications:
                    storedSettings.notifications
                        ?.appNotifications ??
                    DEFAULT_SETTINGS.notifications
                        .appNotifications,

                budgetAlerts:
                    storedSettings.notifications
                        ?.budgetAlerts ??
                    DEFAULT_SETTINGS.notifications
                        .budgetAlerts,

                goalReminders:
                    storedSettings.notifications
                        ?.goalReminders ??
                    DEFAULT_SETTINGS.notifications
                        .goalReminders,
            },

            dateFormat:
                storedSettings.dateFormat ||
                DEFAULT_SETTINGS.dateFormat,

            timeFormat:
                storedSettings.timeFormat ||
                DEFAULT_SETTINGS.timeFormat,
        };

        return res.status(200).json({
            success: true,
            settings,
        });

    } catch (error) {
        console.error(
            "Get Settings Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to fetch settings",
        });
    }
};


// ==========================================
// UPDATE CURRENT USER SETTINGS
// ==========================================

const updateSettings = async (req, res) => {
    try {
        const {
            notifications,
            dateFormat,
            timeFormat,
        } = req.body;

        const allowedDateFormats = [
            "DD/MM/YYYY",
            "MM/DD/YYYY",
            "YYYY-MM-DD",
        ];

        const allowedTimeFormats = [
            "12-hour",
            "24-hour",
        ];

        if (
            dateFormat !== undefined &&
            !allowedDateFormats.includes(dateFormat)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format",
            });
        }

        if (
            timeFormat !== undefined &&
            !allowedTimeFormats.includes(timeFormat)
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid time format",
            });
        }

        if (
            notifications !== undefined &&
            (
                typeof notifications !== "object" ||
                notifications === null ||
                Array.isArray(notifications)
            )
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Notifications must be an object",
            });
        }

        const updateData = {};

        if (
            notifications?.appNotifications !==
            undefined
        ) {
            updateData[
                "settings.notifications.appNotifications"
            ] = Boolean(
                notifications.appNotifications
            );
        }

        if (
            notifications?.budgetAlerts !==
            undefined
        ) {
            updateData[
                "settings.notifications.budgetAlerts"
            ] = Boolean(
                notifications.budgetAlerts
            );
        }

        if (
            notifications?.goalReminders !==
            undefined
        ) {
            updateData[
                "settings.notifications.goalReminders"
            ] = Boolean(
                notifications.goalReminders
            );
        }

        if (dateFormat !== undefined) {
            updateData["settings.dateFormat"] =
                dateFormat;
        }

        if (timeFormat !== undefined) {
            updateData["settings.timeFormat"] =
                timeFormat;
        }

        if (
            Object.keys(updateData).length === 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "No valid settings provided",
            });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set: updateData,
            },
            {
                returnDocument: "after",
                runValidators: true,
            }
        ).select("settings");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Settings updated successfully",
            settings: user.settings,
        });

    } catch (error) {
        console.error(
            "Update Settings Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to update settings",
        });
    }
};


// ==========================================
// EXPORT CONTROLLERS
// ==========================================

module.exports = {
    getSettings,
    updateSettings,
};