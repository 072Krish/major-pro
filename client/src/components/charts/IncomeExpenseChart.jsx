import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend,
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
);

function IncomeExpenseChart({ transactions }) {
    const monthlyIncome = Array(12).fill(0);
    const monthlyExpense = Array(12).fill(0);

    transactions.forEach((item) => {
        const month = new Date(item.date).getMonth();

        if (item.type === "income") {
            monthlyIncome[month] += Number(item.amount);
        } else {
            monthlyExpense[month] += Number(item.amount);
        }
    });

    const data = {
        labels: [
            "Jan", "Feb", "Mar", "Apr",
            "May", "Jun", "Jul", "Aug",
            "Sep", "Oct", "Nov", "Dec",
        ],

        datasets: [
            {
                label: "Income",
                data: monthlyIncome,
                backgroundColor: "#22C55E",
                borderRadius: 12,
                borderSkipped: false,
                maxBarThickness: 24,
            },
            {
                label: "Expense",
                data: monthlyExpense,
                backgroundColor: "#2563EB",
                borderRadius: 12,
                borderSkipped: false,
                maxBarThickness: 24,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,

        animation: {
            duration: 1400,
            easing: "easeOutQuart",
        },

        interaction: {
            intersect: false,
            mode: "index",
        },

        plugins: {
            legend: {
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
                displayColors: true,
            },
        },

        scales: {
            x: {
                ticks: {
                    color: "#94A3B8",
                    font: {
                        size: 12,
                        weight: "500",
                    },
                },

                grid: {
                    display: false,
                },

                border: {
                    display: false,
                },
            },

            y: {
                beginAtZero: true,

                ticks: {
                    color: "#94A3B8",
                    font: {
                        size: 12,
                    },
                },

                grid: {
                    color: "rgba(255,255,255,.08)",
                },

                border: {
                    display: false,
                },
            },
        },
    };

    return <Bar data={data} options={options} />;
}

export default IncomeExpenseChart;