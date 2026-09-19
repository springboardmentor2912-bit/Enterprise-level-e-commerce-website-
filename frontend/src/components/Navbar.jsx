import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const role = localStorage.getItem("role");

    const [unreadCount, setUnreadCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

    // ==========================================
    // FETCH UNREAD NOTIFICATION COUNT
    // ==========================================

    const fetchUnreadCount = async () => {
        if (role !== "VENDOR") {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                return;
            }

            const response = await axios.get(
                `${API_BASE_URL}/api/notifications/unread-count`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setUnreadCount(Number(response.data));
        } catch (error) {
            console.error("Error loading notification count:", error);
        }
    };

    // ==========================================
    // LOAD NOTIFICATION COUNT
    // ==========================================

    useEffect(() => {
        fetchUnreadCount();
    }, [role, location.pathname]);

    // ==========================================
    // CLOSE MOBILE MENU WHEN ROUTE CHANGES
    // ==========================================

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    // ==========================================
    // LOGOUT
    // ==========================================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");

        setMenuOpen(false);
        navigate("/");
    };

    // ==========================================
    // NAVIGATION LINK
    // ==========================================

    const navLinkClass =
        "block py-2 px-3 rounded-lg hover:bg-blue-700 transition";

    return (
        <nav className="bg-blue-600 text-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">

                {/* ==========================================
                    TOP BAR
                ========================================== */}

                <div className="flex justify-between items-center">

                    {/* LOGO */}

                    <Link
                        to="/home"
                        className="text-2xl sm:text-3xl font-bold whitespace-nowrap"
                    >
                        ShopStack
                    </Link>

                    {/* ==========================================
                        DESKTOP NAVIGATION
                    ========================================== */}

                    <div className="hidden lg:flex items-center gap-4 xl:gap-6">

                        <Link
                            to="/home"
                            className="hover:text-gray-200 whitespace-nowrap"
                        >
                            Home
                        </Link>

                        <Link
                            to="/profile"
                            className="hover:text-gray-200 whitespace-nowrap"
                        >
                            Profile
                        </Link>

                        <Link
                            to="/cart"
                            className="hover:text-gray-200 whitespace-nowrap"
                        >
                            Cart
                        </Link>

                        <Link
                            to="/my-orders"
                            className="hover:text-gray-200 whitespace-nowrap"
                        >
                            My Orders
                        </Link>

                        {/* ADMIN */}

                        {role === "ADMIN" && (
                            <>
                                <Link
                                    to="/admin/returns"
                                    className="hover:text-gray-200 whitespace-nowrap"
                                >
                                    Return & Refund
                                </Link>

                                <Link
                                    to="/admin/dashboard"
                                    className="hover:text-gray-200 whitespace-nowrap"
                                >
                                    Admin Dashboard
                                </Link>

                                <Link
                                    to="/admin/warehouses"
                                    className="hover:text-gray-200 whitespace-nowrap"
                                >
                                    Warehouses
                                </Link>
                            </>
                        )}

                        {/* VENDOR */}

                        {role === "VENDOR" && (
                            <>
                                <Link
                                    to="/notifications"
                                    className={`relative px-3 py-2 rounded-lg transition whitespace-nowrap ${
                                        unreadCount > 0
                                            ? "bg-red-500 text-white font-bold shadow-lg animate-pulse"
                                            : "hover:text-gray-200"
                                    }`}
                                >
                                    🔔 Notifications

                                    {unreadCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-yellow-300 text-red-700 text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1">
                                            {unreadCount > 99
                                                ? "99+"
                                                : unreadCount}
                                        </span>
                                    )}
                                </Link>

                                <Link
                                    to="/vendor/dashboard"
                                    className="hover:text-gray-200 whitespace-nowrap"
                                >
                                    Vendor Dashboard
                                </Link>
                            </>
                        )}

                        {/* WAREHOUSE STAFF */}

                        {role === "WAREHOUSE_STAFF" && (
                            <Link
                                to="/warehouse-staff/dashboard"
                                className="hover:text-gray-200 whitespace-nowrap"
                            >
                                Warehouse Operations
                            </Link>
                        )}

                        {/* LOGOUT */}

                        <button
                            onClick={handleLogout}
                            className="bg-red-500 px-4 py-2 rounded-lg hover:bg-red-600 transition whitespace-nowrap"
                        >
                            Logout
                        </button>
                    </div>

                    {/* ==========================================
                        MOBILE MENU BUTTON
                    ========================================== */}

                    <button
                        type="button"
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg hover:bg-blue-700 transition"
                        aria-label="Toggle navigation menu"
                        aria-expanded={menuOpen}
                    >
                        <span className="text-2xl">
                            {menuOpen ? "✕" : "☰"}
                        </span>
                    </button>
                </div>

                {/* ==========================================
                    MOBILE / TABLET NAVIGATION
                ========================================== */}

                {menuOpen && (
                    <div className="lg:hidden mt-4 border-t border-blue-500 pt-3">

                        <div className="flex flex-col gap-1">

                            <Link
                                to="/home"
                                className={navLinkClass}
                            >
                                🏠 Home
                            </Link>

                            <Link
                                to="/profile"
                                className={navLinkClass}
                            >
                                👤 Profile
                            </Link>

                            <Link
                                to="/cart"
                                className={navLinkClass}
                            >
                                🛒 Cart
                            </Link>

                            <Link
                                to="/my-orders"
                                className={navLinkClass}
                            >
                                📦 My Orders
                            </Link>

                            {/* ADMIN */}

                            {role === "ADMIN" && (
                                <>
                                    <Link
                                        to="/admin/returns"
                                        className={navLinkClass}
                                    >
                                        🔄 Return & Refund Management
                                    </Link>

                                    <Link
                                        to="/admin/dashboard"
                                        className={navLinkClass}
                                    >
                                        📊 Admin Dashboard
                                    </Link>

                                    <Link
                                        to="/admin/warehouses"
                                        className={navLinkClass}
                                    >
                                        🏭 Warehouses
                                    </Link>
                                </>
                            )}

                            {/* VENDOR */}

                            {role === "VENDOR" && (
                                <>
                                    <Link
                                        to="/notifications"
                                        className={`${navLinkClass} ${
                                            unreadCount > 0
                                                ? "bg-red-500 font-bold"
                                                : ""
                                        }`}
                                    >
                                        🔔 Notifications

                                        {unreadCount > 0 && (
                                            <span className="ml-2 inline-flex bg-yellow-300 text-red-700 text-xs font-bold rounded-full min-w-[22px] h-[22px] items-center justify-center px-1">
                                                {unreadCount > 99
                                                    ? "99+"
                                                    : unreadCount}
                                            </span>
                                        )}
                                    </Link>

                                    <Link
                                        to="/vendor/dashboard"
                                        className={navLinkClass}
                                    >
                                        🏪 Vendor Dashboard
                                    </Link>
                                </>
                            )}

                            {/* WAREHOUSE STAFF */}

                            {role === "WAREHOUSE_STAFF" && (
                                <Link
                                    to="/warehouse-staff/dashboard"
                                    className={navLinkClass}
                                >
                                    🏭 Warehouse Operations
                                </Link>
                            )}

                            {/* LOGOUT */}

                            <button
                                onClick={handleLogout}
                                className="w-full text-left py-2 px-3 mt-2 rounded-lg bg-red-500 hover:bg-red-600 transition"
                            >
                                🚪 Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;