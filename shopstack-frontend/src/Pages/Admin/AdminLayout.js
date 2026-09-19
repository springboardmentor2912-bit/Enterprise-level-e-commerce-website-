import { useNavigate } from "react-router-dom";
import "./AdminLayout.css";

function AdminLayout({ children }) {

    const navigate = useNavigate();

    const handleLogout = () => {

        localStorage.removeItem("user");
        localStorage.removeItem("userId");
        localStorage.removeItem("role");

        navigate("/");
    };

    return (
        <div className="admin-layout">

            <aside className="admin-sidebar">

                <h2>ShopStack</h2>

                <p className="admin-title">
                    Administrator
                </p>

                <nav>

                    <button onClick={() => navigate("/admin/dashboard")}>
                        Dashboard
                    </button>

                    <button onClick={() => navigate("/admin/vendors")}>
                        Vendor Management
                    </button>

                    <button onClick={() => navigate("/admin/analytics")}>
                        Marketplace Analytics
                    </button>

                    <button  onClick={() => navigate("/admin/orders")}>
                        Order Monitoring
                    </button>

                    <button onClick={() => navigate("/admin/commissions")}>
                        Commission Management
                    </button>

                    <button onClick={() => navigate("/admin/system-monitoring")}>
                        System Monitoring
                    </button>

                    <button onClick={() => navigate("/admin/reports")}>
                        Business Reports
                    </button>

                    <button onClick={() => navigate("/admin/warehouses")}>
                        Warehouse Management
                    </button>

                    <button onClick={() => navigate("/admin/shipments")}>
                        Shipping & Tracking
                    </button>
                    {/* <button onClick={() => navigate("/admin/commissions")}>
                        Commission Management
                    </button> */}

                </nav>

                <button
                    className="logout-button"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </aside>

            <main className="admin-layout-content">
                {children}
            </main>

        </div>
    );
}

export default AdminLayout;