import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ResetPassword from "../pages/auth/ResetPassword";
import RoleProtectedRoute from "../components/auth/RoleProtectedRoute";
import Profile from "../pages/customer/Profile";

import Home from "../pages/customer/Home";

import VendorDashboard from "../pages/vendor/VendorDashboard";
import AddProduct from "../pages/vendor/AddProduct";
import MyProducts from "../pages/vendor/MyProducts";
import VendorLayout from "../pages/vendor/VendorLayout";
import Inventory from "../pages/vendor/Inventory";
import Analytics from "../pages/vendor/Analytics";
import VendorOrders from "../pages/vendor/VendorOrders";

import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import ProductApproval from "../pages/admin/ProductApproval";
import Products from "../pages/admin/Products";
import Categories from "../pages/admin/Categories";
import Users from "../pages/admin/Users";
import Coupons from "../pages/admin/Coupons";
import Warehouses from "../pages/admin/Warehouses";
import Returns from "../pages/admin/Returns";
import AdminOrders from "../pages/admin/Orders";


import Wishlist from "../pages/customer/Wishlist";
import Cart from "../pages/customer/Cart";
import CustomerLayout from "../components/customer/CustomerLayout";
import Order from "../pages/customer/Order";
import ProductDetails from "../pages/customer/ProductDetails";
import PaymentPage from "../pages/customer/PaymentPage";
import Addresses from "../pages/customer/Addresses";
import Checkout from "../pages/customer/Checkout";

import WarehouseOrders from "../pages/warehouse/WarehouseOrders";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---------- Public Routes ---------- */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route
          path="/403"
          element={
            <div className="p-10 text-2xl font-bold text-red-600">
              403 — Access Denied
            </div>
          }
        />

        {/* ---------- Customer Routes ---------- */}
        <Route
          path="/"
          element={
            <RoleProtectedRoute allowedRoles={["CUSTOMER"]}>
              <CustomerLayout /> {/* Navbar lives here now! */}
            </RoleProtectedRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="cart" element={<Cart />} />
          <Route path="orders" element={<Order/>} />
          <Route path="profile" element={<Profile />} />
          <Route path="product/:id" element={<ProductDetails />} />
          <Route path="payment" element={<PaymentPage />} /> 
          <Route path="addresses" element={<Addresses />} />
          <Route path="checkout" element={<Checkout />} />
        </Route>
        

        {/* ---------- Vendor Routes ---------- */}
        <Route
  path="/vendor"
  element={
    <RoleProtectedRoute allowedRoles={["VENDOR"]}>
      <VendorLayout />
    </RoleProtectedRoute>
  }
>
  <Route index element={<VendorDashboard />} />
  <Route path="products" element={<MyProducts />} />
  <Route path="products/add" element={<AddProduct />} />
  <Route path="orders" element={<VendorOrders />} />
  <Route path="inventory" element={<Inventory />} />
  <Route path="analytics" element={<Analytics />} />
</Route>

        {/* ---------- Admin Routes (Nested Layout) ---------- */}
        <Route
          path="/admin"
          element={
            <RoleProtectedRoute allowedRoles={["ADMIN"]}>
              <AdminLayout />
            </RoleProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="approvals" element={<ProductApproval />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="users" element={<Users />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="warehouses" element={<Warehouses />} />
          <Route path="returns" element={<Returns />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>
        <Route 
  path="/warehouse" 
  element={
    // If you have a RoleProtectedRoute component, use it like this:
    <RoleProtectedRoute allowedRoles={["WAREHOUSE_STAFF"]}>
      <WarehouseOrders />
    </RoleProtectedRoute>
  } 
/>
      </Routes>
    </BrowserRouter>
  );
}