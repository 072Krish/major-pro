// ===============================
// GET NOTIFICATIONS
// ===============================

export const getNotifications = () => {

    return JSON.parse(
        localStorage.getItem("finwise_notifications")
    ) || [];

};

// ===============================
// ADD NOTIFICATION
// ===============================

export const addNotification = (notification) => {

    const notifications = getNotifications();

    notifications.unshift({

        id: Date.now(),

        createdAt: new Date().toISOString(),

        read: false,

        ...notification,

    });

    // Maximum 100 notifications

    const latestNotifications =
        notifications.slice(0, 100);

    localStorage.setItem(

        "finwise_notifications",

        JSON.stringify(latestNotifications)

    );

};

// ===============================
// MARK ALL AS READ
// ===============================

export const markAllNotificationsRead = () => {

    const notifications = getNotifications();

    notifications.forEach(item => {

        item.read = true;

    });

    localStorage.setItem(

        "finwise_notifications",

        JSON.stringify(notifications)

    );

};

// ===============================
// REMOVE OLD NOTIFICATIONS
// ===============================

export const cleanOldNotifications = () => {

    const notifications = getNotifications();

    const fiveDays =
        5 * 24 * 60 * 60 * 1000;

    const filtered = notifications.filter(item => {

        return (

            Date.now()

            -

            new Date(item.createdAt).getTime()

            <

            fiveDays

        );

    });

    localStorage.setItem(

        "finwise_notifications",

        JSON.stringify(filtered)

    );

};