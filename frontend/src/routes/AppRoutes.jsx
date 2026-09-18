import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

// Customer
import ProductList from "../pages/customer/ProductList";
import ProductDetails from "../pages/customer/ProductDetails";
import Cart from "../pages/customer/Cart";
import Checkout from "../pages/customer/Checkout";
import MyOrders from "../pages/customer/MyOrders";
import OrderDetails from "../pages/customer/OrderDetails";
import OrderSuccess from "../pages/customer/OrderSuccess";

// Authentication
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

// Admin
import AdminDashboard from "../pages/admin/AdminDashboard";
import VendorManagement from "../pages/admin/VendorManagement";
import MarketplaceAnalytics from "../pages/admin/MarketplaceAnalytics";
import OrderMonitoring from "../pages/admin/OrderMonitoring";
import CommissionManagement from "../pages/admin/CommissionManagement";
import SystemMonitoring from "../pages/admin/SystemMonitoring";
import BusinessReports from "../pages/admin/BusinessReports";
import WarehouseManagement from "../pages/admin/WarehouseManagement";
import RefundManagement from "../pages/admin/RefundManagement";

function AppRoutes() {
    return (
        <Routes>

            {/* =====================================================
                CUSTOMER STORE
            ===================================================== */}

            <Route
                path="/"
                element={
                    <ProtectedRoute role="CUSTOMER">
                        <ProductList />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/products"
                element={
                    <ProtectedRoute role="CUSTOMER">
                        <ProductList />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/products/:id"
                element={
                    <ProtectedRoute role="CUSTOMER">
                        <ProductDetails />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/cart"
                element={
                    <ProtectedRoute role="CUSTOMER">
                        <Cart />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/checkout"
                element={
                    <ProtectedRoute role="CUSTOMER">
                        <Checkout />
                    </ProtectedRoute>
                }
            />

            {/* Customer Orders */}
            <Route
                path="/orders"
                element={
                    <ProtectedRoute role="CUSTOMER">
                        <MyOrders />
                    </ProtectedRoute>
                }
            />

            {/* ProductList uses /my-orders */}
            <Route
                path="/my-orders"
                element={
                    <ProtectedRoute role="CUSTOMER">
                        <MyOrders />
                    </ProtectedRoute>
                }
            />

            {/* Individual Order Details */}
            <Route
                path="/orders/:id"
                element={
                    <ProtectedRoute role="CUSTOMER">
                        <OrderDetails />
                    </ProtectedRoute>
                }
            />

            {/* Order Success */}
            <Route
                path="/order-success"
                element={
                    <ProtectedRoute role="CUSTOMER">
                        <OrderSuccess />
                    </ProtectedRoute>
                }
            />

            {/* =====================================================
                AUTHENTICATION
            ===================================================== */}

            <Route
                path="/login"
                element={<LoginForm />}
            />

            <Route
                path="/register"
                element={<RegisterForm />}
            />

            {/* =====================================================
                ADMIN
            ===================================================== */}

            <Route
                path="/admin/dashboard"
                element={
                    <ProtectedRoute role="ADMIN">
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/vendors"
                element={
                    <ProtectedRoute role="ADMIN">
                        <VendorManagement />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/analytics"
                element={
                    <ProtectedRoute role="ADMIN">
                        <MarketplaceAnalytics />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/orders"
                element={
                    <ProtectedRoute role="ADMIN">
                        <OrderMonitoring />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/commissions"
                element={
                    <ProtectedRoute role="ADMIN">
                        <CommissionManagement />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/system"
                element={
                    <ProtectedRoute role="ADMIN">
                        <SystemMonitoring />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/reports"
                element={
                    <ProtectedRoute role="ADMIN">
                        <BusinessReports />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/warehouses"
                element={
                    <ProtectedRoute role="ADMIN">
                        <WarehouseManagement />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/admin/refunds"
                element={
                    <ProtectedRoute role="ADMIN">
                        <RefundManagement />
                    </ProtectedRoute>
                }
            />

        </Routes>
    );
}

export default AppRoutes;