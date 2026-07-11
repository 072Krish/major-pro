const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },

        password: {
            type: String,
            required: true,
        },

        profileImage: {
            type: String,
            default: "",
        },

        phone: {
            type: String,
            default: "",
            trim: true,
        },

        settings: {
            notifications: {
                appNotifications: {
                    type: Boolean,
                    default: true,
                },

                budgetAlerts: {
                    type: Boolean,
                    default: true,
                },

                goalReminders: {
                    type: Boolean,
                    default: true,
                },
            },

            dateFormat: {
                type: String,
                enum: [
                    "DD/MM/YYYY",
                    "MM/DD/YYYY",
                    "YYYY-MM-DD",
                ],
                default: "DD/MM/YYYY",
            },

            timeFormat: {
                type: String,
                enum: [
                    "12-hour",
                    "24-hour",
                ],
                default: "12-hour",
            },
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("User", userSchema);