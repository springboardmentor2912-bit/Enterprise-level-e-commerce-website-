import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Admin.css";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isStaff = (sessionStorage.getItem("role") || "").toUpperCase().replace(/^ROLE_/, "") === "STAFF";

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  function goTo(path) {
    setIsMobileOpen(false);
    navigate(path);
  }

  function logout() {
    setIsMobileOpen(false);
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    sessionStorage.clear();
    navigate("/");
  }

  return (
    <>
      {/* Admin Mobile Topbar with 3-dot button */}
      <div className="admin-mobile-topbar">
        <div className="admin-mobile-brand" onClick={() => goTo(isStaff ? "/staff/warehouse" : "/admin")}>
          <h2>ShopStack</h2>
          <span>{isStaff ? "Staff" : "Admin"}</span>
        </div>
        <button
          type="button"
          className="mobile-kebab-btn"
          onClick={() => setIsMobileOpen(prev => !prev)}
          aria-label="Toggle Navigation Menu"
          aria-expanded={isMobileOpen}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2.2" />
            <circle cx="12" cy="12" r="2.2" />
            <circle cx="12" cy="19" r="2.2" />
          </svg>
        </button>
      </div>

      {/* Backdrop */}
      {isMobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar / Drawer */}
      <aside className={`admin-sidebar ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-content">
            <h2>ShopStack</h2>
            <p>{isStaff ? "Warehouse Staff" : "Admin Panel"}</p>
          </div>
          {isMobileOpen && (
            <button
              type="button"
              className="sidebar-close-btn"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close Menu"
            >
              ✕
            </button>
          )}
        </div>

        {!isStaff && (
          <button className={location.pathname === "/admin" ? "active" : ""} onClick={() => goTo("/admin")}>
            📊 Dashboard
          </button>
        )}

        {isStaff ? (
          <>
            <button className={location.pathname === "/staff/warehouse" ? "active" : ""} onClick={() => goTo("/staff/warehouse")}>🏬 Warehouse</button>
            <button className={location.pathname === "/staff/returned-stock" ? "active" : ""} onClick={() => goTo("/staff/returned-stock")}>📦 Returned Stock</button>
          </>
        ) : (
          <>
            <button className={location.pathname === "/admin/users" ? "active" : ""} onClick={() => goTo("/admin/users")}>👥 Users</button>
            <button className={location.pathname === "/admin/vendors" ? "active" : ""} onClick={() => goTo("/admin/vendors")}>🏬 Vendors</button>
            <button className={location.pathname === "/admin/orders" ? "active" : ""} onClick={() => goTo("/admin/orders")}>📑 Orders</button>
            <button className={location.pathname === "/admin/warehouse" ? "active" : ""} onClick={() => goTo("/admin/warehouse")}>🏭 Warehouse</button>
            <button className={location.pathname === "/admin/refunds" ? "active" : ""} onClick={() => goTo("/admin/refunds")}>🔄 Returns</button>
            <button className={location.pathname === "/admin/returned-stock" ? "active" : ""} onClick={() => goTo("/admin/returned-stock")}>📦 Returned Stock</button>
            <button className={location.pathname === "/admin/reports" ? "active" : ""} onClick={() => goTo("/admin/reports")}>📈 Reports</button>
            <button className={location.pathname === "/admin/coupons" ? "active" : ""} onClick={() => goTo("/admin/coupons")}>🏷️ Coupons</button>
            <button className={location.pathname === "/admin/profile" ? "active" : ""} onClick={() => goTo("/admin/profile")}>👤 Profile</button>
          </>
        )}

        <button className={location.pathname === (isStaff ? "/staff/inventory" : "/admin/inventory") ? "active" : ""} onClick={() => goTo(isStaff ? "/staff/inventory" : "/admin/inventory")}>
          📋 Inventory
        </button>

        <button className="logout-btn" onClick={logout}>
          🚪 Logout
        </button>
      </aside>
    </>
  );
}
