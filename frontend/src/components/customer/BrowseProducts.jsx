import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    FaShoppingBag,
    FaHeart,
    FaRegHeart,
    FaSearch,
    FaBolt,
    FaShoppingCart,
    FaStore
} from "react-icons/fa";

import "./BrowseProducts.css";
import { readCustomerStorage, writeCustomerStorage } from "../../utils/customerStorage";

function salePrice(product) {
    return Number(product.salePrice ?? (Number(product.price) * (1 - Number(product.discountPercentage || 0) / 100)));
}

function discountPercent(product) {
    const original = Number(product.price || 0);
    const discounted = salePrice(product);
    return original > discounted ? Math.round((1 - discounted / original) * 100) : 0;
}

const fallbackImages = {
    laptop: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900",
    phone: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=900",
    headphones: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=900",
    audio: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=900",
    accessories: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=900",
    tablet: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=900",
    default: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=900",
};

function fallbackImage(product) {
    const category = String(product.category || "").toLowerCase();
    return fallbackImages[category] || (category.includes("laptop") ? fallbackImages.laptop : fallbackImages.default);
}

function BrowseProducts() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [wishlist, setWishlist] = useState(() =>
        readCustomerStorage("shopstack-wishlist", []).map(item => item.id)
    );
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [category, setCategory] = useState(searchParams.get("category") || "All");
    const [selectedProduct, setSelectedProduct] = useState(null);
    const inStockOnly = searchParams.get("inStock") === "true";

    useEffect(() => {
        fetchProducts();
        window.addEventListener("productsUpdated", fetchProducts);
        return () => window.removeEventListener("productsUpdated", fetchProducts);
    }, []);

    async function fetchProducts() {

        try {

            const response = await fetch(
                "https://shopstack-backend-gjv6.onrender.com/api/products"
            );

            if (response.ok) {

                const data = await response.json();

                setProducts(data);

            }

        } catch (err) {

            console.log(err);

        }

    }

    function toggleWishlist(id) {

        const savedWishlist = readCustomerStorage("shopstack-wishlist", []);
        const alreadySaved = savedWishlist.some(item => item.id === id);
        const product = products.find(item => item.id === id);
        const updatedWishlist = alreadySaved
            ? savedWishlist.filter(item => item.id !== id)
            : [...savedWishlist, product];

        writeCustomerStorage("shopstack-wishlist", updatedWishlist);
        window.dispatchEvent(new Event("wishlistUpdated"));

        if (alreadySaved) {

            setWishlist(wishlist.filter(item => item !== id));

        } else {

            setWishlist([...wishlist, id]);

        }

    }

    async function reserveProduct(product, quantity = 1) {
        const latestResponse = await fetch("https://shopstack-backend-gjv6.onrender.com/api/products");
        if (latestResponse.ok) {
            const latestProducts = await latestResponse.json();
            product = latestProducts.find(item => item.id === product.id) || product;
        }

        if (Number(product.stock || 0) < quantity) {
            throw new Error(`${product.name} has only ${product.stock || 0} item(s) available`);
        }

        const response = await fetch("https://shopstack-backend-gjv6.onrender.com/api/products/reserve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([{ productId: product.id, quantity }])
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `Stock update failed (${response.status}). Restart the backend and try again.`);
        }
    }

    async function addToCart(product) {

        const availableStock = Number(product.stock || 0);
        const savedCart = readCustomerStorage("shopstack-cart", []);
        const existingProduct = savedCart.find(item => item.id === product.id);

        if (availableStock < 1) {
            alert("This product is currently unavailable");
            return;
        }

        try {
            await reserveProduct(product);
        } catch (error) {
            alert(error.message);
            fetchProducts();
            return;
        }

        const updatedCart = existingProduct
            ? savedCart.map(item => item.id === product.id
                ? { ...item, quantity: item.quantity + 1, stock: Math.max(0, Number(item.stock ?? availableStock) - 1) }
                : item
            )
            : [...savedCart, { ...product, price: salePrice(product), originalPrice: Number(product.price), quantity: 1, stock: Math.max(0, availableStock - 1) }];

        writeCustomerStorage("shopstack-cart", updatedCart);
        window.dispatchEvent(new Event("cartUpdated"));
        setProducts(items => items.map(item => item.id === product.id ? { ...item, stock: Number(item.stock) - 1 } : item));
        window.dispatchEvent(new Event("productsUpdated"));
        alert(`${product.name} added to cart`);

    }

    async function buyNow(product) {
        try {
            const savedCart = readCustomerStorage("shopstack-cart", []);

            // Buy Now means this product alone. Release reservations held by
            // the previous cart before reserving the selected product.
            if (savedCart.length > 0) {
                const releaseResponse = await fetch("https://shopstack-backend-gjv6.onrender.com/api/products/release", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(savedCart.map(item => ({ productId: item.id, quantity: item.quantity })))
                });
                if (!releaseResponse.ok) throw new Error("Unable to reset the current cart");
            }

            const latestResponse = await fetch("https://shopstack-backend-gjv6.onrender.com/api/products");
            const latestProducts = latestResponse.ok ? await latestResponse.json() : [];
            const latestProduct = latestProducts.find(item => item.id === product.id) || product;
            if (Number(latestProduct.stock || 0) < 1) throw new Error("This product is currently unavailable");

            await reserveProduct(latestProduct);
            const remainingStock = Number(latestProduct.stock) - 1;
            const updatedCart = [{
                ...latestProduct,
                price: salePrice(latestProduct),
                originalPrice: Number(latestProduct.price),
                quantity: 1,
                stock: Math.max(0, remainingStock)
            }];

            writeCustomerStorage("shopstack-cart", updatedCart);
            window.dispatchEvent(new Event("cartUpdated"));
            window.dispatchEvent(new Event("productsUpdated"));
            navigate("/customer/checkout");
        } catch (error) {
            alert(error.message);
            fetchProducts();
        }
    }

    const categories = useMemo(() => {

        const list = products.map(p => p.category);

        return ["All", ...new Set(list)];

    }, [products]);

    const filteredProducts = products.filter(product => {

        const matchSearch =
            product.name.toLowerCase().includes(search.toLowerCase());

        const matchCategory = category === "All"
            || (category.toLowerCase() === "laptop"
                ? product.category?.toLowerCase().includes("laptop")
                : product.category === category);

        const matchStock = !inStockOnly || Number(product.stock || 0) > 0;

        return matchSearch && matchCategory && matchStock;

    });

    return (

        <div className="browse-page">

            <section className="browse-header">

                <div>

                    <h1>Discover Amazing Products</h1>

                    <p>
                        Shop premium quality products from trusted vendors.
                    </p>

                </div>

            </section>

            <div className="top-toolbar">

                <div className="search-box">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>

                <div className="select-wrapper">

                    <FaStore className="select-icon" />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >

                        {categories.map(cat => (

                            <option key={cat}>
                                {cat}
                            </option>

                        ))}

                    </select>

                </div>

            </div>

            <div className="results-row">

                <h3>

                    {filteredProducts.length} Products Found

                </h3>

            </div>

            <div className="browse-grid">

                {filteredProducts.length === 0 ? (

                    <div className="empty-box">

                        <FaShoppingBag size={70} />

                        <h2>No Products Found</h2>

                        <p>
                            Try changing your search or category.
                        </p>

                    </div>

                ) : (

                    filteredProducts.map(product => (

                        <div
                            className="browse-card"
                            key={product.id}
                            onClick={() => setSelectedProduct(product)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedProduct(product); }}
                        >

                            {discountPercent(product) > 0 && <span className="discount-badge">{discountPercent(product)}% OFF</span>}

                            {

                                product.imageUrl &&
                                    product.imageUrl.trim() !== ""

                                    ?

                                    <div className="browse-card-image">
                                        <img
                                            className="browse-card-product-image"
                                            src={product.imageUrl}
                                            alt={product.name}
                                            onError={(event) => {
                                                event.currentTarget.onerror = null;
                                                event.currentTarget.style.display = "none";
                                            }}
                                        />
                                    </div>

                                    :

                                    <div className="browse-card-image image-unavailable" />

                            }


                            <div className="browse-content">

                                <div className="title-row">

                                    <div className="title-left">

                                        <h2>

                                            {product.name}

                                        </h2>

                                    </div>

                                    <button

                                        className="wishlist-btn"

                                        onClick={(event) => { event.stopPropagation(); toggleWishlist(product.id); }}

                                        aria-label="Toggle wishlist"

                                    >

                                        {wishlist.includes(product.id) ? <FaHeart /> : <FaRegHeart />}

                                    </button>

                                </div>

                                <p className="description">

                                    {product.description}

                                </p>

                                <div className="pricing-block">
                                    <span className="pricing-label">Selling price</span>
                                    <div className="price-row">

                                    <span className="price">

                                        ₹{salePrice(product).toLocaleString()}

                                    </span>
                                    {discountPercent(product) > 0 && <del>₹{Number(product.price).toLocaleString()}</del>}

                                    </div>
                                </div>

                                <div className="button-group">

                                    <button
                                        className="cart-btn"
                                        onClick={(event) => { event.stopPropagation(); addToCart(product); }}
                                        disabled={Number(product.stock || 0) < 1}
                                    >

                                        <FaShoppingCart />

                                        Add To Cart

                                    </button>

                                    <button className="buy-btn" onClick={(event) => { event.stopPropagation(); buyNow(product); }} disabled={Number(product.stock || 0) < 1}>

                                        <FaBolt />

                                        Buy Now

                                    </button>

                                </div>

                            </div>

                        </div>

                    ))

                )}

            </div>

            {selectedProduct && (
                <div className="customer-product-detail-overlay" onClick={() => setSelectedProduct(null)}>
                    <section className="customer-product-detail-modal" role="dialog" aria-modal="true" aria-label="Product details" onClick={(event) => event.stopPropagation()}>
                        <button className="customer-detail-close" type="button" onClick={() => setSelectedProduct(null)} aria-label="Close product details">×</button>
                        <div className="customer-detail-image">{selectedProduct.imageUrl ? <img src={selectedProduct.imageUrl} alt={selectedProduct.name} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <div className="customer-image-unavailable">Image unavailable</div>}</div>
                        <div className="customer-detail-content">
                            <span className="customer-detail-category">{selectedProduct.category || "Product"}</span>
                            <h2>{selectedProduct.name}</h2>
                            <p>{selectedProduct.description || "No product description available."}</p>
                            <div className="customer-detail-price"><strong>₹{salePrice(selectedProduct).toLocaleString()}</strong>{discountPercent(selectedProduct) > 0 && <><del>₹{Number(selectedProduct.price).toLocaleString()}</del><span>{discountPercent(selectedProduct)}% OFF</span></>}</div>
                            <div className="customer-detail-stock">{Number(selectedProduct.stock || 0) > 0 ? `${selectedProduct.stock} available` : "Currently unavailable"}</div>
                            <div className="customer-detail-actions"><button className="cart-btn" onClick={() => { setSelectedProduct(null); addToCart(selectedProduct); }} disabled={Number(selectedProduct.stock || 0) < 1}><FaShoppingCart /> Add To Cart</button><button className="buy-btn" onClick={() => { setSelectedProduct(null); buyNow(selectedProduct); }} disabled={Number(selectedProduct.stock || 0) < 1}><FaBolt /> Buy Now</button></div>
                        </div>
                    </section>
                </div>
            )}

        </div>

    );

}

export default BrowseProducts;
