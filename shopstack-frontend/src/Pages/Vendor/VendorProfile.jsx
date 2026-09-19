import React, { useEffect, useState } from "react";
import axios from "axios";
import VendorNavbar from "../../components/VendorNavbar";
import "./VendorProfile.css";

function VendorProfile() {
    const [vendor, setVendor] = useState(null);
    const [formData, setFormData] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(true);

    const vendorId = localStorage.getItem("userId");

    // =====================================================
    // FETCH VENDOR PROFILE
    // =====================================================

    useEffect(() => {
        console.log("Vendor ID from localStorage:", vendorId);

        if (!vendorId) {
            setMessage("Vendor session not found. Please login again.");
            setLoading(false);
            return;
        }

        fetchVendorProfile();
    }, [vendorId]);

    const fetchVendorProfile = async () => {
        try {
            setLoading(true);
            setMessage("");

            console.log(
                "Fetching vendor profile for ID:",
                vendorId
            );

            const response = await axios.get(
                `http://localhost:8080/vendor/profile/${vendorId}`
            );

            console.log(
                "Vendor Profile Response:",
                response.data
            );

            setVendor(response.data);
            setFormData(response.data);
        } catch (error) {
            console.error(
                "Vendor profile error:",
                error
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
                "URL:",
                error.config?.url
            );

            if (error.response?.status === 404) {
                setMessage(
                    "Vendor profile API not found. Check your backend endpoint."
                );
            } else if (error.response?.status === 403) {
                setMessage(
                    "Access denied. Please login again."
                );
            } else if (error.response?.status === 500) {
                setMessage(
                    "Server error while loading vendor profile."
                );
            } else {
                setMessage(
                    "Unable to load vendor profile."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // HANDLE CHANGE
    // =====================================================

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    // =====================================================
    // EDIT
    // =====================================================

    const handleEdit = () => {
        setFormData({
            ...vendor
        });

        setMessage("");
        setIsEditing(true);
    };

    // =====================================================
    // CANCEL
    // =====================================================

    const handleCancel = () => {
        setFormData({
            ...vendor
        });

        setMessage("");
        setIsEditing(false);
    };

    // =====================================================
    // SAVE
    // =====================================================

    const handleSave = async () => {
        if (!formData.name?.trim()) {
            setMessage("Vendor name is required.");
            return;
        }

        if (!formData.email?.trim()) {
            setMessage("Email address is required.");
            return;
        }

        try {
            const response = await axios.put(
                `http://localhost:8080/vendor/profile/${vendorId}`,
                formData
            );

            console.log(
                "Updated Vendor:",
                response.data
            );

            setVendor(response.data);
            setFormData(response.data);

            setIsEditing(false);

            setMessage(
                "Profile updated successfully."
            );

            setTimeout(() => {
                setMessage("");
            }, 3000);

        } catch (error) {
            console.error(
                "Vendor profile update error:",
                error
            );

            console.error(
                "Status:",
                error.response?.status
            );

            console.error(
                "Response:",
                error.response?.data
            );

            setMessage(
                "Unable to update profile."
            );
        }
    };

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <>
                <VendorNavbar />

                <div className="vendor-profile-loading">
                    Loading vendor profile...
                </div>
            </>
        );
    }

    // =====================================================
    // ERROR
    // =====================================================

    if (!vendor || !formData) {
        return (
            <>
                <VendorNavbar />

                <div className="vendor-profile-error">
                    <h2>
                        Unable to load profile
                    </h2>

                    <p>
                        {message}
                    </p>

                    <button
                        onClick={fetchVendorProfile}
                        className="vendor-profile-retry"
                    >
                        Try Again
                    </button>
                </div>
            </>
        );
    }

    // =====================================================
    // UI
    // =====================================================

    return (
        <>
            <VendorNavbar />

            <div className="vendor-profile-page">

                <div className="vendor-profile-container">

                    {/* ================= HEADER ================= */}

                    <div className="vendor-profile-header">

                        <div>

                            <div className="vendor-profile-badge">
                                VENDOR ACCOUNT
                            </div>

                            <h1>
                                My Profile
                            </h1>

                            <p>
                                Manage your vendor account
                                and business information
                            </p>

                        </div>

                        {!isEditing && (
                            <button
                                className="vendor-edit-button"
                                onClick={handleEdit}
                            >
                                Edit Profile
                            </button>
                        )}

                    </div>

                    {/* ================= MESSAGE ================= */}

                    {message && (
                        <div className="vendor-profile-message">
                            {message}
                        </div>
                    )}

                    {!isEditing ? (
                        <>

                            {/* ================= ACCOUNT ================= */}

                            <div className="vendor-profile-card">

                                <div className="vendor-section-title">
                                    Account Overview
                                </div>

                                <div className="vendor-profile-grid">

                                    <div className="vendor-profile-field">

                                        <span>
                                            Vendor ID
                                        </span>

                                        <strong>
                                            #{vendor.id}
                                        </strong>

                                    </div>

                                    <div className="vendor-profile-field">

                                        <span>
                                            Account Status
                                        </span>

                                        <strong className="vendor-active">
                                            Active
                                        </strong>

                                    </div>

                                    <div className="vendor-profile-field">

                                        <span>
                                            Vendor Name
                                        </span>

                                        <strong>
                                            {vendor.name}
                                        </strong>

                                    </div>

                                    <div className="vendor-profile-field">

                                        <span>
                                            Account Type
                                        </span>

                                        <strong className="vendor-role">
                                            {vendor.role || "VENDOR"}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                            {/* ================= CONTACT ================= */}

                            <div className="vendor-profile-card">

                                <div className="vendor-section-title">
                                    Contact Information
                                </div>

                                <div className="vendor-profile-grid">

                                    <div className="vendor-profile-field">

                                        <span>
                                            Email Address
                                        </span>

                                        <strong>
                                            {vendor.email}
                                        </strong>

                                    </div>

                                    <div className="vendor-profile-field">

                                        <span>
                                            Phone Number
                                        </span>

                                        <strong>
                                            {vendor.phoneNumber ||
                                                "Not provided"}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                            {/* ================= BUSINESS ADDRESS ================= */}

                            <div className="vendor-profile-card">

                                <div className="vendor-section-title">
                                    Business Address
                                </div>

                                <div className="vendor-profile-grid">

                                    <div className="vendor-profile-field vendor-full">

                                        <span>
                                            Address
                                        </span>

                                        <strong>
                                            {vendor.address ||
                                                "Not provided"}
                                        </strong>

                                    </div>

                                    <div className="vendor-profile-field">

                                        <span>
                                            City
                                        </span>

                                        <strong>
                                            {vendor.city ||
                                                "Not provided"}
                                        </strong>

                                    </div>

                                    <div className="vendor-profile-field">

                                        <span>
                                            State
                                        </span>

                                        <strong>
                                            {vendor.state ||
                                                "Not provided"}
                                        </strong>

                                    </div>

                                    <div className="vendor-profile-field">

                                        <span>
                                            Pincode
                                        </span>

                                        <strong>
                                            {vendor.pincode ||
                                                "Not provided"}
                                        </strong>

                                    </div>

                                    <div className="vendor-profile-field">

                                        <span>
                                            Country
                                        </span>

                                        <strong>
                                            {vendor.country ||
                                                "Not provided"}
                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </>
                    ) : (

                        /* ================= EDIT MODE ================= */

                        <div className="vendor-profile-card">

                            <div className="vendor-section-title">
                                Edit Vendor Profile
                            </div>

                            <div className="vendor-profile-grid">

                                {/* VENDOR NAME */}

                                <div className="vendor-input-group">

                                    <label>
                                        Vendor Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={
                                            formData.name || ""
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter vendor name"
                                    />

                                </div>

                                {/* EMAIL */}

                                <div className="vendor-input-group">

                                    <label>
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={
                                            formData.email || ""
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter email"
                                    />

                                </div>

                                {/* PHONE */}

                                <div className="vendor-input-group">

                                    <label>
                                        Phone Number
                                    </label>

                                    <input
                                        type="tel"
                                        name="phoneNumber"
                                        value={
                                            formData.phoneNumber || ""
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter phone number"
                                    />

                                </div>

                                {/* CITY */}

                                <div className="vendor-input-group">

                                    <label>
                                        City
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={
                                            formData.city || ""
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter city"
                                    />

                                </div>

                                {/* STATE */}

                                <div className="vendor-input-group">

                                    <label>
                                        State
                                    </label>

                                    <input
                                        type="text"
                                        name="state"
                                        value={
                                            formData.state || ""
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter state"
                                    />

                                </div>

                                {/* PINCODE */}

                                <div className="vendor-input-group">

                                    <label>
                                        Pincode
                                    </label>

                                    <input
                                        type="text"
                                        name="pincode"
                                        value={
                                            formData.pincode || ""
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter pincode"
                                    />

                                </div>

                                {/* COUNTRY */}

                                <div className="vendor-input-group">

                                    <label>
                                        Country
                                    </label>

                                    <input
                                        type="text"
                                        name="country"
                                        value={
                                            formData.country || ""
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter country"
                                    />

                                </div>

                                {/* ADDRESS */}

                                <div className="vendor-input-group vendor-full">

                                    <label>
                                        Business Address
                                    </label>

                                    <textarea
                                        name="address"
                                        value={
                                            formData.address || ""
                                        }
                                        onChange={handleChange}
                                        placeholder="Enter complete business address"
                                        rows="4"
                                    />

                                </div>

                            </div>

                            {/* ACTION BUTTONS */}

                            <div className="vendor-profile-actions">

                                <button
                                    className="vendor-save-button"
                                    onClick={handleSave}
                                >
                                    Save Changes
                                </button>

                                <button
                                    className="vendor-cancel-button"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>

                            </div>

                        </div>
                    )}

                </div>

            </div>
        </>
    );
}

export default VendorProfile;