import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";

function VendorLogin() {

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


        // Store complete user
        localStorage.setItem(
            "user",
            JSON.stringify(response.data)
        );


        localStorage.setItem(
            "userId",
            response.data.id
        );


        localStorage.setItem(
            "role",
            response.data.role
        );


        alert("Login Successful");

        window.location.href="/vendor/products";


    } catch(error) {

        console.log(error);

        alert("Vendor Login Failed");

    }
};
    return (
        <div className="auth-page">

            <div className="auth-container">

                <h2>Vendor Login</h2>

                <form onSubmit={handleLogin}>

                    <input
                        type="email"
                        name="email"
                        placeholder="Vendor Email"
                        value={loginData.email}
                        onChange={handleChange}
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={loginData.password}
                        onChange={handleChange}
                    />

                    <button type="submit">
                        Login
                    </button>

                </form>

                <p>
                    New Vendor? <Link to="/vendor/register">Register</Link>
                </p>

                <p>
                    <Link to="/">← Back</Link>
                </p>

            </div>

        </div>
    );
}

export default VendorLogin;