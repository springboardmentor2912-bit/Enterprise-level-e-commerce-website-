import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerNavbar from "./CustomerNavbar";
import api from "../../services/api";
import "./Customer.css";
//import CustomerNavbar from "./CustomerNavbar";

function CustomerProfile() {
    const navigate = useNavigate();

    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: ""
    });

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {

        try {

            const userId = localStorage.getItem("userId");

            const response = await api.get(
                `/profile/${userId}`
            );

            setProfile({
                name: response.data.name || "",
                email: response.data.email || "",
                phone: response.data.phone || "",
                address: response.data.address || "",
                city: response.data.city || "",
                state: response.data.state || "",
                pincode: response.data.pincode || ""
            });

        } catch (error) {

            console.log(
                "Error fetching profile:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    const handleChange = (e) => {

        const { name, value } = e.target;

        setProfile({
            ...profile,
            [name]: value
        });
    };


    const handleSave = async (e) => {

        e.preventDefault();

        try {

            const userId =
                localStorage.getItem("userId");

            await api.put(
                `/profile/${userId}`,
                profile
            );

            setEditing(false);

            alert("Profile updated successfully");

        } catch (error) {

            console.log(
                "Error updating profile:",
                error
            );

        }
    };


    if (loading) {

        return (
            <>
                <CustomerNavbar />

                <div className="customer-profile-loading">
                    Loading profile...
                </div>
            </>
        );
    }


    return (
        <>
            <CustomerNavbar />

            <div className="customer-profile-page">

                {/* HEADER */}

                <div className="customer-profile-header">

                    <div>
                        <h1>My Profile</h1>

                        <p>
                            Manage your personal information
                        </p>
                    </div>

                    {!editing && (
                        <button
                            className="profile-edit-btn"
                            onClick={() =>
                                setEditing(true)
                            }
                        >
                            Edit Profile
                        </button>
                    )}

                </div>


                {/* PROFILE CONTENT */}

                <div className="customer-profile-layout">


                    {/* PROFILE CARD */}

                    <div className="customer-profile-card">

                        <div className="profile-avatar">

                            {profile.name
                                ? profile.name
                                    .charAt(0)
                                    .toUpperCase()
                                : "U"}

                        </div>

                        <h2>
                            {profile.name || "Customer"}
                        </h2>

                        <p>
                            {profile.email}
                        </p>

                        <span>
                            Customer Account
                        </span>

                    </div>


                    {/* DETAILS */}

                    <div className="customer-profile-details">

                        <div className="profile-section-header">

                            <div>
                                <h2>
                                    Personal Information
                                </h2>

                                <p>
                                    Your account information
                                </p>
                            </div>

                        </div>


                        <form onSubmit={handleSave}>

                            <div className="profile-form-grid">

                                {/* NAME */}

                                <div className="profile-field">

                                    <label>
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleChange}
                                        disabled={!editing}
                                    />

                                </div>


                                {/* EMAIL */}

                                <div className="profile-field">

                                    <label>
                                        Email Address
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleChange}
                                        disabled={!editing}
                                    />

                                </div>


                                {/* PHONE */}

                                <div className="profile-field">

                                    <label>
                                        Phone Number
                                    </label>

                                    <input
                                        type="text"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleChange}
                                        disabled={!editing}
                                    />

                                </div>


                                {/* PINCODE */}

                                <div className="profile-field">

                                    <label>
                                        Pincode
                                    </label>

                                    <input
                                        type="text"
                                        name="pincode"
                                        value={profile.pincode}
                                        onChange={handleChange}
                                        disabled={!editing}
                                    />

                                </div>


                                {/* ADDRESS */}

                                <div className="profile-field profile-full">

                                    <label>
                                        Address
                                    </label>

                                    <textarea
                                        name="address"
                                        value={profile.address}
                                        onChange={handleChange}
                                        disabled={!editing}
                                    />

                                </div>


                                {/* CITY */}

                                <div className="profile-field">

                                    <label>
                                        City
                                    </label>

                                    <input
                                        type="text"
                                        name="city"
                                        value={profile.city}
                                        onChange={handleChange}
                                        disabled={!editing}
                                    />

                                </div>


                                {/* STATE */}

                                <div className="profile-field">

                                    <label>
                                        State
                                    </label>

                                    <input
                                        type="text"
                                        name="state"
                                        value={profile.state}
                                        onChange={handleChange}
                                        disabled={!editing}
                                    />

                                </div>

                            </div>


                            {/* SAVE / CANCEL */}

                            {editing && (

                                <div className="profile-form-actions">

                                    <button
                                        type="button"
                                        className="profile-cancel-btn"
                                        onClick={() => {
                                            setEditing(false);
                                            fetchProfile();
                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="profile-save-btn"
                                    >
                                        Save Changes
                                    </button>

                                </div>

                            )}

                        </form>
                        <br></br>

                        <div className="profile-menu-card">
    <div className="profile-menu-content">
        <h3>My Orders</h3>
        <p>View your orders, payment status and delivery updates.</p>
    </div>

    <button
        className="profile-menu-button"
        onClick={() => navigate("/customer/orders")}
    >
        View Orders
    </button>
</div>

                    </div>

                </div>

            </div>
        </>
    );
}

export default CustomerProfile;