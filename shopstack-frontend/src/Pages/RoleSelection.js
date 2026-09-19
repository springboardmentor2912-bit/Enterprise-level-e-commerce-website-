import { useNavigate, Link } from "react-router-dom";
import "./Auth.css";

function RoleSelection() {

    const navigate = useNavigate();

    return (
        <div className="auth-page">

            <div className="role-container">

                <h2>Welcome to ShopStack</h2>

                <p>Select your account type</p>


                <button 
                    onClick={() => navigate("/login")}
                >
                    Customer
                </button>


                <button 
                    onClick={() => navigate("/vendor/login")}
                >
                    Vendor
                </button>


               <p className="admin-text">
                    Are you an administrator?{" "}
                    <Link to="/admin/login" className="admin-login-link">
                        Admin Login
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default RoleSelection;