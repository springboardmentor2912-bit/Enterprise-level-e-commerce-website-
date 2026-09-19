import { useEffect, useState } from "react";
import CustomerNavbar from "./CustomerNavbar";
import api from "../../services/api";
import "./Customer.css";

function CustomerHome() {

    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState("");

    const [filters, setFilters] = useState({
        minPrice: "",
        maxPrice: "",
        category: "",
        brand: "",
        minStock: "",
        rating: ""
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get("/products/available");
            setProducts(response.data);
        } catch (error) {
            console.log("Error fetching products:", error);
        }
    };


    const addToCart = (product) => {

    const existingCart =
        JSON.parse(localStorage.getItem("cart")) || [];

    const existingItem =
        existingCart.find(
            item => item.id === product.id
        );

    let updatedCart;

    if (existingItem) {

        updatedCart = existingCart.map(item =>
            item.id === product.id
                ? {
                    ...item,
                    cartQuantity:
                        item.cartQuantity + 1
                }
                : item
        );

    } else {

        updatedCart = [
            ...existingCart,
            {
                ...product,
                cartQuantity: 1
            }
        ];
    }

    localStorage.setItem(
        "cart",
        JSON.stringify(updatedCart)
    );

    alert("Product added to cart");
};

    const addToWishlist = (product) => {

    const existingWishlist =
        JSON.parse(localStorage.getItem("wishlist")) || [];

    const alreadyExists = existingWishlist.some(
        item => item.id === product.id
    );

    if (alreadyExists) {
        return;
    }

    const updatedWishlist = [
        ...existingWishlist,
        product
    ];

    localStorage.setItem(
        "wishlist",
        JSON.stringify(updatedWishlist)
    );

    alert("Product added to wishlist");
};



    const handleFilterChange = (e) => {
        const { name, value } = e.target;

        setFilters({
            ...filters,
            [name]: value
        });
    };

    const clearFilters = () => {
        setFilters({
            minPrice: "",
            maxPrice: "",
            category: "",
            brand: "",
            minStock: "",
            rating: ""
        });
    };

    const filteredProducts = products.filter((product) => {

        const matchesSearch =
            product.productName
                ?.toLowerCase()
                .includes(search.toLowerCase());

        const matchesMinPrice =
            filters.minPrice === "" ||
            Number(product.price) >= Number(filters.minPrice);

        const matchesMaxPrice =
            filters.maxPrice === "" ||
            Number(product.price) <= Number(filters.maxPrice);

        const matchesCategory =
            filters.category === "" ||
            product.category === filters.category;

        const matchesBrand =
            filters.brand === "" ||
            product.brand === filters.brand;

        const matchesStock =
            filters.minStock === "" ||
            Number(product.stockQuantity) >= Number(filters.minStock);

        return (
            product.status === "APPROVED" &&
            matchesSearch &&
            matchesMinPrice &&
            matchesMaxPrice &&
            matchesCategory &&
            matchesBrand &&
            matchesStock
        );
    });

    const categories = [
        ...new Set(products.map(product => product.category).filter(Boolean))
    ];

    const brands = [
        ...new Set(products.map(product => product.brand).filter(Boolean))
    ];

    return (
        <>
            <CustomerNavbar />

            <div className="customer-home">

                <br>
                </br>

                {/* <h1>Shop Products</h1> */}

                <div className="customer-shop-layout">

                    {/* FILTER SIDEBAR */}

                    <aside className="customer-filter-sidebar">

                        <div className="filter-header">
                            <h2>Filters</h2>

                            <button
                                className="clear-filter-btn"
                                onClick={clearFilters}
                            >
                                Clear All
                            </button>
                        </div>


                        {/* BUDGET */}

                        <div className="filter-section">

                            <h3>Budget</h3>

                            <div className="price-inputs">

                                <input
                                    type="number"
                                    name="minPrice"
                                    placeholder="Min ₹"
                                    value={filters.minPrice}
                                    onChange={handleFilterChange}
                                />

                                <input
                                    type="number"
                                    name="maxPrice"
                                    placeholder="Max ₹"
                                    value={filters.maxPrice}
                                    onChange={handleFilterChange}
                                />

                            </div>

                            <div className="price-options">

                                <label>
                                    <input
                                        type="radio"
                                        name="budget"
                                        onChange={() =>
                                            setFilters({
                                                ...filters,
                                                minPrice: "",
                                                maxPrice: "500"
                                            })
                                        }
                                    />
                                    Under ₹500
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        name="budget"
                                        onChange={() =>
                                            setFilters({
                                                ...filters,
                                                minPrice: "500",
                                                maxPrice: "1000"
                                            })
                                        }
                                    />
                                    ₹500 - ₹1,000
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        name="budget"
                                        onChange={() =>
                                            setFilters({
                                                ...filters,
                                                minPrice: "1000",
                                                maxPrice: "5000"
                                            })
                                        }
                                    />
                                    ₹1,000 - ₹5,000
                                </label>

                                <label>
                                    <input
                                        type="radio"
                                        name="budget"
                                        onChange={() =>
                                            setFilters({
                                                ...filters,
                                                minPrice: "5000",
                                                maxPrice: ""
                                            })
                                        }
                                    />
                                    Above ₹5,000
                                </label>

                            </div>

                        </div>


                        {/* CATEGORY */}

                        <div className="filter-section">

                            <h3>Category</h3>

                            <select
                                name="category"
                                value={filters.category}
                                onChange={handleFilterChange}
                            >

                                <option value="">
                                    All Categories
                                </option>

                                {categories.map((category, index) => (
                                    <option key={index} value={category}>
                                        {category}
                                    </option>
                                ))}

                            </select>

                        </div>


                        {/* BRAND */}

                        <div className="filter-section">

                            <h3>Brand</h3>

                            <select
                                name="brand"
                                value={filters.brand}
                                onChange={handleFilterChange}
                            >

                                <option value="">
                                    All Brands
                                </option>

                                {brands.map((brand, index) => (
                                    <option key={index} value={brand}>
                                        {brand}
                                    </option>
                                ))}

                            </select>

                        </div>


                        {/* STOCK */}

                        <div className="filter-section">

                            <h3>Availability</h3>

                            <label className="filter-checkbox">
                                <input
                                    type="radio"
                                    name="stock"
                                    onChange={() =>
                                        setFilters({
                                            ...filters,
                                            minStock: "1"
                                        })
                                    }
                                />

                                In Stock
                            </label>

                        </div>


                        {/* QUANTITY */}

                        <div className="filter-section">

                            <h3>Quantity Available</h3>

                            <select
                                name="minStock"
                                value={filters.minStock}
                                onChange={handleFilterChange}
                            >

                                <option value="">
                                    Any Quantity
                                </option>

                                <option value="5">
                                    5+ available
                                </option>

                                <option value="10">
                                    10+ available
                                </option>

                                <option value="20">
                                    20+ available
                                </option>

                                <option value="50">
                                    50+ available
                                </option>

                            </select>

                        </div>


                        {/* RATING */}

                        <div className="filter-section">

                            <h3>Customer Rating</h3>

                            <label className="filter-checkbox">
                                <input
                                    type="radio"
                                    name="rating"
                                    value="4"
                                    onChange={handleFilterChange}
                                />
                                ★★★★ & above
                            </label>

                            <label className="filter-checkbox">
                                <input
                                    type="radio"
                                    name="rating"
                                    value="3"
                                    onChange={handleFilterChange}
                                />
                                ★★★ & above
                            </label>

                        </div>

                    </aside>


                    {/* PRODUCTS AREA */}

                    <main className="customer-products-area">

                        <div className="customer-search-row">

                            <input
                                type="text"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(e.target.value)
                                }
                            />

                            <span>
                                {filteredProducts.length} products
                            </span>

                        </div>


                        <div className="customer-product-grid">

                            {filteredProducts.map((product) => (

                                <div
                                    className="customer-product-card"
                                    key={product.id}
                                >

                                    <img
                                        src={product.imageUrl}
                                        alt={product.productName}
                                    />

                                    <h3>
                                        {product.productName}
                                    </h3>

                                    <p>
                                        Brand: {product.brand}
                                    </p>

                                    <p>
                                        Category: {product.category}
                                    </p>

                                    <div className="customer-product-price">

    {Number(product.discountPercentage || 0) > 0 ? (
        <div className="price-row">

            {/* Original Price */}
            <span className="original-price">
                ₹{Number(product.price).toLocaleString("en-IN")}
            </span>

            {/* Discounted Price */}
            <strong className="discounted-price">
                ₹{Number(product.discountedPrice).toLocaleString("en-IN")}
            </strong>

            {/* Discount */}
            <span className="discount-badge">
                {Number(product.discountPercentage)}% OFF
            </span>

        </div>
    ) : (
        <strong className="discounted-price">
            ₹{Number(product.price).toLocaleString("en-IN")}
        </strong>
    )}

</div>

                                    <p>
                                        Stock: {product.stockQuantity}
                                    </p>

                                    
                            <div className="product-card-actions">

                                <button
                                    className="wishlist-icon-btn"
                                    onClick={() => addToWishlist(product)}
                                    title="Add to Wishlist"
                                    aria-label="Add to Wishlist"
                                >
                                    ♡
                                </button>

                                <button
                                    className="buy-now-btn"
                                    onClick={() => {
                                        addToCart(product);
                                    }}
                                >
                                    Buy Now
                                </button>

                                <button
                                    className="add-to-cart-btn"
                                    onClick={() => addToCart(product)}
                                >
                                    Add to Cart
                                </button>

                            </div>

                                </div>

                            ))}

                        </div>

                    </main>

                </div>

            </div>
        </>
    );
}

export default CustomerHome;