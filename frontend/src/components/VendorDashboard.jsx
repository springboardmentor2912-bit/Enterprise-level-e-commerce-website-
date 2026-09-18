import { useState } from "react";
import "./VendorDashboard.css";

import VendorProductManagement from "./VendorProductManagement";
import VendorOrderManagement from "./VendorOrderManagement";
import VendorStockManagement from "./VendorStockManagement";

function VendorDashboard() {

  const [activePage, setActivePage] = useState("dashboard");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="vendor-dashboard">

      <aside className="vendor-sidebar">

        <div className="vendor-logo">
          🛒 <span>ShopStack</span>
        </div>

        <nav className="vendor-nav">

          <button
            className={
              activePage === "dashboard"
                ? "vendor-nav-item active"
                : "vendor-nav-item"
            }
            onClick={() => setActivePage("dashboard")}
          >
            📊
            <span>Dashboard</span>
          </button>

          <button
            className={
              activePage === "products"
                ? "vendor-nav-item active"
                : "vendor-nav-item"
            }
            onClick={() => setActivePage("products")}
          >
            📦
            <span>Products</span>
          </button>

          <button
            className={
              activePage === "orders"
                ? "vendor-nav-item active"
                : "vendor-nav-item"
            }
            onClick={() => setActivePage("orders")}
          >
            🛍️
            <span>Orders</span>
          </button>

          <button
            className={
              activePage === "stock"
                ? "vendor-nav-item active"
                : "vendor-nav-item"
            }
            onClick={() => setActivePage("stock")}
          >
            📈
            <span>Stock</span>
          </button>

          <button
            className={
              activePage === "settings"
                ? "vendor-nav-item active"
                : "vendor-nav-item"
            }
            onClick={() => setActivePage("settings")}
          >
            ⚙️
            <span>Settings</span>
          </button>

        </nav>

        <button
          className="vendor-logout"
          onClick={handleLogout}
        >
          🚪
          <span>Logout</span>
        </button>

      </aside>

      <main className="vendor-main">

        <header className="vendor-header">

          <div>

            <h1>
              {activePage === "dashboard"
                ? "Vendor Dashboard"
                : activePage === "products"
                ? "Product Management"
                : activePage === "orders"
                ? "Order Management"
                : activePage === "stock"
                ? "Stock Management"
                : "Settings"}
            </h1>

            <p>
              Welcome back, Vendor 👋
            </p>

          </div>

          <div className="vendor-profile">

            <div className="vendor-profile-avatar">
              V
            </div>

            <div>
              <strong>Vendor</strong>
              <small>Seller</small>
            </div>

          </div>

        </header>


        {/* =====================================================
            DASHBOARD
        ===================================================== */}

        {activePage === "dashboard" && (

          <section className="vendor-content">

            <div className="vendor-statistics">

              <div className="vendor-stat-card">

                <div className="vendor-stat-icon">
                  📦
                </div>

                <div>
                  <p>Total Products</p>
                  <h2>1</h2>
                </div>

              </div>


              <div className="vendor-stat-card">

                <div className="vendor-stat-icon">
                  🛍️
                </div>

                <div>
                  <p>Total Orders</p>
                  <h2>1</h2>
                </div>

              </div>


              <div className="vendor-stat-card">

                <div className="vendor-stat-icon">
                  💰
                </div>

                <div>
                  <p>Total Sales</p>
                  <h2>₹5999.98</h2>
                </div>

              </div>


              <div className="vendor-stat-card">

                <div className="vendor-stat-icon">
                  📊
                </div>

                <div>
                  <p>Stock Items</p>
                  <h2>18</h2>
                </div>

              </div>

            </div>


            <div className="vendor-welcome-card">

              <h2>
                Welcome to your Vendor Dashboard
              </h2>

              <p>
                Use the sidebar to manage your products,
                orders and stock.
              </p>

            </div>

          </section>

        )}


        {/* =====================================================
            PRODUCTS
        ===================================================== */}

        {activePage === "products" && (

          <section className="vendor-content">

            <VendorProductManagement />

          </section>

        )}


        {/* =====================================================
            ORDERS
        ===================================================== */}

        {activePage === "orders" && (

          <section className="vendor-content">

            <VendorOrderManagement />

          </section>

        )}


        {/* =====================================================
            STOCK
        ===================================================== */}

        {activePage === "stock" && (

          <section className="vendor-content">

            <VendorStockManagement />

          </section>

        )}


        {/* =====================================================
            SETTINGS
        ===================================================== */}

        {activePage === "settings" && (

          <section className="vendor-content">

            <div className="coming-soon">

              <h2>
                ⚙️ Settings
              </h2>

              <p>
                Vendor settings will be added later.
              </p>

            </div>

          </section>

        )}

      </main>

    </div>
  );
}

export default VendorDashboard;