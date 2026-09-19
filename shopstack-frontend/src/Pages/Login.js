import { useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Login() {

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

    const handleLogin = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post(
                "/auth/login",
                loginData
            );

            console.log("LOGIN RESPONSE:", response.data);

            // Store logged-in user's ID
            localStorage.setItem(
                "userId",
                response.data.id
            );

            // Store user's role
            localStorage.setItem(
                "role",
                response.data.role
            );



            alert("Login successful");

            // Go to customer home
            navigate("/customer/home");

        } catch (error) {

            console.log("LOGIN ERROR:", error);

            alert("Login failed");

        }
    };


    return (

        <div className="auth-page">

            <div className="auth-container">

                <h2>Login</h2>

                <form onSubmit={handleLogin}>

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={loginData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="password"
                        placeholder="Password"
                        type="password"
                        value={loginData.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">
                        Login
                    </button>

                    <p>
                        New user?
                        <Link to="/register">
                            {" "}Register
                        </Link>
                    </p>

                </form>

            </div>

        </div>

    );
}

export default Login;