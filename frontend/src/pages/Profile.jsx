import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config/api";

function Profile() {

    const [profile, setProfile] = useState(null);
    const [editing, setEditing] = useState(false);

    useEffect(() => {

        const fetchProfile = async () => {

            try {

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `${API_BASE_URL}/api/user/profile`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setProfile(response.data);

            } catch (error) {

                console.error(error);
                alert("Failed to load profile");

            }

        };

        fetchProfile();

    }, []);
    const updateProfile = async () => {

        try {

            const token = localStorage.getItem("token");

            await axios.put(
                `${API_BASE_URL}/api/user/profile`,
                profile,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert("Profile Updated Successfully");

            setEditing(false);

        } catch (error) {

            console.error(error);
            alert("Failed to update profile");

        }

    };
    if (!profile) {
        return (
            <h2 className="text-center mt-10 text-xl">
                Loading...
            </h2>
        );
    }

    return (

        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-3xl mx-auto pt-10">

                <div className="bg-white shadow-lg rounded-xl p-8">

                    <h1 className="text-3xl font-bold text-blue-600 mb-8">
                        My Profile
                    </h1>

                    <div className="space-y-4">

                        <div className="mb-4">

                            <label className="font-semibold block mb-1">
                                Name
                            </label>

                            {editing ? (

                                <input
                                    type="text"
                                    value={profile.name}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg p-2"
                                />

                            ) : (

                                <p>{profile.name}</p>

                            )}

                        </div>

                        <div>
                            <span className="font-semibold">Email : </span>
                            {profile.email}
                        </div>

                        <div className="mb-4">
                            <label className="font-semibold block mb-1">Phone</label>

                            {editing ? (
                                <input
                                    type="text"
                                    value={profile.phone || ""}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg p-2"
                                />
                            ) : (
                                <p>{profile.phone}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="font-semibold block mb-1">Address</label>

                            {editing ? (
                                <input
                                    type="text"
                                    value={profile.address || ""}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            address: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg p-2"
                                />
                            ) : (
                                <p>{profile.address}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="font-semibold block mb-1">City</label>

                            {editing ? (
                                <input
                                    type="text"
                                    value={profile.city || ""}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            city: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg p-2"
                                />
                            ) : (
                                <p>{profile.city}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="font-semibold block mb-1">State</label>

                            {editing ? (
                                <input
                                    type="text"
                                    value={profile.state || ""}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            state: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg p-2"
                                />
                            ) : (
                                <p>{profile.state}</p>
                            )}
                        </div>

                        <div className="mb-4">
                            <label className="font-semibold block mb-1">Pincode</label>

                            {editing ? (
                                <input
                                    type="text"
                                    value={profile.pincode || ""}
                                    onChange={(e) =>
                                        setProfile({
                                            ...profile,
                                            pincode: e.target.value,
                                        })
                                    }
                                    className="w-full border rounded-lg p-2"
                                />
                            ) : (
                                <p>{profile.pincode}</p>
                            )}
                        </div>


                    </div>
                    <div className="mt-8 flex gap-4">

                        {editing ? (

                            <>
                                <button
                                    onClick={updateProfile}
                                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                                >
                                    Save Changes
                                </button>

                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                            </>

                        ) : (

                            <button
                                onClick={() => setEditing(true)}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                            >
                                Edit Profile
                            </button>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );
}

export default Profile;