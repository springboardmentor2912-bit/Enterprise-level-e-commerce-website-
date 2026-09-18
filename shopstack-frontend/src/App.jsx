import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Customer Components & Pages
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ProductCatalogPage from './pages/ProductCatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import OrdersPage from './pages/OrdersPage';
import CheckoutPage from './pages/CheckoutPage';

// Vendor Components & Pages
import VendorAuthPage from './pages/VendorAuthPage';
import VendorDashboardPage from './pages/VendorDashboardPage';
import VendorProductsPage from './pages/VendorProductsPage';
import VendorOrdersPage from './pages/VendorOrdersPage';

// Admin Components & Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminCommissionsPage from './pages/AdminCommissionsPage';
import AdminCouponsPage from './pages/AdminCouponsPage';
import AdminAuthPage from './pages/AdminAuthPage';
import AdminVendorManagementPage from './pages/AdminVendorManagementPage';
import AdminProductVisibilityPage from './pages/AdminProductVisibilityPage';
import AdminMarketplaceAnalyticsPage from './pages/AdminMarketplaceAnalyticsPage';
import AdminOrderMonitoringPage from './pages/AdminOrderMonitoringPage';
import AdminSystemMonitoringPage from './pages/AdminSystemMonitoringPage';
import AdminBusinessReportsPage from './pages/AdminBusinessReportsPage';
import AdminWarehousePage from './pages/AdminWarehousePage';
import AdminReturnManagementPage from './pages/AdminReturnManagementPage';
import ProtectedAdminRoute from './components/ProtectedAdminRoute';
import AdminNavbar from './components/AdminNavbar';

// Warehouse Staff Components & Pages
import WarehouseStaffDashboardPage from './pages/WarehouseStaffDashboardPage';
import ProtectedWarehouseStaffRoute from './components/ProtectedWarehouseStaffRoute';
import WarehouseStaffNavbar from './components/WarehouseStaffNavbar';

import ProtectedRoute from './components/ProtectedRoute';
import ProtectedVendorRoute from './components/ProtectedVendorRoute';
import Navbar from './components/Navbar';
import VendorNavbar from './components/VendorNavbar';
import Footer from './components/Footer';

// Layout wrapper for customer pages requiring top Navbar and Footer
const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Layout wrapper for vendor portal pages
const VendorLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <VendorNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Layout wrapper for warehouse staff portal pages
const WarehouseStaffLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <WarehouseStaffNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Layout wrapper for admin portal pages
const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <AdminNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          {/* Public Customer Authentication Routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />

          {/* Public Vendor Authentication Routes */}
          <Route path="/vendor/login" element={<VendorAuthPage />} />
          <Route path="/vendor/register" element={<VendorAuthPage />} />

          {/* Public Admin Authentication Route */}
          <Route path="/admin/login" element={<AdminAuthPage />} />

          {/* Public Customer Routes */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductCatalogPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/catalog" element={<ProductCatalogPage />} />
          </Route>

          {/* Protected Customer Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<CustomerLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<ProfilePage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/orders" element={<OrdersPage />} />
            </Route>
          </Route>

          {/* Protected Vendor Routes */}
          <Route element={<ProtectedVendorRoute />}>
            <Route element={<VendorLayout />}>
              <Route path="/vendor/dashboard" element={<VendorDashboardPage />} />
              <Route path="/vendor/products" element={<VendorProductsPage />} />
              <Route path="/vendor/orders" element={<VendorOrdersPage />} />
            </Route>
          </Route>

          {/* Protected Warehouse Staff Routes */}
          <Route element={<ProtectedWarehouseStaffRoute />}>
            <Route element={<WarehouseStaffLayout />}>
              <Route path="/warehouse-staff" element={<Navigate to="/warehouse-staff/dashboard" replace />} />
              <Route path="/warehouse-staff/dashboard" element={<WarehouseStaffDashboardPage />} />
              <Route path="/warehouse-staff/qc" element={<WarehouseStaffDashboardPage defaultTab="returns_qc" />} />
              <Route path="/warehouse-staff/returns" element={<WarehouseStaffDashboardPage defaultTab="returns_qc" />} />
            </Route>
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/analytics" element={<AdminMarketplaceAnalyticsPage />} />
              <Route path="/admin/warehouses" element={<AdminWarehousePage />} />
              <Route path="/admin/vendors" element={<AdminVendorManagementPage />} />
              <Route path="/admin/products" element={<AdminProductVisibilityPage />} />
              <Route path="/admin/orders" element={<AdminOrderMonitoringPage />} />
              <Route path="/admin/returns" element={<AdminReturnManagementPage />} />
              <Route path="/admin/system" element={<AdminSystemMonitoringPage />} />
              <Route path="/admin/reports" element={<AdminBusinessReportsPage />} />
              <Route path="/admin/commissions" element={<AdminCommissionsPage />} />
              <Route path="/admin/coupons" element={<AdminCouponsPage />} />
            </Route>
          </Route>

          {/* Default Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;