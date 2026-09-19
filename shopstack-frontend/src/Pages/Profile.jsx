import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

import CustomerNavbar from "../components/customer/CustomerNavbar";
import VendorNavbar from "../components/VendorNavbar";

function Profile() {

    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState(null);

    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState("");

    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");


    // =====================================================
    // FETCH PROFILE
    // =====================================================

    useEffect(() => {

        if (!userId) {

            setMessage("User session not found.");

            return;
        }

        fetchProfile();

    }, [userId, role]);


    const fetchProfile = async () => {

        try {

            let response;

            /*
             * CUSTOMER
             */
            if (
                role === "CUSTOMER" ||
                role === "customer"
            ) {

                response = await axios.get(
                    `http://localhost:8080/customer/profile/${userId}`
                );

            }

            /*
             * VENDOR
             */
            else if (
                role === "VENDOR" ||
                role === "vendor"
            ) {

                response = await axios.get(
                    `http://localhost:8080/vendor/profile/${userId}`
                );

            }

            /*
             * UNKNOWN ROLE
             */
            else {

                setMessage("Unable to identify account type.");

                return;
            }


            console.log(
                "Profile response:",
                response.data
            );


            setUser(response.data);

            setFormData(response.data);

            setMessage("");


        } catch (error) {

            console.error(
                "Profile loading error:",
                error
            );

            setMessage(
                "Unable to load profile."
            );
        }
    };


    // =====================================================
    // INPUT CHANGE
    // =====================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;

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
            ...user
        });

        setMessage("");

        setIsEditing(true);
    };


    // =====================================================
    // CANCEL
    // =====================================================

    const handleCancel = () => {

        setFormData({
            ...user
        });

        setMessage("");

        setIsEditing(false);
    };


    // =====================================================
    // SAVE
    // =====================================================

    const handleSave = async () => {

        if (!formData.name?.trim()) {

            setMessage(
                "Name is required."
            );

            return;
        }


        if (!formData.email?.trim()) {

            setMessage(
                "Email is required."
            );

            return;
        }


        try {

            let response;


            /*
             * CUSTOMER UPDATE
             */
            if (
                role === "CUSTOMER" ||
                role === "customer"
            ) {

                response = await axios.put(
                    `http://localhost:8080/customer/profile/${userId}`,
                    formData
                );

            }


            /*
             * VENDOR UPDATE
             */
            else if (
                role === "VENDOR" ||
                role === "vendor"
            ) {

                response = await axios.put(
                    `http://localhost:8080/vendor/profile/${userId}`,
                    formData
                );

            }


            setUser(response.data);

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
                "Profile update error:",
                error
            );

            setMessage(
                "Unable to update profile."
            );
        }
    };


    // =====================================================
    // LOADING
    // =====================================================

    if (!user || !formData) {

        return (
            <>
                {role === "VENDOR" ||
                role === "vendor"
                    ? <VendorNavbar />
                    : <CustomerNavbar />
                }

                <div className="profile-loading">

                    {message ||
                        "Loading profile..."
                    }

                </div>
            </>
        );
    }


    // =====================================================
    // NAVBAR
    // =====================================================

    const navbar =
        role === "VENDOR" ||
        role === "vendor"
            ? <VendorNavbar />
            : <CustomerNavbar />;


    return (
        <>
            {navbar}


            <div className="profile-page">

                <div className="profile-container">


                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="profile-header">

                        <div>

                            <h1 className="profile-title">
                                My Profile
                            </h1>

                            <p className="profile-subtitle">
                                Manage your ShopStack account and personal information
                            </p>

                        </div>


                        {!isEditing && (

                            <button
                                className="edit-profile-button"
                                onClick={handleEdit}
                            >
                                Edit Profile
                            </button>

                        )}

                    </div>


                    {/* =================================================
                        MESSAGE
                    ================================================= */}

                    {message && (

                        <div className="profile-message">
                            {message}
                        </div>

                    )}


                    {/* =================================================
                        VIEW MODE
                    ================================================= */}

                    {!isEditing && (

                        <>


                            {/* ACCOUNT */}

                            <div className="profile-card">

                                <div className="section-heading">
                                    Account Overview
                                </div>


                                <div className="profile-grid">

                                    <div className="profile-field">

                                        <span className="profile-label">
                                            Account ID
                                        </span>

                                        <div className="profile-value">
                                            #{user.id}
                                        </div>

                                    </div>


                                    <div className="profile-field">

                                        <span className="profile-label">
                                            Account Status
                                        </span>

                                        <div className="profile-status">
                                            Active
                                        </div>

                                    </div>


                                    <div className="profile-field">

                                        <span className="profile-label">
                                            Full Name
                                        </span>

                                        <div className="profile-value">
                                            {user.name}
                                        </div>

                                    </div>


                                    <div className="profile-field">

                                        <span className="profile-label">
                                            Account Type
                                        </span>

                                        <div className="profile-role">
                                            {user.role || role}
                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* CONTACT */}

                            <div className="profile-card">

                                <div className="section-heading">
                                    Contact Information
                                </div>


                                <div className="profile-grid">

                                    <div className="profile-field">

                                        <span className="profile-label">
                                            Email Address
                                        </span>

                                        <div className="profile-value">
                                            {user.email}
                                        </div>

                                    </div>


                                    <div className="profile-field">

                                        <span className="profile-label">
                                            Phone Number
                                        </span>

                                        <div className="profile-value">
                                            {user.phoneNumber ||
                                                "Not provided"}
                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* ADDRESS */}

                            <div className="profile-card">

                                <div className="section-heading">
                                    Address Information
                                </div>


                                <div className="profile-grid">

                                    <div className="profile-field profile-field-full">

                                        <span className="profile-label">
                                            Address
                                        </span>

                                        <div className="profile-value">
                                            {user.address ||
                                                "Not provided"}
                                        </div>

                                    </div>


                                    <div className="profile-field">

                                        <span className="profile-label">
                                            City
                                        </span>

                                        <div className="profile-value">
                                            {user.city ||
                                                "Not provided"}
                                        </div>

                                    </div>


                                    <div className="profile-field">

                                        <span className="profile-label">
                                            State
                                        </span>

                                        <div className="profile-value">
                                            {user.state ||
                                                "Not provided"}
                                        </div>

                                    </div>


                                    <div className="profile-field">

                                        <span className="profile-label">
                                            Pincode
                                        </span>

                                        <div className="profile-value">
                                            {user.pincode ||
                                                "Not provided"}
                                        </div>

                                    </div>


                                    <div className="profile-field">

                                        <span className="profile-label">
                                            Country
                                        </span>

                                        <div className="profile-value">
                                            {user.country ||
                                                "Not provided"}
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </>

                    )}


                    {/* =================================================
                        EDIT MODE
                    ================================================= */}

                    {isEditing && (

                        <div className="profile-card">

                            <div className="section-heading">
                                Edit Profile
                            </div>


                            <div className="profile-grid">


                                <div className="profile-field">

                                    <label className="profile-label">
                                        Full Name
                                    </label>

                                    <input
                                        className="profile-input"
                                        type="text"
                                        name="name"
                                        value={formData.name || ""}
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="profile-field">

                                    <label className="profile-label">
                                        Email Address
                                    </label>

                                    <input
                                        className="profile-input"
                                        type="email"
                                        name="email"
                                        value={formData.email || ""}
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="profile-field">

                                    <label className="profile-label">
                                        Phone Number
                                    </label>

                                    <input
                                        className="profile-input"
                                        type="tel"
                                        name="phoneNumber"
                                        value={
                                            formData.phoneNumber || ""
                                        }
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="profile-field">

                                    <label className="profile-label">
                                        City
                                    </label>

                                    <input
                                        className="profile-input"
                                        type="text"
                                        name="city"
                                        value={formData.city || ""}
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="profile-field">

                                    <label className="profile-label">
                                        State
                                    </label>

                                    <input
                                        className="profile-input"
                                        type="text"
                                        name="state"
                                        value={formData.state || ""}
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="profile-field">

                                    <label className="profile-label">
                                        Pincode
                                    </label>

                                    <input
                                        className="profile-input"
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode || ""}
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="profile-field">

                                    <label className="profile-label">
                                        Country
                                    </label>

                                    <input
                                        className="profile-input"
                                        type="text"
                                        name="country"
                                        value={formData.country || ""}
                                        onChange={handleChange}
                                    />

                                </div>


                                <div className="profile-field profile-field-full">

                                    <label className="profile-label">
                                        Address
                                    </label>

                                    <textarea
                                        className="profile-textarea"
                                        name="address"
                                        value={formData.address || ""}
                                        onChange={handleChange}
                                        rows="4"
                                    />

                                </div>

                            </div>


                            <div className="profile-actions">

                                <button
                                    className="save-profile-button"
                                    onClick={handleSave}
                                >
                                    Save Changes
                                </button>


                                <button
                                    className="cancel-profile-button"
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

export default Profile;