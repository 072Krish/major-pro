const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const goalRoutes = require("./routes/goalRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/", (req, res) => {
    res.send("🚀 FinWise MERN Backend Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});