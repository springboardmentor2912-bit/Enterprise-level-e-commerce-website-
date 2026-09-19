import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { getErrorMessage } from "../utils/errorHandler";
import { API_BASE_URL } from "../config/api";

const initialProduct = {
    name: "",
    description: "",
    price: "",
    discount: "",
    stock: "",
    category: "",
    imageUrl: ""
};

function EditProduct() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(initialProduct);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch product
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError("");

            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    setError("Your session has expired. Please login again.");
                    return;
                }

                const response = await axios.get(
                    `${API_BASE_URL}/api/products/my`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const selectedProduct = Array.isArray(response.data)
                    ? response.data.find(
                        (p) => p.id === Number(id)
                    )
                    : null;

                if (!selectedProduct) {
                    setError(
                        "The product could not be found or you are not authorized to edit it."
                    );
                    return;
                }

                setProduct({
                    name: selectedProduct.name || "",
                    description: selectedProduct.description || "",
                    price: selectedProduct.price ?? "",
                    discount: selectedProduct.discount ?? 0,
                    stock: selectedProduct.stock ?? "",
                    category: selectedProduct.category || "",
                    imageUrl: selectedProduct.imageUrl || ""
                });
            } catch (error) {
                setError(
                    getErrorMessage(
                        error,
                        "Unable to load the product. Please try again."
                    )
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setProduct((currentProduct) => ({
            ...currentProduct,
            [name]: value
        }));

        setError("");
        setSuccessMessage("");
    };

    // Calculate final price for preview
    const price = Number(product.price || 0);
    const discount = Number(product.discount || 0);

    const finalPrice =
        price - (price * discount) / 100;

    const validateProduct = () => {
        if (!product.name.trim()) {
            return "Please enter a product name.";
        }

        if (product.name.trim().length < 2) {
            return "Product name must contain at least 2 characters.";
        }

        if (!product.description.trim()) {
            return "Please enter a product description.";
        }

        if (price <= 0) {
            return "Product price must be greater than ₹0.";
        }

        if (discount < 0 || discount > 100) {
            return "Discount must be between 0% and 100%.";
        }

        if (product.stock === "" || product.stock === null) {
            return "Please enter the stock quantity.";
        }

        if (Number(product.stock) < 0) {
            return "Stock quantity cannot be negative.";
        }

        if (!Number.isInteger(Number(product.stock))) {
            return "Stock quantity must be a whole number.";
        }

        if (!product.category.trim()) {
            return "Please enter a product category.";
        }

        if (product.imageUrl.trim()) {
            try {
                new URL(product.imageUrl.trim());
            } catch {
                return "Please enter a valid image URL.";
            }
        }

        return "";
    };

    // Update product
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccessMessage("");

        const validationError = validateProduct();

        if (validationError) {
            setError(validationError);
            return;
        }

        setUpdating(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                setError("Your session has expired. Please login again.");
                return;
            }

            const productData = {
                ...product,
                name: product.name.trim(),
                description: product.description.trim(),
                category: product.category.trim(),
                imageUrl: product.imageUrl.trim(),
                price: Number(product.price),
                discount: Number(product.discount || 0),
                stock: Number(product.stock)
            };

            const response = await axios.put(
                `${API_BASE_URL}/api/products/${id}`,
                productData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setSuccessMessage(
                typeof response.data === "string"
                    ? response.data
                    : "Product updated successfully."
            );

            // Give the user a moment to see the success message.
            setTimeout(() => {
                navigate("/vendor/my-products");
            }, 800);
        } catch (error) {
            setError(
                getErrorMessage(
                    error,
                    "Unable to update the product. Please check your details and try again."
                )
            );
        } finally {
            setUpdating(false);
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
                            Loading Product...
                        </h2>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-3xl mx-auto py-6 sm:py-8 lg:py-10 px-4 sm:px-6">
                <div className="bg-white shadow-lg rounded-xl p-5 sm:p-7 lg:p-8">

                    <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-6 sm:mb-8">
                        Edit Product
                    </h1>

                    {/* ERROR MESSAGE */}
                    {error && (
                        <div
                            role="alert"
                            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
                        >
                            <p className="text-red-700 font-medium break-words">
                                {error}
                            </p>
                        </div>
                    )}

                    {/* SUCCESS MESSAGE */}
                    {successMessage && (
                        <div
                            role="status"
                            className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4"
                        >
                            <p className="text-green-700 font-medium break-words">
                                {successMessage}
                            </p>
                        </div>
                    )}

                    {/* If product wasn't found */}
                    {error && !product.name ? (
                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => navigate("/vendor/my-products")}
                                className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
                            >
                                Back to My Products
                            </button>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-5"
                        >

                            {/* Product Name */}
                            <div>
                                <label
                                    htmlFor="product-name"
                                    className="block font-semibold mb-2"
                                >
                                    Product Name
                                </label>

                                <input
                                    id="product-name"
                                    type="text"
                                    name="name"
                                    value={product.name}
                                    onChange={handleChange}
                                    placeholder="Product Name"
                                    maxLength={150}
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    htmlFor="product-description"
                                    className="block font-semibold mb-2"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="product-description"
                                    name="description"
                                    value={product.description}
                                    onChange={handleChange}
                                    placeholder="Description"
                                    rows="4"
                                    maxLength={2000}
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Price */}
                            <div>
                                <label
                                    htmlFor="product-price"
                                    className="block font-semibold mb-2"
                                >
                                    Product Price (₹)
                                </label>

                                <input
                                    id="product-price"
                                    type="number"
                                    name="price"
                                    value={product.price}
                                    onChange={handleChange}
                                    placeholder="Price"
                                    min="0"
                                    step="0.01"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Discount */}
                            <div>
                                <label
                                    htmlFor="product-discount"
                                    className="block font-semibold mb-2"
                                >
                                    Discount (%)
                                </label>

                                <input
                                    id="product-discount"
                                    type="number"
                                    name="discount"
                                    value={product.discount}
                                    onChange={handleChange}
                                    placeholder="Discount percentage"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <p className="text-sm text-gray-500 mt-1">
                                    Enter a value between 0% and 100%.
                                </p>
                            </div>

                            {/* Price Preview */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-gray-600">
                                    Original Price
                                </p>

                                <p className="text-lg font-semibold">
                                    ₹ {price.toFixed(2)}
                                </p>

                                <p className="text-gray-600 mt-2">
                                    Discount
                                </p>

                                <p className="text-lg font-semibold text-red-600">
                                    {discount}%
                                </p>

                                <p className="text-gray-600 mt-2">
                                    Final Price
                                </p>

                                <p className="text-xl sm:text-2xl font-bold text-green-600">
                                    ₹ {finalPrice.toFixed(2)}
                                </p>
                            </div>

                            {/* Stock */}
                            <div>
                                <label
                                    htmlFor="product-stock"
                                    className="block font-semibold mb-2"
                                >
                                    Stock Quantity
                                </label>

                                <input
                                    id="product-stock"
                                    type="number"
                                    name="stock"
                                    value={product.stock}
                                    onChange={handleChange}
                                    placeholder="Stock"
                                    min="0"
                                    step="1"
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label
                                    htmlFor="product-category"
                                    className="block font-semibold mb-2"
                                >
                                    Category
                                </label>

                                <input
                                    id="product-category"
                                    type="text"
                                    name="category"
                                    value={product.category}
                                    onChange={handleChange}
                                    placeholder="Category"
                                    maxLength={100}
                                    required
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Image URL */}
                            <div>
                                <label
                                    htmlFor="product-image"
                                    className="block font-semibold mb-2"
                                >
                                    Image URL
                                </label>

                                <input
                                    id="product-image"
                                    type="url"
                                    name="imageUrl"
                                    value={product.imageUrl}
                                    onChange={handleChange}
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Update Button */}
                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {updating
                                    ? "Updating Product..."
                                    : "Update Product"}
                            </button>

                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default EditProduct;