import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { getErrorMessage } from "../utils/errorHandler";
import { API_BASE_URL } from "../config/api";

function MyProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const fetchProducts = async () => {
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(
                `${API_BASE_URL}/api/products/my`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setProducts(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setError(
                getErrorMessage(
                    error,
                    "Unable to load your products. Please try again."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this product?")) {
            return;
        }

        setDeletingId(id);
        setDeleteError("");
        setSuccessMessage("");

        try {
            const token = localStorage.getItem("token");

            await axios.delete(
                `${API_BASE_URL}/api/products/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setProducts((currentProducts) =>
                currentProducts.filter((product) => product.id !== id)
            );

            setSuccessMessage("Product deleted successfully.");
        } catch (error) {
            setDeleteError(
                getErrorMessage(
                    error,
                    "Unable to delete the product. Please try again."
                )
            );
        } finally {
            setDeletingId(null);
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
                            Loading Products...
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
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 break-words">
                            My Products
                        </h1>

                        <Link
                            to="/add-product"
                            className="w-full sm:w-auto text-center bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                            + Add Product
                        </Link>
                    </div>
                </div>

                {/* LOAD ERROR */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-red-700 font-medium break-words">
                            {error}
                        </p>

                        <button
                            onClick={fetchProducts}
                            className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* DELETE ERROR */}
                {deleteError && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-red-700 font-medium break-words">
                            {deleteError}
                        </p>

                        <button
                            onClick={() => setDeleteError("")}
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
                {products.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-8 sm:p-10 text-center">
                        <h2 className="text-lg sm:text-xl font-semibold">
                            No Products Found
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Add a product to see it here.
                        </p>

                        <Link
                            to="/add-product"
                            className="inline-block mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
                        >
                            Add Product
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">

                        {products.map((product) => (
                            <div
                                key={product.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
                            >

                                {/* IMAGE */}
                                <div className="w-full h-48 sm:h-52 bg-gray-100">
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name || "Product"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>

                                {/* CONTENT */}
                                <div className="p-5 sm:p-6 flex flex-col flex-1">

                                    <h2 className="text-xl font-bold break-words">
                                        {product.name}
                                    </h2>

                                    <p className="text-gray-600 mt-2 text-sm sm:text-base leading-relaxed break-words">
                                        {product.description || "No description available."}
                                    </p>

                                    {/* PRICE */}
                                    {product.discount > 0 ? (
                                        <div className="mt-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-gray-400 line-through">
                                                    ₹ {product.price}
                                                </span>

                                                <span className="text-red-600 font-semibold">
                                                    {product.discount}% OFF
                                                </span>
                                            </div>

                                            <p className="text-green-600 text-2xl font-bold mt-1">
                                                ₹ {product.finalPrice}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-blue-600 text-2xl font-bold mt-4">
                                            ₹ {product.price}
                                        </p>
                                    )}

                                    {/* PRODUCT DETAILS */}
                                    <div className="mt-4 space-y-1 text-sm sm:text-base">
                                        <p className="break-words">
                                            <span className="font-semibold">
                                                Stock:
                                            </span>{" "}
                                            {product.stock}
                                        </p>

                                        <p className="break-words">
                                            <span className="font-semibold">
                                                Category:
                                            </span>{" "}
                                            {product.category}
                                        </p>
                                    </div>

                                    {/* BUTTONS */}
                                    <div className="flex flex-col sm:flex-row gap-3 mt-5">
                                        <Link
                                            to={`/vendor/edit-product/${product.id}`}
                                            className="flex-1 text-center bg-yellow-500 text-white px-4 py-2.5 rounded-lg hover:bg-yellow-600 transition font-medium"
                                        >
                                            Edit
                                        </Link>

                                        <button
                                            onClick={() =>
                                                handleDelete(product.id)
                                            }
                                            disabled={deletingId === product.id}
                                            className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                                        >
                                            {deletingId === product.id
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </div>

                                </div>
                            </div>
                        ))}

                    </div>
                )}
            </div>
        </div>
    );
}

export default MyProducts;