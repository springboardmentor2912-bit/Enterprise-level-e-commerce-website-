import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { getErrorMessage } from "../utils/errorHandler";

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setErrorMessage("");

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setErrorMessage("Please enter your email address.");
            return;
        }

        if (!trimmedEmail.includes("@")) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        if (!password) {
            setErrorMessage("Please enter your password.");
            return;
        }

        setLoading(true);

        try {
            const response = await loginUser({
                email: trimmedEmail,
                password,
            });

            const token = response.data.token;
            const role = response.data.role;

            if (!token || !role) {
                setErrorMessage(
                    "Login was unsuccessful. Please try again."
                );
                return;
            }

            // Store JWT and role
            localStorage.setItem("token", token);
            localStorage.setItem("role", role);

            // Redirect according to role
            if (role === "ADMIN") {
                navigate("/admin/dashboard");
            } else if (role === "VENDOR") {
                navigate("/vendor/dashboard");
            } else if (role === "WAREHOUSE_STAFF") {
                navigate("/warehouse-staff/dashboard");
            } else {
                navigate("/home");
            }
        } catch (error) {
            console.error("Login error:", error);
            setErrorMessage(
                getErrorMessage(
                    error,
                    "Invalid email or password. Please try again."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">

            <div className="bg-white shadow-xl rounded-2xl p-6 sm:p-8 md:p-10 w-full max-w-md">

                <h1 className="text-3xl font-bold text-center text-blue-600">
                    ShopStack
                </h1>

                <p className="text-center text-gray-500 mt-2">
                    Welcome Back
                </p>

                {errorMessage && (
                    <div
                        role="alert"
                        className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        ❌ {errorMessage}
                    </div>
                )}

                <form
                    onSubmit={handleLogin}
                    className="mt-8 space-y-5"
                >

                    <div>
                        <label
                            htmlFor="login-email"
                            className="block mb-2 font-medium text-gray-700"
                        >
                            Email
                        </label>

                        <input
                            id="login-email"
                            type="email"
                            placeholder="Enter your email"
                            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setErrorMessage("");
                            }}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="login-password"
                            className="block mb-2 font-medium text-gray-700"
                        >
                            Password
                        </label>

                        <input
                            id="login-password"
                            type="password"
                            placeholder="Enter your password"
                            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setErrorMessage("");
                            }}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full text-white py-3 rounded-lg transition ${
                            loading
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {loading ? "Signing In..." : "Sign In"}
                    </button>

                </form>

                <p className="text-center mt-6">
                    Don't have an account?{" "}

                    <Link
                        to="/register"
                        className="text-blue-600 hover:underline"
                    >
                        Create Account
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Login;