import { useEffect, useState } from "react";
import api from "../services/api";
import "./CustomerProductManagement.css";

function CustomerProductManagement({
    cart,
    setCart,
    onOpenCart,
}) {
    const [products, setProducts] = useState([]);
    const [coupons, setCoupons] = useState([]);

    const [loading, setLoading] = useState(true);
    const [couponLoading, setCouponLoading] = useState(true);

    const [error, setError] = useState("");
    const [couponError, setCouponError] = useState("");

    // =========================================================
    // PRODUCT FILTERS
    // =========================================================

    const [selectedCategory, setSelectedCategory] = useState("All");
    const [maxBudget, setMaxBudget] = useState("");
    const [minimumRating, setMinimumRating] = useState("");

    // =========================================================
    // LOAD PRODUCTS
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const loadProducts = async () => {
            try {
                if (!cancelled) {
                    setLoading(true);
                    setError("");
                }

                const token = localStorage.getItem("token");

                if (!token) {
                    if (!cancelled) {
                        setError("Please login as Customer.");
                        setLoading(false);
                    }
                    return;
                }

                const response = await api.get("/customer/products");

                // DEBUG: shows exactly what backend sends
                console.log(
                    "SHOPSTACK PRODUCTS FROM BACKEND:",
                    response.data
                );

                if (!cancelled) {
                    if (Array.isArray(response.data)) {
                        setProducts(response.data);
                    } else {
                        setProducts([]);
                    }
                }
            } catch (err) {
                console.error(
                    "Customer products loading error:",
                    err
                );

                if (!cancelled) {
                    if (err.response?.status === 403) {
                        setError(
                            "Access denied. Please login as Customer."
                        );
                    } else if (err.response?.status === 401) {
                        setError(
                            "Your session has expired. Please login again."
                        );
                    } else {
                        setError("Unable to load products.");
                    }
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        const timer = setTimeout(() => {
            loadProducts();
        }, 0);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    // =========================================================
    // LOAD ACTIVE COUPONS
    // =========================================================

    useEffect(() => {
        let cancelled = false;

        const loadCoupons = async () => {
            try {
                if (!cancelled) {
                    setCouponLoading(true);
                    setCouponError("");
                }

                const token = localStorage.getItem("token");

                if (!token) {
                    if (!cancelled) {
                        setCoupons([]);
                        setCouponError(
                            "Please login as Customer."
                        );
                        setCouponLoading(false);
                    }
                    return;
                }

                const response = await api.get(
                    "/customer/coupons/active"
                );

                if (!cancelled) {
                    if (Array.isArray(response.data)) {
                        setCoupons(response.data);
                    } else {
                        setCoupons([]);
                    }
                }
            } catch (err) {
                console.error(
                    "Active coupons loading error:",
                    err
                );

                if (!cancelled) {
                    if (err.response?.status === 401) {
                        setCouponError(
                            "Your session has expired."
                        );
                    } else {
                        setCouponError(
                            "Unable to load available offers."
                        );
                    }

                    setCoupons([]);
                }
            } finally {
                if (!cancelled) {
                    setCouponLoading(false);
                }
            }
        };

        const timer = setTimeout(() => {
            loadCoupons();
        }, 0);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, []);

    // =========================================================
    // REFRESH PRODUCTS
    // =========================================================

    const refreshProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            if (!token) {
                setError("Please login as Customer.");
                return;
            }

            const response = await api.get("/customer/products");

            console.log(
                "SHOPSTACK PRODUCTS AFTER REFRESH:",
                response.data
            );

            if (Array.isArray(response.data)) {
                setProducts(response.data);
            } else {
                setProducts([]);
            }
        } catch (err) {
            console.error(
                "Customer products loading error:",
                err
            );

            if (err.response?.status === 403) {
                setError(
                    "Access denied. Please login as Customer."
                );
            } else if (err.response?.status === 401) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else {
                setError("Unable to load products.");
            }
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // CART QUANTITY
    // =========================================================

    const getCartQuantity = (productId) => {
        const item = cart.find(
            (cartItem) => cartItem.id === productId
        );

        return item ? item.cartQuantity : 0;
    };

    // =========================================================
    // ADD TO CART
    // =========================================================

    const addToCart = (product) => {
        const existingItem = cart.find(
            (item) => item.id === product.id
        );

        if (existingItem) {
            if (
                Number(existingItem.cartQuantity) >=
                Number(product.quantity)
            ) {
                alert("Maximum available stock reached.");
                return;
            }

            setCart((previousCart) =>
                previousCart.map((item) =>
                    item.id === product.id
                        ? {
                              ...item,
                              cartQuantity:
                                  Number(item.cartQuantity) + 1,
                          }
                        : item
                )
            );
        } else {
            setCart((previousCart) => [
                ...previousCart,
                {
                    ...product,
                    cartQuantity: 1,
                },
            ]);
        }
    };

    // =========================================================
    // BUY NOW
    // =========================================================

    const buyNow = (product) => {
        const existingItem = cart.find(
            (item) => item.id === product.id
        );

        if (!existingItem) {
            setCart((previousCart) => [
                ...previousCart,
                {
                    ...product,
                    cartQuantity: 1,
                },
            ]);
        }

        if (onOpenCart) {
            setTimeout(() => {
                onOpenCart();
            }, 0);
        }
    };

    // =========================================================
    // DECREASE CART QUANTITY
    // =========================================================

    const decreaseQuantity = (product) => {
        const existingItem = cart.find(
            (item) => item.id === product.id
        );

        if (!existingItem) {
            return;
        }

        if (Number(existingItem.cartQuantity) === 1) {
            setCart((previousCart) =>
                previousCart.filter(
                    (item) => item.id !== product.id
                )
            );
        } else {
            setCart((previousCart) =>
                previousCart.map((item) =>
                    item.id === product.id
                        ? {
                              ...item,
                              cartQuantity:
                                  Number(item.cartQuantity) - 1,
                          }
                        : item
                )
            );
        }
    };

    // =========================================================
    // IMAGE ERROR
    // =========================================================

    const handleImageError = (event) => {
        event.currentTarget.style.display = "none";

        const container =
            event.currentTarget.parentElement;

        if (container) {
            const fallback =
                container.querySelector(
                    ".customer-product-placeholder"
                );

            if (fallback) {
                fallback.style.display = "flex";
            }
        }
    };

    // =========================================================
    // COUPON DISCOUNT
    // =========================================================

    const getCouponDiscountText = (coupon) => {
        if (
            coupon.discountType?.toUpperCase() ===
            "PERCENTAGE"
        ) {
            return `${coupon.discountValue}% OFF`;
        }

        if (
            coupon.discountType?.toUpperCase() ===
            "FIXED"
        ) {
            return `₹${Number(
                coupon.discountValue || 0
            ).toFixed(2)} OFF`;
        }

        return "Special Discount";
    };

    // =========================================================
    // COUPON DATE
    // =========================================================

    const formatCouponDate = (date) => {
        if (!date) {
            return "";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "";
        }

        return parsedDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    // =========================================================
    // ORIGINAL PRICE
    // =========================================================

    const getOriginalPrice = (product) => {
        const backendOriginalPrice = Number(
            product.originalPrice
        );

        // Use backend originalPrice first
        if (
            Number.isFinite(backendOriginalPrice) &&
            backendOriginalPrice > 0
        ) {
            return backendOriginalPrice;
        }

        // Support older field names if they exist
        const fallbackOriginalPrice = Number(
            product.mrp ??
            product.oldPrice ??
            product.compareAtPrice ??
            product.listPrice ??
            product.price ??
            0
        );

        return Number.isFinite(fallbackOriginalPrice)
            ? fallbackOriginalPrice
            : 0;
    };

    // =========================================================
    // SELLING PRICE
    // =========================================================

    const getSellingPrice = (product) => {
        const price = Number(product.price ?? 0);

        return Number.isFinite(price)
            ? price
            : 0;
    };

    // =========================================================
    // DISCOUNT PERCENTAGE
    // =========================================================

    const getDiscountPercentage = (product) => {
        // First use backend discount percentage
        const backendDiscount = Number(
            product.discountPercentage
        );

        if (
            Number.isFinite(backendDiscount) &&
            backendDiscount > 0
        ) {
            return backendDiscount;
        }

        // Support possible alternative field names
        const alternativeDiscount = Number(
            product.discountPercent ??
            product.discount ??
            0
        );

        if (
            Number.isFinite(alternativeDiscount) &&
            alternativeDiscount > 0
        ) {
            return alternativeDiscount;
        }

        // Finally calculate from original and selling price
        const originalPrice =
            getOriginalPrice(product);

        const sellingPrice =
            getSellingPrice(product);

        if (
            originalPrice > sellingPrice &&
            originalPrice > 0
        ) {
            return Number(
                (
                    ((originalPrice - sellingPrice) /
                        originalPrice) *
                    100
                ).toFixed(2)
            );
        }

        return 0;
    };

    // =========================================================
    // SAVE AMOUNT
    // =========================================================

    const getSaveAmount = (product) => {
        const originalPrice =
            getOriginalPrice(product);

        const sellingPrice =
            getSellingPrice(product);

        if (
            originalPrice > sellingPrice &&
            sellingPrice >= 0
        ) {
            return Number(
                (originalPrice - sellingPrice).toFixed(2)
            );
        }

        return 0;
    };

    // =========================================================
    // RATING
    // =========================================================

    const getProductRating = (product) => {
        const rating = Number(
            product.rating ??
            product.averageRating ??
            product.avgRating ??
            0
        );

        return Number.isFinite(rating)
            ? rating
            : 0;
    };

    // =========================================================
    // REVIEW COUNT
    // =========================================================

    const getReviewCount = (product) => {
        const reviews = Number(
            product.reviewCount ??
            product.reviewsCount ??
            product.numberOfReviews ??
            product.totalReviews ??
            0
        );

        return Number.isFinite(reviews)
            ? reviews
            : 0;
    };

    // =========================================================
    // PRODUCT CATEGORIES
    // =========================================================

    const categories = [
        "All",
        ...Array.from(
            new Set(
                products
                    .map(
                        (product) =>
                            product.category
                    )
                    .filter(Boolean)
            )
        ),
    ];

    // =========================================================
    // FILTER PRODUCTS
    // =========================================================

    const filteredProducts =
        products.filter((product) => {
            const price =
                getSellingPrice(product);

            const rating =
                getProductRating(product);

            const categoryMatches =
                selectedCategory === "All" ||
                product.category ===
                    selectedCategory;

            const budgetMatches =
                !maxBudget ||
                price <= Number(maxBudget);

            const ratingMatches =
                !minimumRating ||
                rating >= Number(
                    minimumRating
                );

            return (
                categoryMatches &&
                budgetMatches &&
                ratingMatches
            );
        });

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="customer-products">
                <h2>📦 Products</h2>
                <p>Loading products...</p>
            </div>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <div className="customer-products">
                <h2>📦 Products</h2>

                <p>{error}</p>

                <button
                    type="button"
                    onClick={refreshProducts}
                >
                    Try Again
                </button>
            </div>
        );
    }

    // =========================================================
    // MAIN UI
    // =========================================================

    return (
        <div className="customer-products">

            {/* HEADER */}

            <div className="customer-products-header">

                <div>
                    <h2>📦 Products</h2>

                    <p>
                        Browse products available
                        on ShopStack.
                    </p>
                </div>

                <div className="customer-products-actions">

                    <button
                        type="button"
                        className="refresh-products-button"
                        onClick={refreshProducts}
                    >
                        ↻ Refresh
                    </button>

                    <button
                        type="button"
                        className="open-cart-button"
                        onClick={onOpenCart}
                    >
                        🛒 Cart ({cart.length})
                    </button>

                </div>
            </div>

            {/* FILTER BAR */}

            <div className="customer-product-filters">

                <div className="customer-filter-group">

                    <label>
                        PRODUCT CATEGORY
                    </label>

                    <select
                        value={selectedCategory}
                        onChange={(e) =>
                            setSelectedCategory(
                                e.target.value
                            )
                        }
                    >
                        {categories.map(
                            (category) => (
                                <option
                                    key={category}
                                    value={category}
                                >
                                    {category}
                                </option>
                            )
                        )}
                    </select>

                </div>

                <div className="customer-filter-group">

                    <label>
                        MAX BUDGET PRICE (₹)
                    </label>

                    <input
                        type="number"
                        min="0"
                        placeholder="e.g. 3000"
                        value={maxBudget}
                        onChange={(e) =>
                            setMaxBudget(
                                e.target.value
                            )
                        }
                    />

                </div>

                <div className="customer-filter-group">

                    <label>
                        MINIMUM RATING
                    </label>

                    <select
                        value={minimumRating}
                        onChange={(e) =>
                            setMinimumRating(
                                e.target.value
                            )
                        }
                    >

                        <option value="">
                            Show All Ratings
                        </option>

                        <option value="4">
                            4.0 ⭐ & Above
                        </option>

                        <option value="4.5">
                            4.5 ⭐ & Above
                        </option>

                        <option value="5">
                            5.0 ⭐ Only
                        </option>

                    </select>

                </div>

            </div>

            {/* AVAILABLE COUPONS */}

            {!couponLoading &&
                coupons.length > 0 && (

                    <section className="customer-coupons-section">

                        <div className="customer-coupons-header">

                            <div>
                                <h3>
                                    🎟️ Available Offers
                                </h3>

                                <p>
                                    Save more on your
                                    ShopStack purchase.
                                </p>
                            </div>

                        </div>

                        <div className="customer-coupons-list">

                            {coupons.map((coupon) => (

                                <div
                                    className="customer-coupon-card"
                                    key={coupon.id}
                                >

                                    <div className="coupon-icon">
                                        🎟️
                                    </div>

                                    <div className="coupon-content">

                                        <div className="coupon-top-row">

                                            <span className="coupon-code">
                                                {coupon.code}
                                            </span>

                                            <span className="coupon-discount">
                                                {getCouponDiscountText(
                                                    coupon
                                                )}
                                            </span>

                                        </div>

                                        <p className="coupon-condition">

                                            {coupon.minimumOrderAmount
                                                ? `Minimum order ₹${Number(
                                                      coupon.minimumOrderAmount
                                                  ).toFixed(2)}`
                                                : "No minimum order"}

                                            {coupon.maximumDiscount &&
                                                coupon.discountType?.toUpperCase() ===
                                                    "PERCENTAGE"
                                                ? ` • Maximum discount ₹${Number(
                                                      coupon.maximumDiscount
                                                  ).toFixed(2)}`
                                                : ""}

                                        </p>

                                        <p className="coupon-validity">

                                            🗓️ Valid until{" "}

                                            {formatCouponDate(
                                                coupon.expiryDate
                                            )}

                                        </p>

                                    </div>

                                </div>
                            ))}

                        </div>

                    </section>
                )}

            {/* COUPON ERROR */}

            {!couponLoading &&
                couponError &&
                coupons.length === 0 && (

                    <div className="customer-coupon-error">

                        <span>🎟️</span>

                        <span>
                            {couponError}
                        </span>

                    </div>
                )}

            {/* CATALOG HEADER */}

            {products.length > 0 && (

                <div className="customer-catalog-header">

                    <div>

                        <h2>
                            Browse Catalog
                        </h2>

                        <p>
                            Showing{" "}
                            {
                                filteredProducts.length
                            }{" "}
                            of{" "}
                            {products.length}{" "}
                            products
                        </p>

                    </div>

                </div>
            )}

            {/* NO FILTER RESULTS */}

            {products.length > 0 &&
                filteredProducts.length === 0 && (

                    <div className="empty-products">

                        <div>🔍</div>

                        <h3>
                            No Products Match
                            Your Filters
                        </h3>

                        <p>
                            Try changing your
                            budget or rating
                            filter.
                        </p>

                    </div>
                )}

            {/* PRODUCT GRID */}

            {filteredProducts.length > 0 && (

                <div className="customer-product-grid">

                    {filteredProducts.map(
                        (product) => {

                            const cartQuantity =
                                getCartQuantity(
                                    product.id
                                );

                            const outOfStock =
                                !product.quantity ||
                                Number(
                                    product.quantity
                                ) <= 0;

                            const sellingPrice =
                                getSellingPrice(
                                    product
                                );

                            const originalPrice =
                                getOriginalPrice(
                                    product
                                );

                            const discountPercentage =
                                getDiscountPercentage(
                                    product
                                );

                            const saveAmount =
                                getSaveAmount(
                                    product
                                );

                            const rating =
                                getProductRating(
                                    product
                                );

                            const reviewCount =
                                getReviewCount(
                                    product
                                );

                            return (

                                <div
                                    className="customer-product-card"
                                    key={product.id}
                                >

                                    {/* PRODUCT IMAGE */}

                                    <div className="customer-product-image-container">

                                        <div
                                            className="customer-product-placeholder"
                                            style={{
                                                display:
                                                    product.imageUrl
                                                        ? "none"
                                                        : "flex",
                                            }}
                                        >
                                            📦
                                        </div>

                                        {product.imageUrl && (

                                            <img
                                                src={
                                                    product.imageUrl
                                                }
                                                alt={
                                                    product.name ||
                                                    "Product image"
                                                }
                                                className="customer-product-image"
                                                onError={
                                                    handleImageError
                                                }
                                            />

                                        )}

                                    </div>

                                    {/* PRODUCT INFORMATION */}

                                    <div className="customer-product-info">

                                        <span className="customer-product-category">
                                            {product.category ||
                                                "General"}
                                        </span>

                                        <h3>
                                            {product.name}
                                        </h3>

                                        <p className="customer-product-brand">
                                            {product.brand ||
                                                "ShopStack"}
                                        </p>

                                        {/* RATING */}

                                        <div className="customer-product-rating">

                                            <span>
                                                ⭐
                                            </span>

                                            <strong>
                                                {rating.toFixed(
                                                    1
                                                )}
                                            </strong>

                                            <span className="customer-product-review-count">
                                                (
                                                {
                                                    reviewCount
                                                }{" "}
                                                reviews)
                                            </span>

                                        </div>

                                        <p className="customer-product-description">
                                            {product.description ||
                                                "No description available."}
                                        </p>

                                        {/* PRICE + DISCOUNT */}

                                        <div className="customer-product-price-section">

                                            {/* SELLING PRICE */}

                                            <div className="customer-product-current-price">
                                                ₹
                                                {sellingPrice.toLocaleString(
                                                    "en-IN",
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}
                                            </div>

                                            {/* ORIGINAL PRICE */}

                                            {originalPrice >
                                                sellingPrice && (

                                                <div className="customer-product-original-price">

                                                    ₹
                                                    {originalPrice.toLocaleString(
                                                        "en-IN",
                                                        {
                                                            minimumFractionDigits: 2,
                                                            maximumFractionDigits: 2,
                                                        }
                                                    )}

                                                </div>
                                            )}

                                            {/* DISCOUNT */}

                                            {discountPercentage >
                                                0 && (

                                                <span className="customer-product-inline-discount">

                                                    {discountPercentage}
                                                    % OFF

                                                </span>
                                            )}

                                        </div>

                                        {/* SAVE AMOUNT */}

                                        {saveAmount > 0 && (

                                            <div className="customer-product-save">

                                                ✓ Save ₹
                                                {saveAmount.toLocaleString(
                                                    "en-IN",
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}

                                            </div>
                                        )}

                                        {/* STOCK */}

                                        <div className="customer-product-stock">

                                            {outOfStock ? (

                                                <span className="out-of-stock">
                                                    OUT OF STOCK
                                                </span>

                                            ) : (

                                                <span className="in-stock">
                                                    ✓ IN STOCK
                                                </span>

                                            )}

                                        </div>

                                        {/* CART BUTTONS */}

                                        {cartQuantity === 0 ? (

                                            <div className="product-action-buttons">

                                                <button
                                                    type="button"
                                                    className="add-to-cart-button"
                                                    onClick={() =>
                                                        addToCart(
                                                            product
                                                        )
                                                    }
                                                    disabled={
                                                        outOfStock
                                                    }
                                                >
                                                    {outOfStock
                                                        ? "Out of Stock"
                                                        : "🛒 Add to Cart"}
                                                </button>

                                                <button
                                                    type="button"
                                                    className="buy-now-button"
                                                    onClick={() =>
                                                        buyNow(
                                                            product
                                                        )
                                                    }
                                                    disabled={
                                                        outOfStock
                                                    }
                                                >
                                                    ⚡ Buy Now
                                                </button>

                                            </div>

                                        ) : (

                                            <div className="product-cart-controls">

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        decreaseQuantity(
                                                            product
                                                        )
                                                    }
                                                >
                                                    −
                                                </button>

                                                <span>
                                                    {
                                                        cartQuantity
                                                    }
                                                </span>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        addToCart(
                                                            product
                                                        )
                                                    }
                                                    disabled={
                                                        Number(
                                                            cartQuantity
                                                        ) >=
                                                        Number(
                                                            product.quantity
                                                        )
                                                    }
                                                >
                                                    +
                                                </button>

                                            </div>
                                        )}

                                    </div>

                                </div>
                            );
                        }
                    )}

                </div>
            )}

            {/* NO PRODUCTS */}

            {products.length === 0 && (

                <div className="empty-products">

                    <div>📦</div>

                    <h3>
                        No Products Available
                    </h3>

                    <p>
                        There are currently no
                        products available.
                    </p>

                </div>
            )}

        </div>
    );
}

export default CustomerProductManagement;