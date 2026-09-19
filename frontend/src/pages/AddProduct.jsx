import { useState } from "react";
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

function AddProduct() {
    const [product, setProduct] = useState(initialProduct);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setProduct((currentProduct) => ({
            ...currentProduct,
            [name]: value
        }));

        setError("");
        setSuccessMessage("");
    };

    // Calculate final price
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

        if (!product.stock && product.stock !== 0) {
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccessMessage("");

        const validationError = validateProduct();

        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

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

            const response = await axios.post(
                `${API_BASE_URL}/api/products`,
                productData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setProduct(initialProduct);

            setSuccessMessage(
                typeof response.data === "string"
                    ? response.data
                    : "Product added successfully."
            );
        } catch (error) {
            setError(
                getErrorMessage(
                    error,
                    "Unable to add the product. Please check your details and try again."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <div className="max-w-3xl mx-auto py-6 sm:py-8 lg:py-10 px-4 sm:px-6">
                <div className="bg-white rounded-xl shadow-lg p-5 sm:p-7 lg:p-8">

                    <h1 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-6 sm:mb-8">
                        Add Product
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
                                placeholder="Enter product name"
                                value={product.name}
                                onChange={handleChange}
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
                                placeholder="Enter product description"
                                value={product.description}
                                onChange={handleChange}
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
                                placeholder="Enter price"
                                value={product.price}
                                onChange={handleChange}
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
                                placeholder="Enter discount percentage"
                                value={product.discount}
                                onChange={handleChange}
                                min="0"
                                max="100"
                                step="0.01"
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />

                            <p className="text-sm text-gray-500 mt-1">
                                Enter a value between 0% and 100%.
                            </p>
                        </div>

                        {/* Final Price */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-gray-600">
                                Original Price
                            </p>

                            <p className="text-lg font-semibold break-words">
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
                                placeholder="Enter stock quantity"
                                value={product.stock}
                                onChange={handleChange}
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
                                placeholder="Enter category"
                                value={product.category}
                                onChange={handleChange}
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
                                placeholder="https://example.com/image.jpg"
                                value={product.imageUrl}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? "Adding Product..." : "Add Product"}
                        </button>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddProduct;