export const formatDate = (
    date,
    dateFormat = "DD/MM/YYYY",
    timeFormat = "12"
) => {

    if (!date) return "--";

    const dateObject = new Date(date);

    const options = {

        year: "numeric",
        month: "2-digit",
        day: "2-digit",

        hour: "2-digit",
        minute: "2-digit",

        hour12: timeFormat !== "24",

    };

    const parts =
        new Intl.DateTimeFormat(
            "en-IN",
            options
        ).formatToParts(dateObject);

    const day =
        parts.find(
            part => part.type === "day"
        )?.value;

    const month =
        parts.find(
            part => part.type === "month"
        )?.value;

    const year =
        parts.find(
            part => part.type === "year"
        )?.value;

    const hour =
        parts.find(
            part => part.type === "hour"
        )?.value;

    const minute =
        parts.find(
            part => part.type === "minute"
        )?.value;

    const dayPeriod =
        parts.find(
            part => part.type === "dayPeriod"
        )?.value || "";

    let formattedDate = "";

    switch (dateFormat) {

        case "MM/DD/YYYY":
            formattedDate =
                `${month}/${day}/${year}`;
            break;

        case "YYYY-MM-DD":
            formattedDate =
                `${year}-${month}-${day}`;
            break;

        default:
            formattedDate =
                `${day}/${month}/${year}`;

    }

    return `${formattedDate} ${hour}:${minute} ${dayPeriod}`.trim();

};