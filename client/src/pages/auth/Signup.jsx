import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "../../assets/css/auth/signup.css";
import API from "../../services/api";

function Signup() {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !formData.name ||
            !formData.email ||
            !formData.password ||
            !formData.confirmPassword
        ) {
            toast.error("Please fill all fields.");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);

try {
    const response = await API.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
    });

    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));

    toast.success(response.data.message || "Account created successfully.");

    setTimeout(() => {
        navigate("/login");
    }, 900);

} catch (error) {
    toast.error(
        error.response?.data?.message || "Signup failed."
    );
} finally {
    setLoading(false);
}
    };

    return (
        <div className="signup-page">
            <section className="signup-left">
                <div className="signup-hero-content">
                    <h1>
                        Start Your
                        <br />
                        Financial Journey
                    </h1>

                    <h2>
                        Build Your
                        <span>Financial Future</span>
                    </h2>

                    <p>
                        Track income, monitor expenses, and achieve
                        <br />
                        your financial goals with confidence.
                    </p>

                    <div className="signup-hero-actions">
                        <div className="signup-store-badge">
                            <i className="fa-solid fa-chart-pie"></i>

                            <div>
                                <small>Visualize</small>
                                <strong>Finances</strong>
                            </div>
                        </div>

                        <div className="signup-store-badge">
                            <i className="fa-solid fa-piggy-bank"></i>

                            <div>
                                <small>Achieve</small>
                                <strong>Savings Goals</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="signup-right">
                <div className="signup-card">
                    <div className="mobile-brand">
                        <i className="fa-solid fa-chart-line"></i>
                        <span>FinWise</span>
                    </div>

                    <h2>Create Account 🚀</h2>

                    <p>Start tracking your finances smarter</p>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label>Full Name</label>

                            <div className="input-box">
                                <i className="fa-solid fa-user"></i>

                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter your full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Email Address</label>

                            <div className="input-box">
                                <i className="fa-solid fa-envelope"></i>

                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Password</label>

                            <div className="input-box">
                                <i className="fa-solid fa-lock"></i>

                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Create password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <i
                                    className={`fa-solid ${
                                        showPassword ? "fa-eye-slash" : "fa-eye"
                                    } toggle-password`}
                                    onClick={() => setShowPassword(!showPassword)}
                                ></i>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Confirm Password</label>

                            <div className="input-box">
                                <i className="fa-solid fa-lock"></i>

                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm password"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />

                                <i
                                    className={`fa-solid ${
                                        showConfirmPassword ? "fa-eye-slash" : "fa-eye"
                                    } toggle-password`}
                                    onClick={() =>
                                        setShowConfirmPassword(!showConfirmPassword)
                                    }
                                ></i>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="signup-btn"
                            disabled={loading}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <button type="button" className="google-btn" disabled>
                        <i className="fa-brands fa-google"></i>
                        Continue with Google
                    </button>

                    <small className="google-note">
                        Google login will be available soon
                    </small>

                    <div className="login-link">
                        Already have an account ? 
                        <Link to="/login"> Sign In</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Signup;