import { useEffect } from "react";
import "../../assets/css/landing/style.css";

function Landing() {
    useEffect(() => {
        const menuBtn = document.getElementById("menuBtn");
        const navLinks = document.getElementById("navLinks");

        const handleMenuClick = () => {
            navLinks.classList.toggle("active");

            const icon = menuBtn.querySelector("i");

            if (navLinks.classList.contains("active")) {
                icon.classList.remove("fa-bars");
                icon.classList.add("fa-xmark");
            } else {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");
            }
        };

        const navItems = document.querySelectorAll(".nav-links a");

        const handleNavClick = () => {
            navLinks.classList.remove("active");

            const icon = menuBtn.querySelector("i");

            if (icon) {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");
            }
        };

        if (menuBtn && navLinks) {
            menuBtn.addEventListener("click", handleMenuClick);
        }

        navItems.forEach(link => {
            link.addEventListener("click", handleNavClick);
        });

        const counters = document.querySelectorAll("[data-count]");

        const startCounter = (counter) => {
            const target = Number(counter.getAttribute("data-count"));
            const duration = 1600;
            const stepTime = 16;
            const totalSteps = duration / stepTime;
            const increment = target / totalSteps;

            let current = 0;

            const updateCounter = () => {
                current += increment;

                if (current < target) {
                    counter.textContent = Math.floor(current).toLocaleString("en-IN");
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target.toLocaleString("en-IN");

                    if (target === 850000) {
                        counter.textContent = "₹" + target.toLocaleString("en-IN");
                    }
                }
            };

            updateCounter();
        };

        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    startCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.4 });

        counters.forEach(counter => {
            counterObserver.observe(counter);
        });

        const faqItems = document.querySelectorAll(".faq-item");

        const faqHandlers = [];

        faqItems.forEach(item => {
            const question = item.querySelector(".faq-question");

            if (question) {
                const handler = () => {
                    faqItems.forEach(faq => {
                        if (faq !== item) {
                            faq.classList.remove("active");
                        }
                    });

                    item.classList.toggle("active");
                };

                question.addEventListener("click", handler);
                faqHandlers.push({ question, handler });
            }
        });

        const sections = document.querySelectorAll(
            ".hero, .trusted, .stats-section, .features, .testimonials, .faq-section, .insights, .footer"
        );

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                }
            });
        }, { threshold: 0.15 });

        sections.forEach(section => revealObserver.observe(section));

        return () => {
            if (menuBtn) {
                menuBtn.removeEventListener("click", handleMenuClick);
            }

            navItems.forEach(link => {
                link.removeEventListener("click", handleNavClick);
            });

            counterObserver.disconnect();
            revealObserver.disconnect();

            faqHandlers.forEach(({ question, handler }) => {
                question.removeEventListener("click", handler);
            });
        };
    }, []);

    return (
        <div className="landing-page">
            <div className="bg-blur blur-blue"></div>
            <div className="bg-blur blur-green"></div>

            <header className="navbar">
                <div className="logo">
                    <i className="fa-solid fa-chart-line"></i>
                    <span>FinWise</span>
                </div>

                <nav className="nav-links" id="navLinks">
                    <a href="#home">Home</a>
                    <a href="#features">Features</a>
                    <a href="#faq">FAQ's</a>
                    <a href="#insights">Insights</a>
                    <a href="#contact">Contact</a>
                </nav>

                <div className="nav-actions">
                    <a href="/login" className="login-link">Login</a>
                    <a href="/signup" className="signup-btn">Get Started</a>
                </div>

                <button className="menu-btn" id="menuBtn">
                    <i className="fa-solid fa-bars"></i>
                </button>
            </header>

            <section className="hero" id="home">
                <div className="hero-content">
                    <div className="badge">
                        <i className="fa-solid fa-shield-halved"></i>
                        Smart finance tracking for modern users
                    </div>

                    <h1>
                        Visualize Your Money.
                        <span>Control Your Future.</span>
                    </h1>

                    <p>
                        FinWise helps you track expenses, monitor income, analyze savings,
                        and understand your financial habits through clean visual dashboards.
                    </p>

                    <div className="hero-buttons">
                        <a href="/signup" className="primary-btn">
                            Start for Free
                            <i className="fa-solid fa-arrow-right"></i>
                        </a>

                        <a href="/login" className="secondary-btn">
                            Login to Dashboard
                        </a>
                    </div>
                </div>

                <div className="hero-visual">
                    <div className="dashboard-card">
                        <div className="card-top">
                            <div>
                                <p>Total Balance</p>
                                <h2>₹84,250</h2>
                            </div>
                            <i className="fa-solid fa-wallet"></i>
                        </div>

                        <div className="chart-box">
                            <span style={{ height: "45%" }}></span>
                            <span style={{ height: "70%" }}></span>
                            <span style={{ height: "55%" }}></span>
                            <span style={{ height: "85%" }}></span>
                            <span style={{ height: "65%" }}></span>
                            <span style={{ height: "95%" }}></span>
                        </div>

                        <div className="money-row income">
                            <div>
                                <i className="fa-solid fa-arrow-trend-up"></i>
                                <span>Income</span>
                            </div>
                            <strong>+ ₹32,000</strong>
                        </div>

                        <div className="money-row expense">
                            <div>
                                <i className="fa-solid fa-arrow-trend-down"></i>
                                <span>Expenses</span>
                            </div>
                            <strong>- ₹12,450</strong>
                        </div>
                    </div>
                </div>
            </section>

            <section className="trusted">
                <p>Trusted by modern finance learners and smart budget planners</p>

                <div className="trusted-logos">
                    <span>BudgetIQ</span>
                    <span>MoneyFlow</span>
                    <span>SaveMate</span>
                    <span>Investly</span>
                </div>
            </section>

            <section className="stats-section">
                <div className="stat-card">
                    <h2 data-count="2500">0</h2>
                    <p>Active Users</p>
                </div>

                <div className="stat-card">
                    <h2 data-count="12000">0</h2>
                    <p>Transactions Tracked</p>
                </div>

                <div className="stat-card">
                    <h2 data-count="850000">0</h2>
                    <p>Total Savings Visualized</p>
                </div>

                <div className="stat-card">
                    <h2 data-count="18">0</h2>
                    <p>Smart Reports</p>
                </div>
            </section>

            <section className="features" id="features">
                <div className="section-heading">
                    <span>Features</span>
                    <h2>Everything You Need to Manage Finance</h2>
                    <p>Powerful tools designed to make personal finance simple, visual, and easy to understand.</p>
                </div>

                <div className="feature-grid">
                    <div className="feature-card">
                        <i className="fa-solid fa-chart-pie"></i>
                        <h3>Expense Visualization</h3>
                        <p>Understand where your money goes with beautiful charts and category-wise insights.</p>
                    </div>

                    <div className="feature-card">
                        <i className="fa-solid fa-sack-dollar"></i>
                        <h3>Income Tracking</h3>
                        <p>Track monthly income sources and compare them with your spending habits.</p>
                    </div>

                    <div className="feature-card">
                        <i className="fa-solid fa-bullseye"></i>
                        <h3>Savings Goals</h3>
                        <p>Create financial goals and monitor your progress with smart visual indicators.</p>
                    </div>
                </div>
            </section>

            <section className="testimonials">
                <div className="section-heading">
                    <span>Testimonials</span>
                    <h2>Hear From Our Users</h2>
                    <p>See what our users have to say about their experience with our Financial services.</p>
                </div>

                <div className="testimonial-grid">
                    <div className="testimonial-card">
                        <p>
                            “FinWise made it easy for me to understand my monthly spending.
                            The dashboard feels clean, modern, and simple.”
                        </p>

                        <div className="user-row">
                            <div className="user-avatar">A</div>
                            <div>
                                <h4>Aarav Mehta</h4>
                                <span>Student</span>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <p>
                            “The visual reports helped me track my income and savings better.
                            It feels like a real finance SaaS product.”
                        </p>

                        <div className="user-row">
                            <div className="user-avatar">R</div>
                            <div>
                                <h4>Riya Sharma</h4>
                                <span>Freelancer</span>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-card">
                        <p>
                            “Simple UI, smooth design, and useful insights. FinWise is perfect
                            for personal budget planning.”
                        </p>

                        <div className="user-row">
                            <div className="user-avatar">K</div>
                            <div>
                                <h4>Kunal Verma</h4>
                                <span>Young Professional</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="faq-section" id="faq">
                <div className="section-heading">
                    <span>FAQ</span>
                    <h2>Frequently Asked Questions</h2>
                    <p>Quick answers about how FinWise helps you manage and visualize your finances.</p>
                </div>

                <div className="faq-container">
                    <div className="faq-item">
                        <button className="faq-question">
                            Is FinWise free to use?
                            <i className="fa-solid fa-plus"></i>
                        </button>
                        <div className="faq-answer">
                            <p>Yes, FinWise is free for basic personal finance tracking and dashboard visualization.</p>
                        </div>
                    </div>

                    <div className="faq-item">
                        <button className="faq-question">
                            Does FinWise store my financial data securely?
                            <i className="fa-solid fa-plus"></i>
                        </button>
                        <div className="faq-answer">
                            <p>FinWise uses MERN authentication with JWT and MongoDB to keep user access secure.</p>
                        </div>
                    </div>

                    <div className="faq-item">
                        <button className="faq-question">
                            Can I track income and expenses?
                            <i className="fa-solid fa-plus"></i>
                        </button>
                        <div className="faq-answer">
                            <p>Yes, the dashboard will include income, expense, savings, and report visualization modules.</p>
                        </div>
                    </div>

                    <div className="faq-item">
                        <button className="faq-question">
                            Is FinWise responsive on mobile?
                            <i className="fa-solid fa-plus"></i>
                        </button>
                        <div className="faq-answer">
                            <p>Yes, FinWise is being designed as a fully responsive SaaS-style financial dashboard.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="insights" id="insights">
                <div className="insight-card">
                    <div>
                        <span>Smart Insights</span>
                        <h2>Make Better Financial Decisions</h2>
                        <p>
                            FinWise converts your financial data into clear insights so you can
                            reduce unnecessary spending and build stronger money habits.
                        </p>
                    </div>

                    <a href="/signup">
                        Create Account
                        <i className="fa-solid fa-arrow-right"></i>
                    </a>
                </div>
            </section>

            <footer className="footer" id="contact">
                <div className="footer-container">
                    <div className="footer-col footer-about">
                        <div className="footer-logo">
                            <i className="fa-solid fa-chart-line"></i>
                            <span>FinWise</span>
                        </div>

                        <p>
                            FinWise is a Smart Financial Visualization Dashboard
                            that helps users track income, expenses, savings,
                            and make better financial decisions through intuitive
                            analytics and interactive reports.
                        </p>
                    </div>

                    <div className="footer-col">
                        <h3>Platform</h3>
                        <a href="#features">Features</a>
                        <a href="#insights">Insights</a>
                        <a href="/login">Dashboard</a>
                        <a href="#">Budget Tracking</a>
                    </div>

                    <div className="footer-col">
                        <h3>Support</h3>
                        <a href="#faq">FAQs</a>
                        <a href="#">Privacy Policy</a>
                        <a href="#">Terms & Conditions</a>
                        <a href="#">Help Center</a>
                    </div>

                    <div className="footer-col footer-contact">
                        <h3>Contact</h3>

                        <p>
                            <i className="fa-solid fa-envelope"></i>
                            support@finwise.com
                        </p>

                        <p>
                            <i className="fa-solid fa-phone"></i>
                            +91 98765 43210
                        </p>

                        <p>
                            <i className="fa-solid fa-location-dot"></i>
                            New Delhi, India
                        </p>

                        <div className="social-links">
                            <a href="#">
                                <i className="fab fa-linkedin-in"></i>
                            </a>

                            <a href="#">
                                <i className="fab fa-github"></i>
                            </a>

                            <a href="#">
                                <i className="fab fa-instagram"></i>
                            </a>

                            <a href="#">
                                <i className="fab fa-x-twitter"></i>
                            </a>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>© 2026 FinWise. All Rights Reserved.</p>

                    <span>Built with ❤️ using MERN Stack</span>
                </div>
            </footer>
        </div>
    );
}

export default Landing;