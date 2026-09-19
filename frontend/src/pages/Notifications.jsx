import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config/api";

function Notifications() {

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);


    // ==========================================
    // FETCH NOTIFICATIONS
    // ==========================================

    const fetchNotifications = async () => {

        try {

            const token =
                localStorage.getItem("token");

            const response = await axios.get(
                `${API_BASE_URL}/api/notifications`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

            console.log(
                "Notifications:",
                response.data
            );

            setNotifications(
                response.data
            );

        } catch (error) {

            console.error(
                "Error loading notifications:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    // ==========================================
    // MARK AS READ
    // ==========================================

    const markAsRead = async (id) => {

        try {

            const token =
                localStorage.getItem("token");

            await axios.put(
                `${API_BASE_URL}/api/notifications/${id}/read`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );


            // Update UI immediately
            setNotifications(
                notifications.map(
                    (notification) =>
                        notification.id === id
                            ? {
                                ...notification,
                                read: true
                            }
                            : notification
                )
            );

        } catch (error) {

            console.error(
                "Error marking notification as read:",
                error
            );

        }
    };


    // ==========================================
    // LOAD
    // ==========================================

    useEffect(() => {

        const loadNotifications = async () => {

            await fetchNotifications();

        };

        loadNotifications();

    }, []);


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {

        return (

            <div className="min-h-screen bg-gray-100">

                <Navbar />

                <div className="flex justify-center items-center h-96">

                    <p className="text-xl font-semibold">
                        Loading notifications...
                    </p>

                </div>

            </div>
        );
    }


    // ==========================================
    // UI
    // ==========================================

    return (

        <div className="min-h-screen bg-gray-100">

            <Navbar />


            <div className="max-w-5xl mx-auto py-10 px-5">

                <div className="flex justify-between items-center mb-8">

                    <h1 className="text-3xl font-bold text-blue-600">
                        Notifications
                    </h1>

                    <span className="text-gray-500">
                        {notifications.filter(
                            notification =>
                                !notification.read
                        ).length} unread
                    </span>

                </div>


                {notifications.length === 0 ? (

                    <div className="bg-white rounded-xl shadow-lg p-10 text-center">

                        <div className="text-5xl mb-4">
                            🔔
                        </div>

                        <h2 className="text-2xl font-bold">
                            No Notifications
                        </h2>

                        <p className="text-gray-500 mt-2">
                            New order notifications will
                            appear here.
                        </p>

                    </div>

                ) : (

                    <div className="space-y-4">

                        {notifications.map(
                            (notification) => (

                                <div
                                    key={
                                        notification.id
                                    }
                                    className={`bg-white rounded-xl shadow-lg p-5 border-l-4 ${
                                        notification.read
                                            ? "border-gray-300"
                                            : "border-blue-600"
                                    }`}
                                >

                                    <div className="flex justify-between items-start gap-4">

                                        <div className="flex gap-4">

                                            <div
                                                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                    notification.read
                                                        ? "bg-gray-100"
                                                        : "bg-blue-100"
                                                }`}
                                            >

                                                🔔

                                            </div>


                                            <div>

                                                <p
                                                    className={`text-lg ${
                                                        notification.read
                                                            ? "text-gray-600"
                                                            : "font-semibold text-gray-900"
                                                    }`}
                                                >
                                                    {
                                                        notification.message
                                                    }
                                                </p>


                                                <p className="text-sm text-gray-400 mt-2">

                                                    {notification.createdAt
                                                        ? new Date(
                                                            notification.createdAt
                                                        ).toLocaleString()
                                                        : ""
                                                    }

                                                </p>

                                            </div>

                                        </div>


                                        {!notification.read && (

                                            <button
                                                onClick={() =>
                                                    markAsRead(
                                                        notification.id
                                                    )
                                                }
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
                                            >
                                                Mark as read
                                            </button>

                                        )}

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                )}

            </div>

        </div>

    );
}

export default Notifications;