import { useEffect, useState } from "react";
import api from "../../services/api";
import VendorNavbar from "../../components/VendorNavbar";
import "./VendorInventory.css";

function VendorInventory() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const vendorId = localStorage.getItem("userId");


    useEffect(() => {
        fetchInventory();
    }, []);


    // ================================
    // FETCH PRODUCTS
    // ================================

    const fetchInventory = async () => {

        try {

            const response = await api.get(
                `/products/vendor/${vendorId}`
            );

            setProducts(response.data);

        } catch (error) {

            console.error(
                "Error fetching inventory:",
                error
            );

        } finally {

            setLoading(false);

        }
    };


    // ================================
    // STOCK CHANGE
    // ================================

    const handleStockChange = (id, value) => {

        setProducts((previousProducts) =>
            previousProducts.map((product) =>
                product.id === id
                    ? {
                        ...product,
                        stockQuantity: value
                    }
                    : product
            )
        );
    };


    // ================================
    // PRICE CHANGE
    // ================================

    const handlePriceChange = (id, value) => {

        setProducts((previousProducts) =>
            previousProducts.map((product) =>
                product.id === id
                    ? {
                        ...product,
                        price: value
                    }
                    : product
            )
        );
    };


    // ================================
    // UPDATE STOCK
    // ================================

    const updateStock = async (product) => {

        try {

            setUpdatingId(product.id);

            await api.put(
                `/products/${product.id}/stock`,
                {
                    stockQuantity:
                        Number(product.stockQuantity)
                }
            );

            alert("Stock updated successfully.");

        } catch (error) {

            console.error(
                "Error updating stock:",
                error
            );

            alert("Unable to update stock.");

        } finally {

            setUpdatingId(null);

        }
    };


    // ================================
    // UPDATE PRICE
    // ================================

    const updatePrice = async (product) => {

        try {

            setUpdatingId(product.id);

            await api.put(
                `/products/${product.id}/price`,
                {
                    price: Number(product.price)
                }
            );

            alert("Price updated successfully.");

        } catch (error) {

            console.error(
                "Error updating price:",
                error
            );

            alert("Unable to update price.");

        } finally {

            setUpdatingId(null);

        }
    };


    // ================================
    // STOCK STATUS
    // ================================

    const getStockStatus = (stock) => {

        const quantity = Number(stock);

        if (quantity === 0) {
            return "out";
        }

        if (quantity <= 5) {
            return "low";
        }

        return "available";
    };


    // ================================
    // LOADING
    // ================================

    if (loading) {

        return (
            <>
                <VendorNavbar />

                <div className="vendor-loading">
                    Loading inventory...
                </div>
            </>
        );
    }


    // ================================
    // PAGE
    // ================================

    return (
        <>
            <VendorNavbar />

            <div className="vendor-inventory-page">

                {/* HEADER */}

                <div className="vendor-page-header">

                    <div>

                        <h1>
                            Inventory Management
                        </h1>

                        <p>
                            Track stock and manage product prices
                        </p>

                    </div>

                    <div className="inventory-count">

                        {products.length} Products

                    </div>

                </div>


                {/* INVENTORY TABLE */}

                <div className="inventory-card">

                    <div className="inventory-table-header">

                        <span>Product</span>

                        <span>Category</span>

                        <span>Price</span>

                        <span>Current Stock</span>

                        <span>Status</span>

                        <span>Action</span>

                    </div>


                    {products.length === 0 ? (

                        <div className="inventory-empty">

                            No products found.

                        </div>

                    ) : (

                        products.map((product) => {

                            const status =
                                getStockStatus(
                                    product.stockQuantity
                                );

                            return (

                                <div
                                    className="inventory-row"
                                    key={product.id}
                                >

                                    {/* PRODUCT */}

                                    <div className="inventory-product">

                                        <img
                                            src={product.imageUrl}
                                            alt={product.productName}
                                        />

                                        <div>

                                            <strong>
                                                {product.productName}
                                            </strong>

                                            <span>
                                                {product.brand}
                                            </span>

                                        </div>

                                    </div>


                                    {/* CATEGORY */}

                                    <div>
                                        {product.category}
                                    </div>


                                    {/* PRICE */}

                                    <div>

                                        <input
                                            className="price-input"
                                            type="number"
                                            min="0"
                                            value={product.price}
                                            onChange={(e) =>
                                                handlePriceChange(
                                                    product.id,
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    {/* STOCK */}

                                    <div>

                                        <input
                                            className="stock-input"
                                            type="number"
                                            min="0"
                                            value={
                                                product.stockQuantity
                                            }
                                            onChange={(e) =>
                                                handleStockChange(
                                                    product.id,
                                                    e.target.value
                                                )
                                            }
                                        />

                                    </div>


                                    {/* STATUS */}

                                    <div>

                                        <span
                                            className={`stock-status ${status}`}
                                        >

                                            {status === "available"
                                                ? "In Stock"
                                                : status === "low"
                                                    ? "Low Stock"
                                                    : "Out of Stock"}

                                        </span>

                                    </div>


                                    {/* ACTIONS */}

                                    <div className="inventory-actions">

                                        <button
                                            className="update-stock-button"
                                            onClick={() =>
                                                updateStock(product)
                                            }
                                            disabled={
                                                updatingId ===
                                                product.id
                                            }
                                        >

                                            {updatingId === product.id
                                                ? "Updating..."
                                                : "Update Stock"}

                                        </button>


                                        <button
                                            className="update-price-button"
                                            onClick={() =>
                                                updatePrice(product)
                                            }
                                            disabled={
                                                updatingId ===
                                                product.id
                                            }
                                        >

                                            {updatingId === product.id
                                                ? "Updating..."
                                                : "Update Price"}

                                        </button>

                                    </div>

                                </div>

                            );

                        })

                    )}

                </div>

            </div>
        </>
    );
}

export default VendorInventory;