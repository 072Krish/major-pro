import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

function ExpenseCategoryChart({ transactions }) {

    const categoryTotals = {
        Food: 0,
        Transport: 0,
        Shopping: 0,
        Bills: 0,
        Others: 0,
    };

    transactions.forEach((item) => {

        if (item.type === "expense") {

            if (categoryTotals[item.category] !== undefined) {
                categoryTotals[item.category] += Number(item.amount);
            } else {
                categoryTotals.Others += Number(item.amount);
            }

        }

    });

    const data = {

        labels: [
            "Food",
            "Transport",
            "Shopping",
            "Bills",
            "Others",
        ],

datasets: [
    {
        data: [
            categoryTotals.Food,
            categoryTotals.Transport,
            categoryTotals.Shopping,
            categoryTotals.Bills,
            categoryTotals.Others,
        ],

        backgroundColor: [
            "#22C55E",
            "#2563EB",
            "#F59E0B",
            "#EF4444",
            "#8B5CF6",
        ],

        borderWidth: 0,
        spacing: 0,
        hoverOffset: 8,
        hoverBorderWidth: 0,
    },
],
    };

    const options = {

        responsive: true,

        maintainAspectRatio: false,

        cutout: "70%",

        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1400,
            easing: "easeOutQuart",
        },

        plugins: {

            legend: {

                position: "bottom",

                labels: {

                    color: "#CBD5E1",
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: "circle",

                    font: {
                        size: 13,
                        weight: "600",
                    },

                },

            },

            tooltip: {

                backgroundColor: "#0F172A",
                titleColor: "#FFFFFF",
                bodyColor: "#CBD5E1",

                borderColor: "#22C55E",
                borderWidth: 1,

                cornerRadius: 12,
                padding: 12,

            },

        },

    };

    return (
        <Doughnut
            data={data}
            options={options}
        />
    );
}

export default ExpenseCategoryChart;