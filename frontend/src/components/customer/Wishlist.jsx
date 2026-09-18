import { useEffect, useState } from "react";
import { FaArrowLeft, FaHeart, FaRegHeart, FaShoppingBag, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import CustomerSidebar from "./CustomerSidebar";
import "./Wishlist.css";
import { readCustomerStorage, writeCustomerStorage } from "../../utils/customerStorage";

function Wishlist() {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState(() => readCustomerStorage("shopstack-wishlist", []));

    useEffect(() => {
        const updateWishlist = () => setWishlist(readCustomerStorage("shopstack-wishlist", []));
        window.addEventListener("wishlistUpdated", updateWishlist);
        return () => window.removeEventListener("wishlistUpdated", updateWishlist);
    }, []);

    function removeFromWishlist(id) {
        const updated = wishlist.filter(product => product.id !== id);
        writeCustomerStorage("shopstack-wishlist", updated);
        setWishlist(updated);
        window.dispatchEvent(new Event("wishlistUpdated"));
    }

    return (
        <div className="customer-wishlist-layout">
            <CustomerSidebar />
            <main className="wishlist-page">
                <div className="wishlist-header">
                    <div><p>YOUR SAVED PRODUCTS</p><h1>My Wishlist</h1><span>{wishlist.length} saved {wishlist.length === 1 ? "product" : "products"}</span></div>
                    <button onClick={() => navigate("/customer/products")}><FaArrowLeft /> Browse Products</button>
                </div>
                {wishlist.length === 0 ? (
                    <div className="empty-wishlist"><FaHeart /><h2>Your wishlist is empty</h2><p>Tap the heart on a product to save it here.</p><button onClick={() => navigate("/customer/products")}>Discover Products</button></div>
                ) : (
                    <div className="wishlist-grid">
                        {wishlist.map(product => (
                            <article className="wishlist-card" key={product.id}>
                                <div className="wishlist-image">
                                {product.imageUrl ? <img src={product.imageUrl} alt={product.name} onError={(event) => { event.currentTarget.style.display = "none"; }} /> : <FaShoppingBag />}
                                    <button onClick={() => removeFromWishlist(product.id)} aria-label={`Remove ${product.name}`}><FaTrash /></button>
                                </div>
                                <div className="wishlist-card-content">
                                    <span>{product.category}</span><h2>{product.name}</h2><p>{product.description}</p>
                                    <div className="wishlist-card-footer"><div><strong>₹{Number(product.price).toLocaleString("en-IN")}</strong><small className={Number(product.stock || 0) > 0 ? "wishlist-stock-available" : "wishlist-stock-unavailable"}>{Number(product.stock || 0) > 0 ? `${product.stock} available` : "Unavailable"}</small></div><button onClick={() => navigate("/customer/products")}><FaRegHeart /> View Product</button></div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Wishlist;
