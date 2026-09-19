import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { getErrorMessage } from "../utils/errorHandler";
import { API_BASE_URL } from "../config/api";

function VendorOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [statusError, setStatusError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [updatingOrderId, setUpdatingOrderId] = useState(null);

    const getUserFriendlyError = (
        error,
        fallback = "Something went wrong. Please try again."
    ) => {
        const message = getErrorMessage(error, fallback);

        if (typeof message !== "string") {
            return fallback;
        }

        const technicalIndicators = [
            "exception",
            "sql",
            "hibernate",
            "postgres",
            "postgresql",
            "constraint",
            "null value",
            "violates",
            "stack trace",
            "org.springframework",
            "java.",
            "jdbc",
            "could not execute",
            "internal server error"
        ];

        const lowerMessage = message.toLowerCase();

        if (
            technicalIndicators.some((indicator) =>
                lowerMessage.includes(indicator)
            )
        ) {
            return fallback;
        }

        return message;
    };

    const fetchOrders = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Your session has expired. Please login again.");
                return;
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/orders/vendor`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setOrders(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setError(
                getUserFriendlyError(
                    error,
                    "Unable to load your orders. Please try again."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (orderId, newStatus) => {
        setStatusError("");
        setSuccessMessage("");
        setUpdatingOrderId(orderId);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setStatusError(
                    "Your session has expired. Please login again."
                );
                return;
            }

            await axios.put(
                `${API_BASE_URL}/api/orders/${orderId}/status`,
                null,
                {
                    params: {
                        status: newStatus
                    },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuccessMessage(
                `Order #${orderId} status updated successfully.`
            );

            await fetchOrders();
        } catch (error) {
            setStatusError(
                getUserFriendlyError(
                    error,
                    "Unable to update the order status. Please try again."
                )
            );
        } finally {
            setUpdatingOrderId(null);
        }
    };

    const getNextStatuses = (status) => {
        switch (status) {
            case "PLACED":
                return ["CONFIRMED", "CANCELLED"];

            case "CONFIRMED":
                return ["PROCESSING", "CANCELLED"];

            case "PROCESSING":
                return ["SHIPPED"];

            case "SHIPPED":
                return ["OUT_FOR_DELIVERY"];

            case "OUT_FOR_DELIVERY":
                return ["DELIVERED"];

            default:
                return [];
        }
    };

    const getStatusClasses = (status) => {
        switch (status) {
            case "PLACED":
                return "bg-yellow-100 text-yellow-700";

            case "CONFIRMED":
                return "bg-blue-100 text-blue-700";

            case "PROCESSING":
                return "bg-purple-100 text-purple-700";

            case "SHIPPED":
                return "bg-indigo-100 text-indigo-700";

            case "OUT_FOR_DELIVERY":
                return "bg-orange-100 text-orange-700";

            case "DELIVERED":
                return "bg-green-100 text-green-700";

            case "CANCELLED":
                return "bg-red-100 text-red-700";

            case "RETURNED":
                return "bg-gray-200 text-gray-700";

            case "REFUNDED":
                return "bg-green-100 text-green-700";

            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />

                <div className="flex items-center justify-center px-4 py-16">
                    <div className="text-center">
                        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>

                        <h2 className="text-lg sm:text-xl font-semibold text-gray-700">
                            Loading Orders...
                        </h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-7xl mx-auto py-8 sm:py-10 px-4 sm:px-6 lg:px-8">

                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">
                        My Orders
                    </h1>

                    <button
                        onClick={fetchOrders}
                        className="w-full sm:w-auto bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
                    >
                        Refresh Orders
                    </button>
                </div>

                {/* LOAD ERROR */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-red-700 font-medium break-words">
                            {error}
                        </p>

                        <button
                            onClick={fetchOrders}
                            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* STATUS ERROR */}
                {statusError && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-red-700 font-medium break-words">
                            {statusError}
                        </p>

                        <button
                            onClick={() => setStatusError("")}
                            className="mt-3 text-sm font-semibold text-red-700 underline"
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                {/* SUCCESS */}
                {successMessage && (
                    <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
                        <p className="text-green-700 font-medium break-words">
                            {successMessage}
                        </p>
                    </div>
                )}

                {/* EMPTY STATE */}
                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-8 sm:p-10 text-center">
                        <h2 className="text-lg sm:text-xl text-gray-500">
                            No orders received yet
                        </h2>

                        <p className="text-sm text-gray-400 mt-2">
                            Orders containing your products will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5 sm:space-y-6">

                        {orders.map((order) => {
                            const nextStatuses = getNextStatuses(
                                order.status
                            );

                            const isUpdating =
                                updatingOrderId === order.id;

                            return (
                                <div
                                    key={order.id}
                                    className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
                                >

                                    {/* ORDER HEADER */}
                                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">

                                        <div className="min-w-0">
                                            <h2 className="text-lg sm:text-xl font-bold break-words">
                                                Order #{order.id}
                                            </h2>

                                            <p className="text-sm text-gray-500 mt-1 break-words">
                                                {order.orderDate
                                                    ? new Date(
                                                        order.orderDate
                                                    ).toLocaleString()
                                                    : "Date unavailable"}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="font-semibold text-sm sm:text-base">
                                                Status:
                                            </span>

                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClasses(
                                                    order.status
                                                )}`}
                                            >
                                                {order.status
                                                    ? order.status.replaceAll(
                                                        "_",
                                                        " "
                                                    )
                                                    : "UNKNOWN"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* PRODUCTS */}
                                    <div className="border-t mt-5 pt-5">
                                        <h3 className="font-semibold mb-3">
                                            Products
                                        </h3>

                                        <div className="space-y-3">
                                            {Array.isArray(order.items) &&
                                            order.items.length > 0 ? (
                                                order.items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 border rounded-lg p-3"
                                                    >
                                                        <img
                                                            src={item.imageUrl}
                                                            alt={
                                                                item.productName ||
                                                                "Product"
                                                            }
                                                            className="w-full sm:w-16 h-40 sm:h-16 object-cover rounded-lg"
                                                        />

                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold break-words">
                                                                {
                                                                    item.productName
                                                                }
                                                            </p>

                                                            <p className="text-gray-500 text-sm mt-1">
                                                                Quantity:{" "}
                                                                {
                                                                    item.quantity
                                                                }
                                                            </p>
                                                        </div>

                                                        <p className="font-semibold text-base sm:text-right">
                                                            ₹ {item.price}
                                                        </p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-500">
                                                    No product details available.
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* ORDER TOTAL + STATUS */}
                                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-5 border-t mt-5 pt-5">

                                        <p className="text-lg sm:text-xl font-bold">
                                            Total: ₹ {order.totalAmount}
                                        </p>

                                        {nextStatuses.length > 0 && (
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">

                                                <label className="font-semibold text-sm sm:text-base">
                                                    Update Status:
                                                </label>

                                                <select
                                                    className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    value=""
                                                    disabled={isUpdating}
                                                    onChange={(e) => {
                                                        if (
                                                            e.target.value
                                                        ) {
                                                            updateStatus(
                                                                order.id,
                                                                e.target.value
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <option value="">
                                                        {isUpdating
                                                            ? "Updating..."
                                                            : "Select status"}
                                                    </option>

                                                    {nextStatuses.map(
                                                        (status) => (
                                                            <option
                                                                key={status}
                                                                value={status}
                                                            >
                                                                {status.replaceAll(
                                                                    "_",
                                                                    " "
                                                                )}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </div>
                                        )}

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}
            </div>
        </div>
    );
}

export default VendorOrders;