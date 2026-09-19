import { useEffect, useState } from "react";
import axios from "axios";
import { getErrorMessage } from "../utils/errorHandler";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function AdminReturns() {
    const [returns, setReturns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [busyId, setBusyId] = useState(null);

    const headers = () => ({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json"
    });

    const fetchReturns = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axios.get(`${API}/api/admin/returns`, {
                headers: headers()
            });

            setReturns(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Unable to load return requests. Please try again."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReturns();
    }, []);

    const action = async (id, method, url, body) => {
        try {
            setBusyId(id);
            setError("");
            setSuccess("");

            await axios({
                method,
                url: `${API}${url}`,
                data: body,
                headers: headers()
            });

            setSuccess("Return request updated successfully.");
            await fetchReturns();
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "The return action could not be completed. Please try again."
                )
            );
        } finally {
            setBusyId(null);
        }
    };

    const approve = (id) =>
        action(
            id,
            "put",
            `/api/admin/returns/${id}/approve`,
            { comment: "Return approved by admin" }
        );

    const reject = (id) => {
        const comment = window.prompt("Reason for rejection:");

        if (comment === null) {
            return;
        }

        if (!comment.trim()) {
            setError("Please provide a rejection reason.");
            return;
        }

        action(
            id,
            "put",
            `/api/admin/returns/${id}/reject`,
            { comment: comment.trim() }
        );
    };

    const receive = (id) =>
        action(
            id,
            "put",
            `/api/admin/returns/${id}/receive`,
            { comment: "Returned product received" }
        );

    const inspect = (id, condition) => {
        const comment =
            window.prompt(`Inspection comment for ${condition}:`) || "";

        action(
            id,
            "put",
            `/api/admin/returns/${id}/inspect`,
            {
                condition,
                comment: comment.trim()
            }
        );
    };

    const refund = (id) => {
        if (
            !window.confirm(
                "Initiate the refund for this accepted return?"
            )
        ) {
            return;
        }

        action(
            id,
            "post",
            `/api/admin/returns/${id}/refund`
        );
    };

    const refreshRefund = (id) =>
        action(
            id,
            "post",
            `/api/admin/returns/${id}/refund/status`
        );

    const format = (value) =>
        value
            ? value
                .replaceAll("_", " ")
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase())
            : "-";

    const getStatusClasses = (status) => {
        switch (status) {
            case "REQUESTED":
                return "bg-yellow-100 text-yellow-800";
            case "APPROVED":
                return "bg-blue-100 text-blue-800";
            case "RETURNED":
                return "bg-indigo-100 text-indigo-800";
            case "RECEIVED":
                return "bg-purple-100 text-purple-800";
            case "ACCEPTED":
                return "bg-green-100 text-green-800";
            case "REFUND_INITIATED":
                return "bg-orange-100 text-orange-800";
            case "REFUNDED":
                return "bg-emerald-100 text-emerald-800";
            case "REJECTED":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const buttonClasses =
        "px-4 py-2 rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed";

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="text-xl sm:text-2xl font-semibold text-gray-700">
                        Loading return requests...
                    </div>
                    <p className="text-gray-500 mt-2">
                        Please wait.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-blue-700 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                        Return & Refund Management
                    </h1>

                    <p className="mt-2 text-sm sm:text-base text-blue-100">
                        Review returns, inspect products and process refunds.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">
                {/* Error */}
                {error && (
                    <div
                        role="alert"
                        className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm sm:text-base text-red-700"
                    >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <span>{error}</span>

                            <button
                                onClick={fetchReturns}
                                className="w-full sm:w-auto shrink-0 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 transition"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Success */}
                {success && (
                    <div
                        role="status"
                        className="mb-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm sm:text-base text-green-700"
                    >
                        {success}
                    </div>
                )}

                {/* Empty state */}
                {returns.length === 0 ? (
                    <div className="bg-white rounded-xl shadow p-6 sm:p-10 text-center">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                            No return requests
                        </h2>

                        <p className="text-gray-500 mt-2 text-sm sm:text-base">
                            Customer return requests will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-5 sm:space-y-6">
                        {returns.map((item) => {
                            const isBusy = busyId === item.id;

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6"
                                >
                                    {/* Return header */}
                                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 border-b border-gray-200 pb-5">
                                        <div className="min-w-0">
                                            <h2 className="text-lg sm:text-xl font-bold text-gray-800 break-words">
                                                Return #{item.id} · Order #
                                                {item.orderId}
                                            </h2>

                                            <p className="text-gray-600 mt-2 text-sm sm:text-base break-words">
                                                <strong>Customer:</strong>{" "}
                                                {item.customerName || "-"}
                                                {item.customerEmail
                                                    ? ` (${item.customerEmail})`
                                                    : ""}
                                            </p>

                                            <p className="text-gray-500 mt-1 text-sm break-words">
                                                <strong>Requested:</strong>{" "}
                                                {item.requestedAt
                                                    ? new Date(
                                                        item.requestedAt
                                                    ).toLocaleString()
                                                    : "-"}
                                            </p>
                                        </div>

                                        <span
                                            className={`self-start shrink-0 px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm ${getStatusClasses(
                                                item.status
                                            )}`}
                                        >
                                            {format(item.status)}
                                        </span>
                                    </div>

                                    {/* Return information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 mt-5">
                                        <div className="space-y-2 text-sm sm:text-base text-gray-700 break-words">
                                            <p>
                                                <strong>Product:</strong>{" "}
                                                {item.productName || "-"}
                                            </p>

                                            <p>
                                                <strong>Quantity:</strong>{" "}
                                                {item.quantity ?? "-"}
                                            </p>

                                            <p>
                                                <strong>Reason:</strong>{" "}
                                                {item.reason || "-"}
                                            </p>

                                            <p>
                                                <strong>Condition:</strong>{" "}
                                                {format(item.condition)}
                                            </p>

                                            <p>
                                                <strong>Refund:</strong>{" "}
                                                {item.refundAmount == null
                                                    ? "-"
                                                    : `₹${Number(
                                                        item.refundAmount
                                                    ).toFixed(2)}`}
                                            </p>

                                            <p>
                                                <strong>
                                                    Inventory Restocked:
                                                </strong>{" "}
                                                {item.inventoryRestocked
                                                    ? "Yes"
                                                    : "No"}
                                            </p>
                                        </div>

                                        <div className="space-y-2 text-sm sm:text-base text-gray-600 break-words">
                                            <p>
                                                <strong>
                                                    Admin comment:
                                                </strong>{" "}
                                                {item.adminComment || "-"}
                                            </p>

                                            <p>
                                                <strong>
                                                    Inspection:
                                                </strong>{" "}
                                                {item.inspectionComment || "-"}
                                            </p>

                                            <p>
                                                <strong>Refund ID:</strong>{" "}
                                                {item.refundId || "-"}
                                            </p>

                                            <p>
                                                <strong>Payment:</strong>{" "}
                                                {format(item.paymentStatus)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 mt-6">
                                        {item.status === "REQUESTED" && (
                                            <>
                                                <button
                                                    disabled={isBusy}
                                                    onClick={() =>
                                                        approve(item.id)
                                                    }
                                                    className={`${buttonClasses} bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto`}
                                                >
                                                    {isBusy
                                                        ? "Processing..."
                                                        : "Approve"}
                                                </button>

                                                <button
                                                    disabled={isBusy}
                                                    onClick={() =>
                                                        reject(item.id)
                                                    }
                                                    className={`${buttonClasses} bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto`}
                                                >
                                                    {isBusy
                                                        ? "Processing..."
                                                        : "Reject"}
                                                </button>
                                            </>
                                        )}

                                        {item.status === "RETURNED" && (
                                            <button
                                                disabled={isBusy}
                                                onClick={() =>
                                                    receive(item.id)
                                                }
                                                className={`${buttonClasses} bg-blue-600 text-white hover:bg-blue-700 w-full sm:w-auto`}
                                            >
                                                {isBusy
                                                    ? "Processing..."
                                                    : "Mark Received"}
                                            </button>
                                        )}

                                        {item.status === "RECEIVED" && (
                                            <>
                                                <button
                                                    disabled={isBusy}
                                                    onClick={() =>
                                                        inspect(
                                                            item.id,
                                                            "SELLABLE"
                                                        )
                                                    }
                                                    className={`${buttonClasses} bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto`}
                                                >
                                                    {isBusy
                                                        ? "Processing..."
                                                        : "Accept · Sellable"}
                                                </button>

                                                <button
                                                    disabled={isBusy}
                                                    onClick={() =>
                                                        inspect(
                                                            item.id,
                                                            "DAMAGED"
                                                        )
                                                    }
                                                    className={`${buttonClasses} bg-orange-600 text-white hover:bg-orange-700 w-full sm:w-auto`}
                                                >
                                                    {isBusy
                                                        ? "Processing..."
                                                        : "Reject · Damaged"}
                                                </button>

                                                <button
                                                    disabled={isBusy}
                                                    onClick={() =>
                                                        inspect(
                                                            item.id,
                                                            "DEFECTIVE"
                                                        )
                                                    }
                                                    className={`${buttonClasses} bg-orange-600 text-white hover:bg-orange-700 w-full sm:w-auto`}
                                                >
                                                    {isBusy
                                                        ? "Processing..."
                                                        : "Reject · Defective"}
                                                </button>

                                                <button
                                                    disabled={isBusy}
                                                    onClick={() =>
                                                        inspect(
                                                            item.id,
                                                            "UNUSABLE"
                                                        )
                                                    }
                                                    className={`${buttonClasses} bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto`}
                                                >
                                                    {isBusy
                                                        ? "Processing..."
                                                        : "Reject · Unusable"}
                                                </button>
                                            </>
                                        )}

                                        {item.status === "ACCEPTED" && (
                                            <button
                                                disabled={isBusy}
                                                onClick={() =>
                                                    refund(item.id)
                                                }
                                                className={`${buttonClasses} bg-purple-600 text-white hover:bg-purple-700 w-full sm:w-auto`}
                                            >
                                                {isBusy
                                                    ? "Processing..."
                                                    : "Process Refund"}
                                            </button>
                                        )}

                                        {item.status === "REFUND_INITIATED" && (
                                            <button
                                                disabled={isBusy}
                                                onClick={() =>
                                                    refreshRefund(item.id)
                                                }
                                                className={`${buttonClasses} bg-indigo-600 text-white hover:bg-indigo-700 w-full sm:w-auto`}
                                            >
                                                {isBusy
                                                    ? "Checking..."
                                                    : "Check Refund Status"}
                                            </button>
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

export default AdminReturns;