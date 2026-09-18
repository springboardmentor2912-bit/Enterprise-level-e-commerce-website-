import { BrowserRouter, Routes, Route } from "react-router-dom";


import Login from "./components/Login";
import ForgotPassword from "./components/ForgotPassword";

import CustomerDashboard from "./components/CustomerDashboard";

import VendorDashboard from "./components/VendorDashboard";

import VendorProfile from "./components/VendorProfile";

import CustomerProfile from "./components/customer/CustomerProfile";

import ProtectedRoute from "./components/ProtectedRoute";

import BrowseProducts from "./components/customer/BrowseProducts";

import Cart from "./components/customer/Cart";

import Checkout from "./components/customer/Checkout";

import Wishlist from "./components/customer/Wishlist";
import Orders from "./components/customer/Orders";
import CustomerNotifications from "./components/customer/CustomerNotifications";
import ReturnsRefunds from "./components/customer/ReturnsRefunds";

import AddProduct from "./components/vendor/AddProduct";

import ManageProducts from "./components/vendor/ManageProducts";
import VendorOrders from "./components/vendor/VendorOrders";
import VendorNotifications from "./components/vendor/VendorNotifications";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminUsers from "./components/admin/AdminUsers";
import AdminVendors from "./components/admin/AdminVendors";
import AdminOrders from "./components/admin/AdminOrders";
import AdminRefunds from "./components/admin/AdminRefunds";
import AdminReports from "./components/admin/AdminReports";
import AdminProfile from "./components/admin/AdminProfile";
import AdminWarehouse from "./components/admin/AdminWarehouse";
import AdminInventory from "./components/admin/AdminInventory";
import AdminProductRequests from "./components/admin/AdminProductRequests";
import StaffReturnedStock from "./components/admin/StaffReturnedStock";
import AdminCoupons from "./components/admin/AdminCoupons";




function App() {


  return (


    <BrowserRouter>


      <Routes>

        <Route path="/forgot-password" element={<ForgotPassword />} />



        {/* Login */}

        <Route

          path="/"

          element={<Login />}

        />





        {/* Customer Dashboard */}

        <Route

          path="/customer-dashboard"

          element={<CustomerDashboard />}

        />





        {/* Customer Products */}

        <Route

          path="/customer/products"

          element={<BrowseProducts />}

        />



        {/* Customer Cart */}

        <Route

          path="/customer/cart"

          element={<Cart />}

        />



        {/* Customer Checkout */}

        <Route

          path="/customer/checkout"

          element={<Checkout />}

        />

        <Route
          path="/customer/wishlist"
          element={<Wishlist />}
        />

        <Route path="/customer/orders" element={<Orders />} />
        <Route path="/customer/notifications" element={<CustomerNotifications />} />
        <Route path="/customer/returns" element={<ReturnsRefunds />} />





        {/* Customer Profile */}

        <Route

          path="/customer-profile"

          element={<CustomerProfile />}

        />

        <Route path="/customer/profile" element={<CustomerProfile />} />







        {/* Vendor Dashboard */}

        <Route

          path="/vendor-dashboard"

          element={<ProtectedRoute requiredRole={"VENDOR"}><VendorDashboard /></ProtectedRoute>}

        />






        {/* Vendor Profile */}

        <Route

          path="/vendor-profile"

          element={<ProtectedRoute requiredRole={"VENDOR"}><VendorProfile /></ProtectedRoute>}

        />






        {/* Vendor Add Product */}

        <Route

          path="/vendor/add-product"

          element={<ProtectedRoute requiredRole={"VENDOR"}><AddProduct /></ProtectedRoute>}

        />






        {/* Vendor Manage Products */}

        <Route

          path="/vendor/products"

          element={<ProtectedRoute requiredRole={"VENDOR"}><ManageProducts /></ProtectedRoute>}

        />



        <Route path="/vendor/orders" element={<ProtectedRoute requiredRole={"VENDOR"}><VendorOrders /></ProtectedRoute>} />
        <Route path="/vendor/notifications" element={<ProtectedRoute requiredRole={"VENDOR"}><VendorNotifications /></ProtectedRoute>} />

        {/* Admin Dashboard (requires admin login) */}
        <Route path="/admin" element={<ProtectedRoute requiredRole={"ADMIN"}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole={"ADMIN"}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/vendors" element={<ProtectedRoute requiredRole={"ADMIN"}><AdminVendors /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute requiredRole={"ADMIN"}><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/warehouse" element={<ProtectedRoute requiredRole={"ADMIN"}><AdminWarehouse /></ProtectedRoute>} />
        <Route path="/admin/inventory" element={<ProtectedRoute requiredRole={"ADMIN"}><AdminInventory /></ProtectedRoute>} />
        <Route path="/admin/product-requests" element={<ProtectedRoute requiredRole={"ADMIN"}><AdminProductRequests /></ProtectedRoute>} />
        <Route path="/staff/returned-stock" element={<ProtectedRoute requiredRole={"STAFF"}><StaffReturnedStock /></ProtectedRoute>} />
        <Route path="/admin/returned-stock" element={<ProtectedRoute requiredRole={"ADMIN"}><StaffReturnedStock /></ProtectedRoute>} />
        <Route path="/staff/warehouse" element={<ProtectedRoute requiredRole={"STAFF"}><AdminWarehouse /></ProtectedRoute>} />
        <Route path="/staff/inventory" element={<ProtectedRoute requiredRole={"STAFF"}><AdminInventory /></ProtectedRoute>} />
        <Route path="/admin/refunds" element={<ProtectedRoute requiredRole={"ADMIN"}><AdminRefunds /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute requiredRole={"ADMIN"}><AdminReports /></ProtectedRoute>} />
        <Route path="/admin/profile" element={<ProtectedRoute requiredRole={"ADMIN"}><AdminProfile /></ProtectedRoute>} />
        <Route path="/admin/coupons" element={<ProtectedRoute requiredRole={"ADMIN"}><AdminCoupons /></ProtectedRoute>} />

      </Routes>


    </BrowserRouter>


  );


}


export default App;
