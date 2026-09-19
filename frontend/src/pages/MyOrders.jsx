import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { getErrorMessage } from "../utils/errorHandler";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function MyOrders() {
    const [orders, setOrders] = useState([]);
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);

    const [returnForm, setReturnForm] = useState(null);
    const [reason, setReason] = useState("");
    const [quantity, setQuantity] = useState(1);

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const headers = () => ({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            setError("");

            const [ordersResult, returnsResult] = await Promise.allSettled([
                axios.get(`${API}/api/orders`, { headers: headers() }),
                axios.get(`${API}/api/returns/my`, { headers: headers() })
            ]);

            let hasError = false;

            if (ordersResult.status === "fulfilled") {
                setOrders(ordersResult.value.data || []);
            } else {
                hasError = true;
                setOrders([]);
                setError(
                    getErrorMessage(
                        ordersResult.reason,
                        "Unable to load your orders. Please try again."
                    )
                );
            }

            if (returnsResult.status === "fulfilled") {
                setReturns(returnsResult.value.data || []);
            } else {
                hasError = true;

                if (!hasError || !error) {
                    setError(
                        getErrorMessage(
                            returnsResult.reason,
                            "Unable to load return information. Please try again."
                        )
                    );
                }
            }

            if (
                ordersResult.status === "fulfilled" &&
                returnsResult.status === "fulfilled"
            ) {
                setError("");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const findReturn = (orderId, productId) =>
        returns.find(
            (item) =>
                item.orderId === orderId &&
                item.productId === productId
        );

    const openReturnForm = (order, item) => {
        setError("");
        setSuccessMessage("");

        setReturnForm({
            orderId: order.id,
            productId: item.productId,
            productName: item.productName,
            maxQuantity: item.quantity
        });

        setQuantity(1);
        setReason("");
    };

    const closeReturnForm = () => {
        if (busy) {
            return;
        }

        setReturnForm(null);
        setReason("");
        setQuantity(1);
    };

    const submitReturn = async (event) => {
        event.preventDefault();

        setError("");
        setSuccessMessage("");

        if (!returnForm) {
            return;
        }

        if (!reason.trim()) {
            setError("Please provide a return reason.");
            return;
        }

        const requestedQuantity = Number(quantity);

        if (
            !Number.isInteger(requestedQuantity) ||
            requestedQuantity < 1 ||
            requestedQuantity > returnForm.maxQuantity
        ) {
            setError(
                `Return quantity must be between 1 and ${returnForm.maxQuantity}.`
            );
            return;
        }

        try {
            setBusy(true);

            await axios.post(
                `${API}/api/returns`,
                {
                    orderId: returnForm.orderId,
                    productId: returnForm.productId,
                    quantity: requestedQuantity,
                    reason: reason.trim()
                },
                {
                    headers: headers()
                }
            );

            setReturnForm(null);
            setReason("");
            setQuantity(1);

            setSuccessMessage(
                "Return request submitted successfully."
            );

            await fetchData();
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Failed to submit the return request. Please try again."
                )
            );
        } finally {
            setBusy(false);
        }
    };

    const markReturned = async (id) => {
        setError("");
        setSuccessMessage("");

        try {
            setBusy(true);

            await axios.put(
                `${API}/api/returns/${id}/returned`,
                {},
                {
                    headers: headers()
                }
            );

            setSuccessMessage(
                "Return marked as handed over. The admin can now receive and inspect it."
            );

            await fetchData();
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Unable to update the return status. Please try again."
                )
            );
        } finally {
            setBusy(false);
        }
    };

    const formatStatus = (status) =>
        status
            ? status
                .replaceAll("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : "-";

    const orderStatuses = [
        "PLACED",
        "CONFIRMED",
        "PROCESSING",
        "SHIPPED",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "RETURNED",
        "REFUNDED"
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <div className="animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-40 mx-auto" />
                            <div className="h-4 bg-gray-200 rounded w-56 mx-auto mt-4" />
                        </div>

                        <p className="text-gray-600 mt-5">
                            Loading orders...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-6xl mx-auto py-6 sm:py-8 lg:py-10 px-4 sm:px-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-6 sm:mb-8">
                    My Orders
                </h1>

                {/* Global Error */}
                {error && (
                    <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <p className="break-words">
                                {error}
                            </p>

                            <button
                                onClick={fetchData}
                                className="shrink-0 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Success */}
                {successMessage && (
                    <div className="bg-green-100 border border-green-300 text-green-700 rounded-lg p-4 mb-6 break-words">
                        {successMessage}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-10 text-center">
                        <div className="text-5xl mb-4">
                            📦
                        </div>

                        <h2 className="text-xl sm:text-2xl font-semibold">
                            No Orders Yet
                        </h2>

                        <p className="text-gray-500 mt-3">
                            Your placed orders will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6 sm:space-y-8">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-xl shadow-lg p-4 sm:p-6"
                            >
                                {/* Order Header */}
                                <div className="flex flex-col md:flex-row md:justify-between gap-4 border-b pb-4">
                                    <div className="min-w-0">
                                        <h2 className="text-lg sm:text-xl font-bold break-words">
                                            Order #{order.id}
                                        </h2>

                                        <p className="text-gray-500 mt-1 text-sm sm:text-base break-words">
                                            {new Date(
                                                order.orderDate
                                            ).toLocaleString()}
                                        </p>
                                    </div>

                                    <span className="inline-block bg-green-100 text-green-700 px-3 sm:px-4 py-2 rounded-lg font-semibold h-fit w-fit">
                                        {formatStatus(order.status)}
                                    </span>
                                </div>

                                {/* Order Tracking */}
                                <div className="mt-6 sm:mt-8">
                                    <h3 className="text-lg sm:text-xl font-bold mb-5">
                                        Order Tracking
                                    </h3>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-5 sm:gap-6">
                                        {orderStatuses.map((status) => {
                                            const currentIndex =
                                                orderStatuses.indexOf(
                                                    order.status
                                                );

                                            const statusIndex =
                                                orderStatuses.indexOf(
                                                    status
                                                );

                                            const completed =
                                                statusIndex !== -1 &&
                                                currentIndex !== -1 &&
                                                statusIndex <= currentIndex;

                                            return (
                                                <div
                                                    key={status}
                                                    className="flex flex-col items-center text-center min-w-0"
                                                >
                                                    <div
                                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                                                            completed
                                                                ? "bg-blue-600"
                                                                : "bg-gray-300"
                                                        }`}
                                                    >
                                                        {completed
                                                            ? "✓"
                                                            : ""}
                                                    </div>

                                                    <p
                                                        className={`mt-3 text-xs sm:text-sm font-semibold break-words ${
                                                            order.status ===
                                                            status
                                                                ? "text-blue-600"
                                                                : completed
                                                                    ? "text-gray-700"
                                                                    : "text-gray-400"
                                                        }`}
                                                    >
                                                        {formatStatus(status)}
                                                    </p>

                                                    {order.status ===
                                                        status && (
                                                            <span className="mt-1 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                                                            Current
                                                        </span>
                                                        )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Products */}
                                <div className="mt-6 sm:mt-8 border-t pt-5 sm:pt-6">
                                    <h3 className="text-lg sm:text-xl font-bold mb-4">
                                        Products
                                    </h3>

                                    <div className="space-y-5">
                                        {order.items.map((item) => {
                                            const returnRequest =
                                                findReturn(
                                                    order.id,
                                                    item.productId
                                                );

                                            return (
                                                <div
                                                    key={item.id}
                                                    className="border-b pb-5 last:border-b-0"
                                                >
                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                        {/* Image */}
                                                        <div className="shrink-0">
                                                            {item.imageUrl ? (
                                                                <img
                                                                    src={
                                                                        item.imageUrl
                                                                    }
                                                                    alt={
                                                                        item.productName
                                                                    }
                                                                    className="w-full sm:w-24 h-48 sm:h-24 object-cover rounded-lg"
                                                                />
                                                            ) : (
                                                                <div className="w-full sm:w-24 h-48 sm:h-24 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-500">
                                                                    No Image
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Information */}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-lg font-bold break-words">
                                                                {
                                                                    item.productName
                                                                }
                                                            </h3>

                                                            <p className="text-gray-600 mt-1">
                                                                Quantity:{" "}
                                                                {
                                                                    item.quantity
                                                                }
                                                            </p>

                                                            <p className="text-gray-600">
                                                                Price: ₹
                                                                {Number(
                                                                    item.price
                                                                ).toFixed(2)}
                                                            </p>

                                                            <p className="font-bold text-blue-600 mt-1">
                                                                Subtotal: ₹
                                                                {Number(
                                                                    item.subtotal
                                                                ).toFixed(2)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Return Button */}
                                                    {order.status ===
                                                        "DELIVERED" &&
                                                        !returnRequest && (
                                                            <button
                                                                onClick={() =>
                                                                    openReturnForm(
                                                                        order,
                                                                        item
                                                                    )
                                                                }
                                                                className="mt-4 w-full sm:w-auto bg-orange-500 text-white px-4 py-2.5 rounded-lg hover:bg-orange-600 transition"
                                                            >
                                                                Request Return
                                                            </button>
                                                        )}

                                                    {/* Return Information */}
                                                    {returnRequest && (
                                                        <div className="mt-4 bg-gray-50 border rounded-lg p-4">
                                                            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 sm:items-center">
                                                                <span className="font-semibold">
                                                                    Return
                                                                    status:
                                                                </span>

                                                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold w-fit">
                                                                    {formatStatus(
                                                                        returnRequest.status
                                                                    )}
                                                                </span>

                                                                {returnRequest.refundAmount !=
                                                                    null && (
                                                                        <span>
                                                                        Refund:
                                                                        ₹
                                                                            {Number(
                                                                                returnRequest.refundAmount
                                                                            ).toFixed(
                                                                                2
                                                                            )}
                                                                    </span>
                                                                    )}
                                                            </div>

                                                            {returnRequest.status ===
                                                                "APPROVED" && (
                                                                    <button
                                                                        disabled={
                                                                            busy
                                                                        }
                                                                        onClick={() =>
                                                                            markReturned(
                                                                                returnRequest.id
                                                                            )
                                                                        }
                                                                        className={`mt-3 w-full sm:w-auto px-4 py-2.5 rounded-lg text-white font-medium transition ${
                                                                            busy
                                                                                ? "bg-gray-400 cursor-not-allowed"
                                                                                : "bg-blue-600 hover:bg-blue-700"
                                                                        }`}
                                                                    >
                                                                        {busy
                                                                            ? "Updating..."
                                                                            : "I Have Returned the Product"}
                                                                    </button>
                                                                )}

                                                            {returnRequest.status ===
                                                                "REFUND_INITIATED" && (
                                                                    <p className="text-indigo-700 mt-3 break-words">
                                                                        Refund
                                                                        initiated.
                                                                        Awaiting
                                                                        gateway
                                                                        processing.
                                                                    </p>
                                                                )}

                                                            {returnRequest.status ===
                                                                "REFUNDED" && (
                                                                    <p className="text-green-700 mt-3 font-semibold break-words">
                                                                        Refund
                                                                        completed
                                                                        successfully.
                                                                    </p>
                                                                )}

                                                            {returnRequest.status ===
                                                                "REJECTED" && (
                                                                    <p className="text-red-700 mt-3 break-words">
                                                                        Return
                                                                        rejected:{" "}
                                                                        {returnRequest.adminComment ||
                                                                            "No reason provided."}
                                                                    </p>
                                                                )}

                                                            {returnRequest.status ===
                                                                "REJECTED_AFTER_INSPECTION" && (
                                                                    <p className="text-red-700 mt-3 break-words">
                                                                        Returned
                                                                        product was
                                                                        rejected
                                                                        after
                                                                        inspection:{" "}
                                                                        {returnRequest.inspectionComment ||
                                                                            "Product was not eligible for resale/refund."}
                                                                    </p>
                                                                )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="flex justify-between items-center gap-4 mt-5 pt-5 border-t">
                                    <span className="text-lg sm:text-xl font-semibold">
                                        Total
                                    </span>

                                    <span className="text-xl sm:text-2xl font-bold text-blue-600">
                                        ₹
                                        {Number(
                                            order.totalAmount
                                        ).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Return Modal */}
            {returnForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 sm:p-5 z-50">
                    <form
                        onSubmit={submitReturn}
                        className="bg-white rounded-xl shadow-xl p-5 sm:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                    >
                        <h2 className="text-xl sm:text-2xl font-bold mb-2">
                            Request Product Return
                        </h2>

                        <p className="text-gray-600 mb-5 break-words">
                            {returnForm.productName}
                        </p>

                        {/* Modal Error */}
                        {error && (
                            <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg p-3 mb-4 text-sm break-words">
                                {error}
                            </div>
                        )}

                        <label className="block font-semibold mb-2">
                            Quantity
                        </label>

                        <input
                            type="number"
                            min="1"
                            max={returnForm.maxQuantity}
                            value={quantity}
                            onChange={(e) =>
                                setQuantity(e.target.value)
                            }
                            disabled={busy}
                            className="w-full border rounded-lg p-3 mb-4"
                        />

                        <p className="text-xs text-gray-500 -mt-2 mb-4">
                            Maximum return quantity:{" "}
                            {returnForm.maxQuantity}
                        </p>

                        <label className="block font-semibold mb-2">
                            Return Reason
                        </label>

                        <textarea
                            required
                            value={reason}
                            onChange={(e) =>
                                setReason(e.target.value)
                            }
                            disabled={busy}
                            placeholder="Tell us why you want to return this product"
                            className="w-full border rounded-lg p-3 h-28 mb-5 resize-none"
                        />

                        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                            <button
                                type="button"
                                onClick={closeReturnForm}
                                disabled={busy}
                                className="w-full sm:w-auto border px-4 py-2.5 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                Cancel
                            </button>

                            <button
                                disabled={busy}
                                type="submit"
                                className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {busy
                                    ? "Submitting..."
                                    : "Submit Return"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}

export default MyOrders;