import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Dashboard from "./pages/dashboard/Dashboard";
import Transactions from "./pages/transactions/Transactions";
import Budget from "./pages/budget/Budget";
import Reports from "./pages/reports/Reports";
import Insights from "./pages/insights/Insights";
import Goals from "./pages/goals/Goals";
import Landing from "./pages/landing/Landing";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
    return (
        <>
            <Toaster position="top-right" />

<Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
<Route
    path="/dashboard"
    element={
        <ProtectedRoute>
            <Dashboard />
        </ProtectedRoute>
    }
/>

<Route
    path="/transactions"
    element={
        <ProtectedRoute>
            <Transactions />
        </ProtectedRoute>
    }
/>

<Route
    path="/budget"
    element={
        <ProtectedRoute>
            <Budget />
        </ProtectedRoute>
    }
/>

<Route
    path="/reports"
    element={
        <ProtectedRoute>
            <Reports />
        </ProtectedRoute>
    }
/>

<Route
    path="/insights"
    element={
        <ProtectedRoute>
            <Insights />
        </ProtectedRoute>
    }
/>

<Route
    path="/goals"
    element={
        <ProtectedRoute>
            <Goals />
        </ProtectedRoute>
    }
/>

</Routes>
        </>
    );
}

export default App;