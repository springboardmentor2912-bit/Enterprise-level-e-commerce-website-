import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { getErrorMessage } from "../utils/errorHandler";

function Register() {
    const navigate = useNavigate();

    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "CUSTOMER",
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value,
        });

        setErrorMessage("");
        setSuccessMessage("");
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        const name = user.name.trim();
        const email = user.email.trim();

        // Client-side validation
        if (!name) {
            setErrorMessage("Please enter your name.");
            return;
        }

        if (name.length < 2) {
            setErrorMessage(
                "Name must contain at least 2 characters."
            );
            return;
        }

        if (!email) {
            setErrorMessage("Please enter your email address.");
            return;
        }

        if (!email.includes("@")) {
            setErrorMessage("Please enter a valid email address.");
            return;
        }

        if (!user.password) {
            setErrorMessage("Please create a password.");
            return;
        }

        if (user.password.length < 6) {
            setErrorMessage(
                "Password must contain at least 6 characters."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await registerUser({
                ...user,
                name,
                email,
            });

            setSuccessMessage(
                response.data || "Registration successful!"
            );

            // Give the user a moment to see the success message
            setTimeout(() => {
                navigate("/");
            }, 1000);

        } catch (error) {
            console.error("Registration error:", error);

            setErrorMessage(
                getErrorMessage(
                    error,
                    "Registration failed. Please check your details and try again."
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
                    Create your account
                </p>

                {errorMessage && (
                    <div
                        role="alert"
                        className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    >
                        ❌ {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div
                        role="status"
                        className="mt-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                    >
                        ✅ {successMessage}
                    </div>
                )}

                <form
                    onSubmit={handleRegister}
                    className="mt-8 space-y-5"
                >

                    <div>
                        <label
                            htmlFor="register-name"
                            className="block mb-2 font-medium text-gray-700"
                        >
                            Name
                        </label>

                        <input
                            id="register-name"
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={user.name}
                            onChange={handleChange}
                            autoComplete="name"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="register-email"
                            className="block mb-2 font-medium text-gray-700"
                        >
                            Email
                        </label>

                        <input
                            id="register-email"
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={user.email}
                            onChange={handleChange}
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="register-password"
                            className="block mb-2 font-medium text-gray-700"
                        >
                            Password
                        </label>

                        <input
                            id="register-password"
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={user.password}
                            onChange={handleChange}
                            autoComplete="new-password"
                            required
                        />

                        <p className="text-xs text-gray-500 mt-1">
                            Password must contain at least 6 characters.
                        </p>
                    </div>

                    <div>
                        <label
                            htmlFor="register-role"
                            className="block mb-2 font-semibold"
                        >
                            Register As
                        </label>

                        <select
                            id="register-role"
                            name="role"
                            value={user.role}
                            onChange={handleChange}
                            className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="CUSTOMER">
                                Customer
                            </option>

                            <option value="VENDOR">
                                Vendor
                            </option>
                        </select>
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
                        {loading
                            ? "Creating Account..."
                            : "Create Account"}
                    </button>

                </form>

                <p className="text-center mt-6">
                    Already have an account?{" "}

                    <Link
                        to="/"
                        className="text-blue-600 hover:underline"
                    >
                        Sign In
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Register;