import { useEffect, useState } from "react";
import api from "../services/api";
import "./CustomerProfile.css";

function CustomerProfile() {
    const [profile, setProfile] = useState({
        id: "",
        fullName: "",
        email: "",
        role: "",
    });

    const [fullName, setFullName] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    // =========================================================
    // LOAD PROFILE
    // =========================================================

    useEffect(() => {
        let ignore = false;

        const loadProfile = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    if (!ignore) {
                        setError("Please login again.");
                        setLoading(false);
                    }

                    return;
                }

                const response = await api.get("/profile");

                if (!ignore) {
                    setProfile({
                        id: response.data.id || "",
                        fullName: response.data.fullName || "",
                        email: response.data.email || "",
                        role: response.data.role || "",
                    });

                    setFullName(
                        response.data.fullName || ""
                    );

                    setError("");
                }
            } catch (error) {
                console.error(
                    "Unable to load profile:",
                    error
                );

                if (!ignore) {
                    if (error.response?.status === 401) {
                        setError(
                            "Session expired. Please login again."
                        );
                    } else if (
                        error.response?.status === 403
                    ) {
                        setError(
                            "You are not authorized to view this profile."
                        );
                    } else {
                        setError(
                            error.response?.data?.message ||
                            "Unable to load profile."
                        );
                    }
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        const timer = setTimeout(() => {
            loadProfile();
        }, 0);

        return () => {
            ignore = true;
            clearTimeout(timer);
        };
    }, []);

    // =========================================================
    // UPDATE PROFILE
    // =========================================================

    const handleUpdateProfile = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");

        const trimmedName = fullName.trim();

        if (!trimmedName) {
            setError("Full name cannot be empty.");
            return;
        }

        if (trimmedName.length < 2) {
            setError(
                "Full name must contain at least 2 characters."
            );

            return;
        }

        try {
            setSaving(true);

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please login again.");
                return;
            }

            const response = await api.put(
                `/profile?fullName=${encodeURIComponent(
                    trimmedName
                )}`,
                {}
            );

            setProfile({
                id: response.data.id || "",
                fullName: response.data.fullName || "",
                email: response.data.email || "",
                role: response.data.role || "",
            });

            setFullName(
                response.data.fullName || ""
            );

            setMessage(
                "Profile updated successfully."
            );
        } catch (error) {
            console.error(
                "Unable to update profile:",
                error
            );

            if (error.response?.status === 401) {
                setError(
                    "Session expired. Please login again."
                );
            } else if (
                error.response?.status === 403
            ) {
                setError(
                    "You are not authorized to update this profile."
                );
            } else {
                setError(
                    error.response?.data?.message ||
                    "Unable to update profile."
                );
            }
        } finally {
            setSaving(false);
        }
    };

    // =========================================================
    // LOADING SCREEN
    // =========================================================

    if (loading) {
        return (
            <div className="customer-profile-page">
                <div className="profile-loading">
                    <div className="profile-loading-spinner"></div>

                    <p>
                        Loading profile...
                    </p>
                </div>
            </div>
        );
    }

    // =========================================================
    // PROFILE PAGE
    // =========================================================

    return (
        <div className="customer-profile-page">
            <div className="profile-card">

                {/* PROFILE HEADER */}

                <div className="profile-card-header">
                    <div className="profile-avatar">
                        {profile.fullName
                            ? profile.fullName
                                  .charAt(0)
                                  .toUpperCase()
                            : "C"}
                    </div>

                    <div className="profile-header-text">
                        <h2>My Profile</h2>

                        <p>
                            Manage your customer account
                        </p>
                    </div>
                </div>

                {/* SUCCESS MESSAGE */}

                {message && (
                    <div className="profile-success">
                        <span>✓</span>
                        {message}
                    </div>
                )}

                {/* ERROR MESSAGE */}

                {error && (
                    <div className="profile-error">
                        <span>⚠</span>
                        {error}
                    </div>
                )}

                {/* PROFILE FORM */}

                <form
                    className="profile-form"
                    onSubmit={handleUpdateProfile}
                >

                    {/* FULL NAME */}

                    <div className="profile-field">
                        <label htmlFor="fullName">
                            Full Name
                        </label>

                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(event) => {
                                setFullName(
                                    event.target.value
                                );
                                setMessage("");
                                setError("");
                            }}
                            placeholder="Enter your full name"
                            disabled={saving}
                        />
                    </div>

                    {/* EMAIL */}

                    <div className="profile-field">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={profile.email}
                            disabled
                        />

                        <small>
                            Email cannot be changed.
                        </small>
                    </div>

                    {/* ROLE */}

                    <div className="profile-field">
                        <label htmlFor="role">
                            Role
                        </label>

                        <input
                            id="role"
                            type="text"
                            value={profile.role}
                            disabled
                        />
                    </div>

                    {/* CUSTOMER ID */}

                    <div className="profile-field">
                        <label htmlFor="customerId">
                            Customer ID
                        </label>

                        <input
                            id="customerId"
                            type="text"
                            value={profile.id}
                            disabled
                        />
                    </div>

                    {/* UPDATE BUTTON */}

                    <button
                        type="submit"
                        className="profile-update-button"
                        disabled={saving}
                    >
                        {saving ? (
                            <>
                                <span className="button-spinner"></span>
                                Updating...
                            </>
                        ) : (
                            "Update Profile"
                        )}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default CustomerProfile;