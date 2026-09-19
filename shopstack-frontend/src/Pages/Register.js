import api from "../services/api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Auth.css";

function Register() {

    const navigate = useNavigate();

    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "CUSTOMER"
    });

    const handleChange = (e) => {

        setUser({
            ...user,
            [e.target.name]: e.target.value
        });

    };

    const handleRegister = async (e) => {

        e.preventDefault();

        try {

            const response = await api.post(
                "/auth/register",
                user
            );

            console.log("Registration response:", response.data);

            alert("Customer registration successful");

            navigate("/login");

        } catch (error) {

            console.error(
                "Registration error:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );

            alert(
                error.response?.data ||
                "Registration failed"
            );
        }
    };

    return (

        <div className="auth-page">

            <div className="auth-container">

                <h2>
                    Customer Registration
                </h2>

                <form onSubmit={handleRegister}>

                    <input
                        name="name"
                        placeholder="Name"
                        value={user.name}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="email"
                        placeholder="Email"
                        type="email"
                        value={user.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        name="password"
                        placeholder="Password"
                        type="password"
                        value={user.password}
                        onChange={handleChange}
                        required
                    />

                    <button type="submit">
                        Register
                    </button>

                    <p>
                        Already have an account?
                        <Link to="/login">
                            {" "}Login
                        </Link>
                    </p>

                </form>

            </div>

        </div>
    );
}

export default Register;