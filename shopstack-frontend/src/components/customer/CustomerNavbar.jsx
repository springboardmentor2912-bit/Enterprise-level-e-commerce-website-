import { Link, useNavigate } from "react-router-dom";

function CustomerNavbar() {

    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("userId");
        localStorage.removeItem("role");
        navigate("/");
    };

    return (
        <nav className="customer-navbar">

            <h2>ShopStack</h2>

            <div>
                <Link to="/customer/home">Home</Link>
                <Link to="/customer/wishlist">Wishlist</Link>
                <Link to="/customer/cart">Cart</Link>
                <Link to="/customer/profile">Profile</Link>

                <button onClick={logout}>
                    Logout
                </button>
            </div>

        </nav>
    );
}

export default CustomerNavbar;