import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { getErrorMessage } from "../utils/errorHandler";
import { API_BASE_URL } from "../config/api";

function ProductDetails() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [cartMessage, setCartMessage] = useState("");
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                setErrorMessage("");

                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `${API_BASE_URL}/api/products/${id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setProduct(response.data);
            } catch (error) {
                setProduct(null);

                setErrorMessage(
                    getErrorMessage(
                        error,
                        "Unable to load this product. Please try again."
                    )
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const addToCart = async () => {
        setCartMessage("");

        const token = localStorage.getItem("token");

        if (!token) {
            setCartMessage("Please login to add products to your cart.");
            return;
        }

        if (!product) {
            setCartMessage("Product information is unavailable.");
            return;
        }

        if (product.stock <= 0) {
            setCartMessage("This product is currently out of stock.");
            return;
        }

        try {
            setAddingToCart(true);

            const response = await axios.post(
                `${API_BASE_URL}/api/cart/add`,
                {
                    productId: product.id,
                    quantity: 1,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setCartMessage(
                typeof response.data === "string"
                    ? response.data
                    : "Product added to cart successfully."
            );
        } catch (error) {
            setCartMessage(
                getErrorMessage(
                    error,
                    "Unable to add this product to your cart. Please try again."
                )
            );
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />

                <div className="flex justify-center items-center px-4 py-16">
                    <div className="bg-white rounded-xl shadow-md px-6 py-8 text-center w-full max-w-md">
                        <div className="animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-40 mx-auto"></div>

                            <div className="h-4 bg-gray-200 rounded w-56 mx-auto mt-4"></div>
                        </div>

                        <p className="text-gray-600 mt-5">
                            Loading product...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />

                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                    <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center">
                        <div className="text-red-500 text-4xl mb-4">
                            !
                        </div>

                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                            Unable to load product
                        </h2>

                        <p className="text-red-600 mt-3 break-words">
                            {errorMessage}
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="mt-6 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-100">
                <Navbar />

                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                    <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 text-center">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                            Product not found
                        </h2>

                        <p className="text-gray-500 mt-3">
                            The product you are looking for is unavailable.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const isOutOfStock = product.stock <= 0;

    const hasDiscount =
        product.discount != null &&
        product.discount > 0;

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-5xl mx-auto py-6 sm:py-8 lg:py-10 px-4 sm:px-6">
                <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">

                    {/* Product Image */}
                    <div className="w-full">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-xl"
                            />
                        ) : (
                            <div className="w-full h-64 sm:h-80 lg:h-96 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                                No Image
                            </div>
                        )}
                    </div>

                    {/* Product Information */}
                    <div className="min-w-0">

                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold break-words">
                            {product.name}
                        </h1>

                        <p className="text-gray-500 mt-4 leading-relaxed break-words">
                            {product.description}
                        </p>

                        {/* Pricing */}
                        <div className="mt-6">
                            {hasDiscount ? (
                                <>
                                    <div className="flex flex-wrap items-center gap-3">
                                        <span className="text-gray-500 text-lg sm:text-xl line-through">
                                            ₹ {product.price}
                                        </span>

                                        <span className="bg-red-500 text-white px-3 py-1 rounded-lg font-semibold text-sm sm:text-base">
                                            {product.discount}% OFF
                                        </span>
                                    </div>

                                    <h2 className="text-3xl sm:text-4xl text-green-600 font-bold mt-3">
                                        ₹ {product.finalPrice}
                                    </h2>
                                </>
                            ) : (
                                <h2 className="text-3xl sm:text-4xl text-blue-600 font-bold">
                                    ₹ {product.finalPrice ?? product.price}
                                </h2>
                            )}
                        </div>

                        {/* Category */}
                        <p className="mt-6 break-words">
                            Category:
                            <b>
                                {" "}
                                {product.category || "Not specified"}
                            </b>
                        </p>

                        {/* Seller */}
                        <p className="mt-2 break-words">
                            Seller:
                            <b>
                                {" "}
                                {product.vendorName || "Not specified"}
                            </b>
                        </p>

                        {/* Stock */}
                        <div className="mt-4">
                            {isOutOfStock ? (
                                <p className="text-red-600 font-bold text-lg">
                                    Out of Stock
                                </p>
                            ) : (
                                <p className="text-green-600 font-semibold">
                                    {product.stock} items available
                                </p>
                            )}
                        </div>

                        {/* Cart message */}
                        {cartMessage && (
                            <div
                                className={`mt-5 rounded-lg px-4 py-3 text-sm sm:text-base break-words ${
                                    cartMessage.toLowerCase().includes("success")
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                }`}
                            >
                                {cartMessage}
                            </div>
                        )}

                        {/* Add To Cart */}
                        <button
                            onClick={addToCart}
                            disabled={isOutOfStock || addingToCart}
                            className={`w-full mt-6 py-3 rounded-lg text-white font-semibold transition ${
                                isOutOfStock || addingToCart
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700"
                            }`}
                        >
                            {addingToCart
                                ? "Adding to Cart..."
                                : isOutOfStock
                                    ? "Out of Stock"
                                    : "Add to Cart"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;