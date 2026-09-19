import VendorNavbar from "../../components/VendorNavbar";
import "./VendorDashboard.css";
import { useNavigate } from "react-router-dom";

function VendorDashboard() {

    const vendorName = localStorage.getItem("userName") || "Vendor";
    const navigate = useNavigate();

    return (

        <div>

            <VendorNavbar />

            <div className="vendor-dashboard">

                <h1>
                    Welcome, {vendorName}
                </h1>

                <p className="subtitle">
                    Manage your products and grow your business with ShopStack.
                </p>

                <div className="empty-products">

                    <div className="plus-icon">
                        +
                    </div>

                    <h2>No Products Added Yet</h2>

                    <p>
                        Start selling by adding your first product.
                    </p>

                    <button onClick={() => navigate("/vendor/add-product")}>
                        Add Product
                    </button>

                </div>

            </div>

        </div>

    );

}

export default VendorDashboard;