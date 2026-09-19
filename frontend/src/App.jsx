import { BrowserRouter, Routes, Route } from "react-router-dom";

// ==============================
// AUTH / COMMON PAGES
// ==============================

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Notifications from "./pages/Notifications";


// ==============================
// VENDOR PAGES
// ==============================

import VendorDashboard from "./pages/VendorDashboard";
import AddProduct from "./pages/AddProduct";
import MyProducts from "./pages/MyProducts";
import EditProduct from "./pages/EditProduct";
import Inventory from "./pages/Inventory";
import VendorOrders from "./pages/VendorOrders";
import VendorCoupons from "./pages/VendorCoupons";


// ==============================
// ADMIN PAGES
// ==============================

import AdminDashboard from "./pages/AdminDashboard";
import AdminVendors from "./pages/AdminVendors";
import AdminOrders from "./pages/AdminOrders";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminCommissions from "./pages/AdminCommissions";
import AdminCoupons from "./pages/AdminCoupons";
import AdminReturns from "./pages/AdminReturns";
import AdminWarehouses from "./pages/AdminWarehouses";
import WarehouseAnalytics from "./pages/WarehouseAnalytics";
import WarehouseStaffDashboard from "./pages/WarehouseStaffDashboard";


// ==============================
// PROTECTED ROUTE
// ==============================

import ProtectedRoute from "./components/ProtectedRoute";


function App() {

    return (

        <BrowserRouter>

            <Routes>

                {/* ==========================================
                    AUTHENTICATION
                ========================================== */}

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ==========================================
                    CUSTOMER / COMMON
                ========================================== */}

                <Route
                    path="/home"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/products"
                    element={
                        <ProtectedRoute>
                            <Products />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/product/:id"
                    element={
                        <ProtectedRoute>
                            <ProductDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/cart"
                    element={
                        <ProtectedRoute>
                            <Cart />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    MY ORDERS
                    CUSTOMER ORDER HISTORY
                ========================================== */}

                <Route
                    path="/my-orders"
                    element={
                        <ProtectedRoute>
                            <MyOrders />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    CHECKOUT
                ========================================== */}

                <Route
                    path="/checkout"
                    element={
                        <ProtectedRoute>
                            <Checkout />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/order-success"
                    element={
                        <ProtectedRoute>
                            <OrderSuccess />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    NOTIFICATIONS
                ========================================== */}

                <Route
                    path="/notifications"
                    element={
                        <ProtectedRoute>
                            <Notifications />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    VENDOR
                ========================================== */}

                <Route
                    path="/vendor/dashboard"
                    element={
                        <ProtectedRoute>
                            <VendorDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/vendor/add-product"
                    element={
                        <ProtectedRoute>
                            <AddProduct />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/vendor/my-products"
                    element={
                        <ProtectedRoute>
                            <MyProducts />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/vendor/edit-product/:id"
                    element={
                        <ProtectedRoute>
                            <EditProduct />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/vendor/coupons"
                    element={
                        <ProtectedRoute>
                            <VendorCoupons />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/vendor/orders"
                    element={
                        <ProtectedRoute>
                            <VendorOrders />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/inventory"
                    element={
                        <ProtectedRoute>
                            <Inventory />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    LEGACY VENDOR ROUTES
                    Kept so existing links don't break
                ========================================== */}

                <Route
                    path="/add-product"
                    element={
                        <ProtectedRoute>
                            <AddProduct />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/my-products"
                    element={
                        <ProtectedRoute>
                            <MyProducts />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    ADMIN DASHBOARD
                ========================================== */}

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute>
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    ADMIN VENDOR MANAGEMENT
                ========================================== */}

                <Route
                    path="/admin/vendors"
                    element={
                        <ProtectedRoute>
                            <AdminVendors />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    ADMIN ORDER MANAGEMENT
                ========================================== */}

                <Route
                    path="/admin/orders"
                    element={
                        <ProtectedRoute>
                            <AdminOrders />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    ADMIN ANALYTICS
                ========================================== */}

                <Route
                    path="/admin/analytics"
                    element={
                        <ProtectedRoute>
                            <AdminAnalytics />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    ADMIN COMMISSIONS
                ========================================== */}

                <Route
                    path="/admin/commissions"
                    element={
                        <ProtectedRoute>
                            <AdminCommissions />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    ADMIN COUPONS
                ========================================== */}

                <Route
                    path="/admin/coupons"
                    element={
                        <ProtectedRoute>
                            <AdminCoupons />
                        </ProtectedRoute>
                    }
                />


                {/* ==========================================
                    ADMIN RETURN & REFUND MANAGEMENT
                ========================================== */}

                <Route
                    path="/admin/returns"
                    element={
                        <ProtectedRoute>
                            <AdminReturns />
                        </ProtectedRoute>
                    }
                />

                <Route path="/admin/warehouses" element={<ProtectedRoute><AdminWarehouses /></ProtectedRoute>} />

                <Route path="/admin/warehouse-analytics" element={<ProtectedRoute><WarehouseAnalytics /></ProtectedRoute>} />

                <Route path="/warehouse-staff/dashboard" element={<ProtectedRoute><WarehouseStaffDashboard /></ProtectedRoute>} />




            </Routes>

        </BrowserRouter>
    );
}

export default App;