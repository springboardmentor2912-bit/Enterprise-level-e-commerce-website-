import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function AdminLogin() {

    const navigate = useNavigate();

    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (e) => {
        setLoginData({
            ...loginData,
            [e.target.name]: e.target.value
        });
    };

    const handleLogin = (e) => {

        e.preventDefault();

        // Temporary Admin credentials
        const ADMIN_EMAIL = "admin@shopstack.com";
        const ADMIN_PASSWORD = "admin123";

        if (
            loginData.email === ADMIN_EMAIL &&
            loginData.password === ADMIN_PASSWORD
        ) {

            // Store admin information
            localStorage.setItem("userId", "ADMIN");
            localStorage.setItem("role", "ADMINISTRATOR");

            localStorage.setItem(
                "user",
                JSON.stringify({
                    id: "ADMIN",
                    email: ADMIN_EMAIL,
                    role: "ADMINISTRATOR"
                })
            );

            alert("Admin Login Successful");

            navigate("/admin/dashboard");

        } else {

            alert("Invalid Admin Credentials");

        }
    };

    return (

        <div className="auth-page">

            <div className="auth-container">

                <h2>Administrator Login</h2>

                <form onSubmit={handleLogin}>

                    <input
                        type="email"
                        name="email"
                        placeholder="Admin Email"
                        value={loginData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={loginData.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">
                        Login
                    </button>

                </form>

                <p>
                    <Link to="/">← Back</Link>
                </p>

            </div>

        </div>
    );
}

export default AdminLogin;