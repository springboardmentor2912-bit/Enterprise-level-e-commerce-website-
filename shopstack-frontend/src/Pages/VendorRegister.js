import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Auth.css";

function VendorRegister() {

    const navigate = useNavigate();

    const [vendor, setVendor] = useState({
        businessName: "",
        ownerName: "",
        email: "",
        phone: "",
        businessType: "Electronics",
        password: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {

        setVendor({
            ...vendor,
            [e.target.name]: e.target.value
        });

    };

    const handleRegister = async (e) => {

        e.preventDefault();

        // =========================================
        // VALIDATION
        // =========================================

        if (!vendor.businessName.trim()) {
            alert("Please enter your business name.");
            return;
        }

        if (!vendor.ownerName.trim()) {
            alert("Please enter the owner's name.");
            return;
        }

        if (!vendor.email.trim()) {
            alert("Please enter your business email.");
            return;
        }

        if (!vendor.phone.trim()) {
            alert("Please enter your phone number.");
            return;
        }

        if (vendor.password.length < 6) {
            alert("Password must contain at least 6 characters.");
            return;
        }

        if (vendor.password !== vendor.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {

            setLoading(true);

            // =========================================
            // REGISTER USER AS VENDOR
            // =========================================

            const registrationData = {

                name: vendor.ownerName.trim(),

                email: vendor.email.trim(),

                password: vendor.password,

                role: "VENDOR"

            };

            console.log(
                "Vendor registration request:",
                registrationData
            );

            const response = await api.post(
                "/auth/register",
                registrationData
            );

            console.log(
                "Vendor registration response:",
                response.data
            );

            alert(
                "Vendor Registration Successful. Please login."
            );

            navigate("/vendor/login");

        } catch (error) {

            console.error(
                "================================="
            );

            console.error(
                "VENDOR REGISTRATION ERROR"
            );

            console.error(
                "Status:",
                error.response?.status
            );

            console.error(
                "Response:",
                error.response?.data
            );

            console.error(
                "Message:",
                error.message
            );

            console.error(
                "================================="
            );

            // =========================================
            // SHOW ACTUAL BACKEND ERROR
            // =========================================

            const backendMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.response?.data;

            if (
                typeof backendMessage === "string" &&
                backendMessage.trim()
            ) {

                alert(
                    backendMessage
                );

            } else {

                alert(
                    "Vendor registration failed. Check the browser console for the backend response."
                );

            }

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="auth-page">

            <div className="auth-container">

                <h2>
                    Vendor Registration
                </h2>

                <p>
                    Create your ShopStack vendor account
                </p>

                <form onSubmit={handleRegister}>

                    {/* BUSINESS NAME */}

                    <input
                        type="text"
                        name="businessName"
                        placeholder="Business Name"
                        value={vendor.businessName}
                        onChange={handleChange}
                        required
                    />

                    {/* OWNER NAME */}

                    <input
                        type="text"
                        name="ownerName"
                        placeholder="Owner Name"
                        value={vendor.ownerName}
                        onChange={handleChange}
                        required
                    />

                    {/* EMAIL */}

                    <input
                        type="email"
                        name="email"
                        placeholder="Business Email"
                        value={vendor.email}
                        onChange={handleChange}
                        required
                    />

                    {/* PHONE */}

                    <input
                        type="tel"
                        name="phone"
                        placeholder="Phone Number"
                        value={vendor.phone}
                        onChange={handleChange}
                        required
                    />

                    {/* BUSINESS TYPE */}

                    <select
                        name="businessType"
                        value={vendor.businessType}
                        onChange={handleChange}
                    >

                        <option value="Electronics">
                            Electronics
                        </option>

                        <option value="Fashion">
                            Fashion & Apparel
                        </option>

                        <option value="Home">
                            Home & Furniture
                        </option>

                        <option value="Groceries">
                            Groceries
                        </option>

                        <option value="Books">
                            Books & Stationery
                        </option>

                        <option value="Health">
                            Health & Beauty
                        </option>

                        <option value="Sports">
                            Sports & Fitness
                        </option>

                        <option value="Handmade">
                            Handmade & Crafts
                        </option>

                        <option value="Manufacturer">
                            Manufacturer
                        </option>

                        <option value="Wholesaler">
                            Wholesaler
                        </option>

                        <option value="Other">
                            Other
                        </option>

                    </select>

                    {/* PASSWORD */}

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={vendor.password}
                        onChange={handleChange}
                        required
                    />

                    {/* CONFIRM PASSWORD */}

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={vendor.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    {/* SUBMIT */}

                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Creating Account..."
                            : "Register as Vendor"
                        }

                    </button>

                </form>

                <p>

                    Already a vendor?

                    {" "}

                    <Link to="/vendor/login">
                        Login
                    </Link>

                </p>

                <p>

                    <Link to="/">
                        ← Back to Role Selection
                    </Link>

                </p>

            </div>

        </div>

    );

}

export default VendorRegister;