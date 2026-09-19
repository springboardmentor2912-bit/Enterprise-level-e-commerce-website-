import { Link } from "react-router-dom";
import "./VendorNavbar.css";

function VendorNavbar() {

    return (
        <nav className="vendor-navbar">

            <div className="vendor-logo">
                ShopStack
            </div>

            <ul className="vendor-nav-links">

                <li>
                    <Link to="/vendor/dashboard">
                        Dashboard
                    </Link>
                </li>

                <li>
                    <Link to="/vendor/add-product">
                        Add Product
                    </Link>
                </li>

                <li>
                    <Link to="/vendor/products">
                        My Products
                    </Link>
                </li>

                <li>
                    <Link to="/vendor/inventory">
                        Inventory
                    </Link>
                </li>

                <li>
                    <Link to="/vendor/profile">
                        Profile
                    </Link>
                </li>

                <li>
                    <Link to="/">
                        Logout
                    </Link>
                </li>

            </ul>

        </nav>
    );
}

export default VendorNavbar;