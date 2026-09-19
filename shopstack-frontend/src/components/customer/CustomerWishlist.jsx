import { useEffect, useState } from "react";
import CustomerNavbar from "./CustomerNavbar";
import "./Customer.css";

function CustomerWishlist() {

    const [wishlist, setWishlist] = useState([]);

    useEffect(() => {
        loadWishlist();
    }, []);

    const loadWishlist = () => {
        const savedWishlist =
            JSON.parse(localStorage.getItem("wishlist")) || [];

        setWishlist(savedWishlist);
    };

    const removeFromWishlist = (id) => {

        const updatedWishlist = wishlist.filter(
            item => item.id !== id
        );

        setWishlist(updatedWishlist);

        localStorage.setItem(
            "wishlist",
            JSON.stringify(updatedWishlist)
        );
    };

    const addToCart = (product) => {

        const existingCart =
            JSON.parse(localStorage.getItem("cart")) || [];

        const existingItem = existingCart.find(
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

        removeFromWishlist(product.id);
    };

    return (
        <>
            <CustomerNavbar />

            <div className="customer-wishlist-page">

                <div className="customer-wishlist-header">

                    <div>
                        <h1>My Wishlist</h1>

                        <p>
                            Save your favorite products for later
                        </p>
                    </div>

                    <span>
                        {wishlist.length} items
                    </span>

                </div>


                {wishlist.length === 0 ? (

                    <div className="customer-empty-wishlist">

                        <div className="wishlist-empty-icon">
                            ♡
                        </div>

                        <h2>
                            Your wishlist is empty
                        </h2>

                        <p>
                            Products you save will appear here.
                        </p>

                    </div>

                ) : (

                    <div className="customer-wishlist-grid">

                        {wishlist.map(product => (

                            <div
                                className="customer-wishlist-card"
                                key={product.id}
                            >

                                <div className="wishlist-image-container">

                                    <img
                                        src={product.imageUrl}
                                        alt={product.productName}
                                    />

                                </div>


                                <div className="wishlist-product-details">

                                    <h3>
                                        {product.productName}
                                    </h3>

                                    <p>
                                        Brand: {product.brand}
                                    </p>

                                    <p>
                                        Category: {product.category}
                                    </p>

                                    <div className="wishlist-price">
                                        ₹{product.price}
                                    </div>

                                    <p className="wishlist-stock">
                                        {Number(product.stockQuantity) > 0
                                            ? "In Stock"
                                            : "Out of Stock"}
                                    </p>

                                </div>


                                <div className="wishlist-actions">

                                    <button
                                        className="wishlist-cart-btn"
                                        onClick={() =>
                                            addToCart(product)
                                        }
                                        disabled={
                                            Number(product.stockQuantity) <= 0
                                        }
                                    >
                                        Add to Cart
                                    </button>

                                    <button
                                        className="wishlist-remove-btn"
                                        onClick={() =>
                                            removeFromWishlist(product.id)
                                        }
                                    >
                                        Remove
                                    </button>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>
        </>
    );
}

export default CustomerWishlist;