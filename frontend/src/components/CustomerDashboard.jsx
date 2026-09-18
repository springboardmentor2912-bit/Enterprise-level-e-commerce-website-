import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./customer/CustomerSidebar";
import "./customer/CustomerDashboard.css";
import { readCustomerStorage } from "../utils/customerStorage";

function getCartItemCount() {
    const cart = readCustomerStorage("shopstack-cart", []);
    return cart.reduce(
        (total, item) => total + Number(item.quantity || 1),
        0
    );
}

function groupCustomerOrders(orderItems) {
    const grouped = new Map();

    orderItems.forEach((item) => {
        const reference = item.orderReference || item.id;

        const current = grouped.get(reference) || {
            id: reference,
            items: [],
            total: 0,
            placedAt: item.placedAt,
        };

        current.items.push(item);
        current.total += Number(
            item.customerTotalAmount || item.totalAmount || 0
        );

        if (
            !current.placedAt ||
            new Date(item.placedAt) > new Date(current.placedAt)
        ) {
            current.placedAt = item.placedAt;
        }

        grouped.set(reference, current);
    });

    return [...grouped.values()].sort(
        (left, right) =>
            new Date(right.placedAt || 0) - new Date(left.placedAt || 0)
    );
}

function CustomerDashboard() {
    const navigate = useNavigate();

    const username =
        sessionStorage.getItem("username") ||
        localStorage.getItem("username") ||
        "Customer";

    const [products, setProducts] = useState([]);
    const [cartCount, setCartCount] = useState(getCartItemCount);
    const [wishlistCount, setWishlistCount] = useState(0);
    const [orderCount, setOrderCount] = useState(0);
    const [recentOrders, setRecentOrders] = useState([]);

    // Load products
    useEffect(() => {
        fetch("https://shopstack-backend-gjv6.onrender.com/api/products")
            .then((response) => (response.ok ? response.json() : []))
            .then((data) => {
                setProducts(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                setProducts([]);
            });
    }, []);

    // Load customer data
    useEffect(() => {
        const updateCartCount = () => {
            setCartCount(getCartItemCount());
        };

        const updateCustomerData = () => {
            setCartCount(getCartItemCount());

            const wishlist = readCustomerStorage(
                "shopstack-wishlist",
                []
            );
            setWishlistCount(wishlist.length);

            const savedOrders = readCustomerStorage(
                "shopstack-orders",
                []
            );

            setOrderCount(savedOrders.length);
            setRecentOrders(savedOrders.slice(0, 3));

            const token =
                sessionStorage.getItem("token") ||
                localStorage.getItem("token");

            if (!token) {
                return;
            }

            fetch(
                "https://shopstack-backend-gjv6.onrender.com/api/customer/order-notifications",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
                .then((response) =>
                    response.ok ? response.json() : []
                )
                .then((orderItems) => {
                    const customerOrders = groupCustomerOrders(
                        Array.isArray(orderItems) ? orderItems : []
                    );

                    setOrderCount(customerOrders.length);
                    setRecentOrders(customerOrders.slice(0, 3));
                })
                .catch(() => {
                    // Keep local order data if the API request fails.
                });
        };

        updateCustomerData();

        window.addEventListener("storage", updateCartCount);
        window.addEventListener("cartUpdated", updateCartCount);
        window.addEventListener("ordersUpdated", updateCartCount);
        window.addEventListener("focus", updateCartCount);

        window.addEventListener("storage", updateCustomerData);
        window.addEventListener("cartUpdated", updateCustomerData);
        window.addEventListener("ordersUpdated", updateCustomerData);
        window.addEventListener("focus", updateCustomerData);

        return () => {
            window.removeEventListener("storage", updateCartCount);
            window.removeEventListener("cartUpdated", updateCartCount);
            window.removeEventListener("ordersUpdated", updateCartCount);
            window.removeEventListener("focus", updateCartCount);

            window.removeEventListener("storage", updateCustomerData);
            window.removeEventListener("cartUpdated", updateCustomerData);
            window.removeEventListener("ordersUpdated", updateCustomerData);
            window.removeEventListener("focus", updateCustomerData);
        };
    }, []);

    const categories = [
        ...new Map(
            products
                .filter((product) => Boolean(product.category))
                .map((product) => [product.category, product])
        ).values(),
    ].slice(0, 4);

    const recommendedProducts = products
        .filter((product) => Number(product.stock || 0) > 0)
        .slice(0, 6);

    return (
        <div className="customer-dashboard-page">
            <div className="dashboard-container customer-dashboard-container">
                <CustomerSidebar />

                <div className="dashboard-main">
                    <main className="customer-dashboard-main">
                        {/* Welcome Header */}
                        <section className="customer-dashboard-header">
                            <div className="customer-dashboard-header-content">
                                <h1>Customer Dashboard</h1>
                                <p>
                                    Welcome back,{" "}
                                    <strong>{username}</strong>
                                </p>
                            </div>
                        </section>

                        {/* Statistics */}
                        <section className="customer-dashboard-stats">
                            <div className="customer-stat-card">
                                <div className="customer-stat-icon">📦</div>
                                <h2>{orderCount}</h2>
                                <p>My Orders</p>
                            </div>

                            <div className="customer-stat-card">
                                <div className="customer-stat-icon">❤️</div>
                                <h2>{wishlistCount}</h2>
                                <p>Wishlist</p>
                            </div>

                            <div className="customer-stat-card">
                                <div className="customer-stat-icon">🛒</div>
                                <h2>{cartCount}</h2>
                                <p>Cart Items</p>
                            </div>

                            <div className="customer-stat-card">
                                <div className="customer-stat-icon">✓</div>
                                <h2>Active</h2>
                                <p>Account Status</p>
                            </div>
                        </section>

                        {/* Trending Categories */}
                        <section className="customer-dashboard-section">
                            <div className="customer-section-header">
                                <div>
                                    <h2>Trending Categories</h2>
                                    <p>Explore popular product categories</p>
                                </div>
                            </div>

                            <div className="customer-category-grid">
                                {categories.length > 0 ? (
                                    categories.map((product) => (
                                        <div
                                            className="customer-category-card"
                                            key={product.category}
                                            onClick={() =>
                                                navigate(
                                                    `/customer/products?category=${encodeURIComponent(
                                                        product.category
                                                    )}&inStock=true`
                                                )
                                            }
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(event) => {
                                                if (
                                                    event.key === "Enter" ||
                                                    event.key === " "
                                                ) {
                                                    navigate(
                                                        `/customer/products?category=${encodeURIComponent(
                                                            product.category
                                                        )}&inStock=true`
                                                    );
                                                }
                                            }}
                                        >
                                            <img
                                                src={
                                                    product.imageUrl ||
                                                    "/images/accessories.jpg"
                                                }
                                                alt={product.category}
                                                onError={(event) => {
                                                    event.currentTarget.onerror =
                                                        null;
                                                    event.currentTarget.src =
                                                        "/images/laptop.jpg";
                                                }}
                                            />
                                            <h3>{product.category}</h3>
                                        </div>
                                    ))
                                ) : (
                                    <div className="customer-empty-state">
                                        No categories available.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Recommended Products */}
                        <section className="customer-dashboard-section">
                            <div className="customer-section-header">
                                <div>
                                    <h2>Recommended Products</h2>
                                    <p>Products you may be interested in</p>
                                </div>

                                <button
                                    className="customer-see-all-btn"
                                    onClick={() =>
                                        navigate("/customer/products")
                                    }
                                >
                                    View All
                                </button>
                            </div>

                            <div className="customer-product-grid">
                                {recommendedProducts.length > 0 ? (
                                    recommendedProducts.map((product) => {
                                        const price = Number(
                                            product.salePrice ??
                                                Number(product.price || 0) *
                                                    (1 -
                                                        Number(
                                                            product.discountPercentage ||
                                                                0
                                                        ) /
                                                            100)
                                        );

                                        return (
                                            <div
                                                className="customer-product-card"
                                                key={product.id}
                                            >
                                                <div className="customer-product-image-wrapper">
                                                    <img
                                                        src={
                                                            product.imageUrl ||
                                                            "/images/accessories.jpg"
                                                        }
                                                        alt={product.name}
                                                        onError={(event) => {
                                                            event.currentTarget.onerror =
                                                                null;
                                                            event.currentTarget.src =
                                                                "/images/laptop.jpg";
                                                        }}
                                                    />
                                                </div>

                                                <div className="customer-product-content">
                                                    <div className="customer-product-heading">
                                                        <h3>
                                                            {product.name}
                                                        </h3>
                                                        <span>
                                                            {product.category}
                                                        </span>
                                                    </div>

                                                    <p>
                                                        {product.description}
                                                    </p>

                                                    <div className="customer-product-footer">
                                                        <strong>
                                                            ₹
                                                            {price.toLocaleString()}
                                                        </strong>
                                                        <small>
                                                            {product.stock}{" "}
                                                            available
                                                        </small>
                                                    </div>

                                                    <button
                                                        className="customer-view-product-btn"
                                                        onClick={() =>
                                                            navigate(
                                                                `/customer/products?search=${encodeURIComponent(
                                                                    product.name
                                                                )}&inStock=true`
                                                            )
                                                        }
                                                    >
                                                        View Product
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="customer-empty-state">
                                        No products available.
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Recent Orders */}
                        <section className="customer-dashboard-section">
                            <div className="customer-section-header">
                                <div>
                                    <h2>Recent Orders</h2>
                                    <p>Your latest purchases</p>
                                </div>
                            </div>

                            {recentOrders.length === 0 ? (
                                <div className="customer-empty-orders">
                                    <div className="customer-empty-orders-icon">
                                        📦
                                    </div>
                                    <strong>No orders placed yet</strong>
                                    <span>
                                        Your recent orders will appear here.
                                    </span>
                                </div>
                            ) : (
                                <div className="customer-recent-orders">
                                    {recentOrders.map((order) => (
                                        <div
                                            className="customer-recent-order"
                                            key={order.id}
                                        >
                                            <div className="customer-order-info">
                                                <strong>{order.id}</strong>
                                                <span>
                                                    {order.items?.length || 0}{" "}
                                                    product
                                                    {order.items?.length === 1
                                                        ? ""
                                                        : "s"}
                                                </span>
                                            </div>

                                            <div className="customer-order-amount">
                                                <b>
                                                    ₹
                                                    {Number(
                                                        order.total || 0
                                                    ).toLocaleString()}
                                                </b>
                                                <span>
                                                    {order.placedAt
                                                        ? new Date(
                                                              order.placedAt
                                                          ).toLocaleDateString()
                                                        : "Date unavailable"}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </main>
                </div>
            </div>
        </div>
    );
}

export default CustomerDashboard;
