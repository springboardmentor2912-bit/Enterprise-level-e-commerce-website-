import { useEffect, useState } from "react";
import api from "../services/api";

function VendorStockManagement() {
    const [stock, setStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const getToken = () => {
        return localStorage.getItem("token");
    };

    // =========================================================
    // LOAD STOCK
    // =========================================================

    const loadStock = async () => {
        const token = getToken();

        if (!token) {
            setError("Please login first.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/vendor/stock"
            );

            setStock(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {
            console.error(
                "LOAD STOCK ERROR:",
                err
            );

            if (err.response?.status === 401) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else if (err.response?.status === 403) {
                setError(
                    "Access denied. Please login as an approved vendor."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to load stock"
                );
            }

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            const token = getToken();

            if (!token) {
                if (!cancelled) {
                    setError("Please login first.");
                    setLoading(false);
                }
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await api.get(
                    "/vendor/stock"
                );

                if (!cancelled) {
                    setStock(
                        Array.isArray(response.data)
                            ? response.data
                            : []
                    );
                }

            } catch (err) {
                console.error(
                    "INITIAL STOCK ERROR:",
                    err
                );

                if (!cancelled) {
                    if (err.response?.status === 401) {
                        setError(
                            "Your session has expired. Please login again."
                        );
                    } else if (
                        err.response?.status === 403
                    ) {
                        setError(
                            "Access denied. Please login as an approved vendor."
                        );
                    } else {
                        setError(
                            err.response?.data?.message ||
                            "Failed to load stock"
                        );
                    }
                }

            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        const timer = setTimeout(() => {
            load();
        }, 0);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    // =========================================================
    // UPDATE TOTAL STOCK
    // =========================================================

    const updateStock = async (
        productId,
        quantity
    ) => {
        const token = getToken();

        if (!token) {
            setError("Please login first.");
            return;
        }

        try {
            setMessage("");
            setError("");

            await api.put(
                `/vendor/stock/${productId}`,
                {
                    quantity: Number(quantity),
                }
            );

            setMessage(
                "Stock updated successfully."
            );

            await loadStock();

        } catch (err) {
            console.error(
                "UPDATE STOCK ERROR:",
                err
            );

            if (err.response?.status === 401) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else if (err.response?.status === 403) {
                setError(
                    "You are not allowed to update this stock."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to update stock"
                );
            }
        }
    };

    // =========================================================
    // INCREASE STOCK
    // =========================================================

    const increaseStock = async (
        productId
    ) => {
        const amount = prompt(
            "Enter quantity to add:"
        );

        if (!amount) {
            return;
        }

        if (
            Number.isNaN(Number(amount)) ||
            Number(amount) <= 0
        ) {
            setError(
                "Enter a valid quantity."
            );
            return;
        }

        const token = getToken();

        if (!token) {
            setError("Please login first.");
            return;
        }

        try {
            setMessage("");
            setError("");

            await api.put(
                `/vendor/stock/${productId}/increase`,
                {
                    quantity: Number(amount),
                }
            );

            setMessage(
                "Stock increased successfully."
            );

            await loadStock();

        } catch (err) {
            console.error(
                "INCREASE STOCK ERROR:",
                err
            );

            if (err.response?.status === 401) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else if (err.response?.status === 403) {
                setError(
                    "You are not allowed to update this stock."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to increase stock"
                );
            }
        }
    };

    // =========================================================
    // DECREASE STOCK
    // =========================================================

    const decreaseStock = async (
        productId
    ) => {
        const amount = prompt(
            "Enter quantity to remove:"
        );

        if (!amount) {
            return;
        }

        if (
            Number.isNaN(Number(amount)) ||
            Number(amount) <= 0
        ) {
            setError(
                "Enter a valid quantity."
            );
            return;
        }

        const token = getToken();

        if (!token) {
            setError("Please login first.");
            return;
        }

        try {
            setMessage("");
            setError("");

            await api.put(
                `/vendor/stock/${productId}/decrease`,
                {
                    quantity: Number(amount),
                }
            );

            setMessage(
                "Stock decreased successfully."
            );

            await loadStock();

        } catch (err) {
            console.error(
                "DECREASE STOCK ERROR:",
                err
            );

            if (err.response?.status === 401) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else if (err.response?.status === 403) {
                setError(
                    "You are not allowed to update this stock."
                );
            } else {
                setError(
                    err.response?.data?.message ||
                    "Failed to decrease stock"
                );
            }
        }
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div style={{ padding: "20px" }}>
                Loading inventory...
            </div>
        );
    }

    // =========================================================
    // UI
    // =========================================================

    return (
        <div style={{ padding: "20px" }}>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                }}
            >

                <div>
                    <h2>
                        Stock Management
                    </h2>

                    <p>
                        Manage your product inventory
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadStock}
                >
                    Refresh
                </button>

            </div>

            {/* SUCCESS MESSAGE */}

            {message && (
                <div
                    style={{
                        padding: "10px",
                        marginBottom: "15px",
                        borderRadius: "6px",
                    }}
                >
                    {message}
                </div>
            )}

            {/* ERROR MESSAGE */}

            {error && (
                <div
                    style={{
                        padding: "10px",
                        marginBottom: "15px",
                        borderRadius: "6px",
                    }}
                >
                    {error}
                </div>
            )}

            {/* NO STOCK */}

            {stock.length === 0 ? (

                <div>

                    <h3>
                        No inventory found
                    </h3>

                    <p>
                        Add a product first from
                        Product Management.
                    </p>

                </div>

            ) : (

                <div
                    style={{
                        overflowX: "auto",
                    }}
                >

                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                        }}
                    >

                        <thead>

                            <tr>
                                <th>ID</th>
                                <th>Product</th>
                                <th>Total Stock</th>
                                <th>Reserved</th>
                                <th>Available</th>
                                <th>Last Updated</th>
                                <th>Actions</th>
                            </tr>

                        </thead>

                        <tbody>

                            {stock.map((item) => (

                                <tr key={item.id}>

                                    <td>
                                        {item.product?.id}
                                    </td>

                                    <td>
                                        {item.product?.name ||
                                            "Unknown Product"}
                                    </td>

                                    <td>
                                        {item.quantity}
                                    </td>

                                    <td>
                                        {item.reservedQuantity}
                                    </td>

                                    <td>
                                        {item.availableQuantity}
                                    </td>

                                    <td>
                                        {item.lastUpdated
                                            ? new Date(
                                                item.lastUpdated
                                            ).toLocaleString()
                                            : "-"}
                                    </td>

                                    <td>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                increaseStock(
                                                    item.product.id
                                                )
                                            }
                                            style={{
                                                marginRight: "5px",
                                            }}
                                        >
                                            + Add
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                decreaseStock(
                                                    item.product.id
                                                )
                                            }
                                            style={{
                                                marginRight: "5px",
                                            }}
                                        >
                                            - Remove
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {

                                                const quantity =
                                                    prompt(
                                                        "Enter new total stock:",
                                                        item.quantity
                                                    );

                                                if (
                                                    quantity !== null &&
                                                    !Number.isNaN(
                                                        Number(quantity)
                                                    ) &&
                                                    Number(quantity) >= 0
                                                ) {
                                                    updateStock(
                                                        item.product.id,
                                                        quantity
                                                    );
                                                }

                                            }}
                                        >
                                            Edit
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>

            )}

        </div>
    );
}

export default VendorStockManagement;