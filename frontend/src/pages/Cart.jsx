import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../utils/errorHandler";
import { API_BASE_URL } from "../config/api";

function Cart() {
    const navigate = useNavigate();

    const [cart, setCart] = useState({
        items: [],
        total: 0
    });

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [actionLoading, setActionLoading] = useState({});

    // Fetch cart
    const fetchCart = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const token = localStorage.getItem("token");

            if (!token) {
                setErrorMessage("Please login to view your cart.");
                return;
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/cart`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setCart(response.data);
        } catch (error) {
            setErrorMessage(
                getErrorMessage(
                    error,
                    "Unable to load your cart. Please try again."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    // Set loading state for an individual cart item
    const setItemLoading = (cartItemId, action) => {
        setActionLoading((previous) => ({
            ...previous,
            [cartItemId]: action
        }));
    };

    // Increase quantity
    const increaseQuantity = async (cartItemId) => {
        try {
            setItemLoading(cartItemId, "increase");

            const token = localStorage.getItem("token");

            await axios.put(
                `${API_BASE_URL}/api/cart/increase/${cartItemId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await fetchCart();
        } catch (error) {
            setErrorMessage(
                getErrorMessage(
                    error,
                    "Unable to increase the quantity. Please check stock availability and try again."
                )
            );
        } finally {
            setItemLoading(cartItemId, null);
        }
    };

    // Decrease quantity
    const decreaseQuantity = async (cartItemId) => {
        try {
            setItemLoading(cartItemId, "decrease");

            const token = localStorage.getItem("token");

            await axios.put(
                `${API_BASE_URL}/api/cart/decrease/${cartItemId}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await fetchCart();
        } catch (error) {
            setErrorMessage(
                getErrorMessage(
                    error,
                    "Unable to decrease the quantity. Please try again."
                )
            );
        } finally {
            setItemLoading(cartItemId, null);
        }
    };

    // Remove item
    const removeItem = async (cartItemId) => {
        try {
            setItemLoading(cartItemId, "remove");

            const token = localStorage.getItem("token");

            await axios.delete(
                `${API_BASE_URL}/api/cart/remove/${cartItemId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            await fetchCart();
        } catch (error) {
            setErrorMessage(
                getErrorMessage(
                    error,
                    "Unable to remove this item from your cart. Please try again."
                )
            );
        } finally {
            setItemLoading(cartItemId, null);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />

                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                    <div className="bg-white rounded-xl shadow-md p-8 text-center">
                        <div className="animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-40 mx-auto"></div>
                            <div className="h-4 bg-gray-200 rounded w-56 mx-auto mt-4"></div>
                        </div>

                        <p className="text-gray-600 mt-5">
                            Loading cart...
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
                    My Cart
                </h1>

                {/* Error Message */}
                {errorMessage && (
                    <div className="bg-red-100 border border-red-300 text-red-700 rounded-lg px-4 py-3 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <p className="break-words">
                                {errorMessage}
                            </p>

                            <button
                                onClick={fetchCart}
                                className="shrink-0 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                )}

                {/* Empty Cart */}
                {!errorMessage && cart.items.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-10 text-center">
                        <div className="text-5xl mb-4">
                            🛒
                        </div>

                        <h2 className="text-xl sm:text-2xl font-semibold">
                            Your cart is empty
                        </h2>

                        <p className="text-gray-500 mt-3">
                            Add some products to your cart.
                        </p>

                        <button
                            onClick={() => navigate("/")}
                            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : !errorMessage ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-5">

                            {cart.items.map((item) => {
                                const currentAction =
                                    actionLoading[item.id];

                                const itemLoading =
                                    Boolean(currentAction);

                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-xl shadow-lg p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5"
                                    >

                                        {/* Product Image */}
                                        <div className="w-full sm:w-36 md:w-40 shrink-0">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.productName}
                                                    className="w-full h-48 sm:h-36 md:h-40 object-cover rounded-lg"
                                                />
                                            ) : (
                                                <div className="w-full h-48 sm:h-36 md:h-40 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Information */}
                                        <div className="flex-1 min-w-0">

                                            <h2 className="text-lg sm:text-xl font-bold break-words">
                                                {item.productName}
                                            </h2>

                                            <p className="text-blue-600 text-lg sm:text-xl font-bold mt-2">
                                                ₹ {item.price}
                                            </p>

                                            <p className="text-gray-600 mt-2">
                                                Subtotal: ₹ {item.subtotal}
                                            </p>

                                            {/* Quantity */}
                                            <div className="flex items-center gap-3 sm:gap-4 mt-5">

                                                <button
                                                    onClick={() =>
                                                        decreaseQuantity(item.id)
                                                    }
                                                    disabled={itemLoading}
                                                    aria-label="Decrease quantity"
                                                    className={`w-10 h-10 rounded-lg font-bold text-lg transition ${
                                                        itemLoading
                                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                            : "bg-gray-200 hover:bg-gray-300"
                                                    }`}
                                                >
                                                    −
                                                </button>

                                                <span className="min-w-8 text-center text-lg font-semibold">
                                                    {currentAction === "increase" ||
                                                    currentAction === "decrease"
                                                        ? "..."
                                                        : item.quantity}
                                                </span>

                                                <button
                                                    onClick={() =>
                                                        increaseQuantity(item.id)
                                                    }
                                                    disabled={itemLoading}
                                                    aria-label="Increase quantity"
                                                    className={`w-10 h-10 rounded-lg font-bold text-lg transition ${
                                                        itemLoading
                                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                            : "bg-gray-200 hover:bg-gray-300"
                                                    }`}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Action Status */}
                                            {currentAction && (
                                                <p className="text-sm text-gray-500 mt-3">
                                                    {currentAction === "remove"
                                                        ? "Removing item..."
                                                        : "Updating quantity..."}
                                                </p>
                                            )}

                                            {/* Remove */}
                                            <button
                                                onClick={() =>
                                                    removeItem(item.id)
                                                }
                                                disabled={itemLoading}
                                                className={`mt-4 font-medium ${
                                                    itemLoading
                                                        ? "text-gray-400 cursor-not-allowed"
                                                        : "text-red-600 hover:underline"
                                                }`}
                                            >
                                                {currentAction === "remove"
                                                    ? "Removing..."
                                                    : "Remove"}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Cart Summary */}
                        <div className="bg-white rounded-xl shadow-lg p-5 sm:p-6 h-fit lg:sticky lg:top-24">

                            <h2 className="text-xl sm:text-2xl font-bold">
                                Order Summary
                            </h2>

                            <div className="border-t mt-5 pt-5">

                                <div className="flex justify-between items-center gap-4 text-base sm:text-lg">
                                    <span>
                                        Total
                                    </span>

                                    <span className="font-bold text-blue-600 text-lg sm:text-xl">
                                        ₹ {cart.total}
                                    </span>
                                </div>
                            </div>

                            {/* Checkout */}
                            <button
                                onClick={() => navigate("/checkout")}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg mt-6 hover:bg-blue-700 transition font-semibold"
                            >
                                Proceed to Checkout
                            </button>

                            {/* Continue Shopping */}
                            <button
                                onClick={() => navigate("/")}
                                className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg mt-3 hover:bg-gray-300 transition"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

export default Cart;