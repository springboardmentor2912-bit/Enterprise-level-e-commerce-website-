import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import Navbar from './components/Navbar'
import ProtectedRoute from './routes/ProtectedRoute'
import { cartApi } from './api/cartApi'
import { setCart } from './features/cart/cartSlice'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import OAuthCallbackPage from './pages/OAuthCallbackPage'
import ProfilePage from './pages/ProfilePage'

import ProductBrowsePage from './pages/ProductBrowsePage'
import ProductDetailPage from './pages/ProductDetailPage'
import WishlistPage from './pages/WishlistPage'
import CartPage from './pages/CartPage'
import CheckoutPage from './pages/CheckoutPage'
import OrderHistoryPage from './pages/OrderHistoryPage'
import OrderDetailPage from './pages/OrderDetailPage'

import VendorLayout from './pages/vendor/VendorLayout'
import VendorOverviewPage from './pages/vendor/VendorOverviewPage'
import VendorProductsPage from './pages/vendor/VendorProductsPage'
import VendorAddProductPage from './pages/vendor/VendorAddProductPage'
import VendorOrdersPage from './pages/vendor/VendorOrdersPage'
import VendorCommissionPage from './pages/vendor/VendorCommissionPage'

import AdminLayout from './pages/admin/AdminLayout'
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage'
import AdminVendorApprovalPage from './pages/admin/AdminVendorApprovalPage'
import AdminProductApprovalPage from './pages/admin/AdminProductApprovalPage'
import AdminReturnsPage from './pages/admin/AdminReturnsPage'
import AdminCouponsPage from './pages/admin/AdminCouponsPage'
import AdminReportsPage from './pages/admin/AdminReportsPage'

import WarehouseDashboardPage from './pages/warehouse/WarehouseDashboardPage'

export default function App() {
  const dispatch = useDispatch()
  const { accessToken } = useSelector((state) => state.auth)

  useEffect(() => {
    if (accessToken) {
      cartApi.get().then(({ data }) => dispatch(setCart(data.data))).catch(() => {})
    }
  }, [accessToken, dispatch])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pb-16">
        <Routes>
          {/* Public */}
          <Route path="/" element={<ProductBrowsePage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/oauth2/callback" element={<OAuthCallbackPage />} />

          {/* Authenticated — any role */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
          </Route>

          {/* Vendor only */}
          <Route element={<ProtectedRoute allowedRoles={['VENDOR']} />}>
            <Route path="/vendor" element={<VendorLayout />}>
              <Route index element={<VendorOverviewPage />} />
              <Route path="products" element={<VendorProductsPage />} />
              <Route path="products/new" element={<VendorAddProductPage />} />
              <Route path="orders" element={<VendorOrdersPage />} />
              <Route path="commission" element={<VendorCommissionPage />} />
            </Route>
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminAnalyticsPage />} />
              <Route path="vendors" element={<AdminVendorApprovalPage />} />
              <Route path="products" element={<AdminProductApprovalPage />} />
              <Route path="returns" element={<AdminReturnsPage />} />
              <Route path="coupons" element={<AdminCouponsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
            </Route>
          </Route>

          {/* Warehouse staff only */}
          <Route element={<ProtectedRoute allowedRoles={['WAREHOUSE_STAFF', 'ADMIN']} />}>
            <Route path="/warehouse" element={<WarehouseDashboardPage />} />
          </Route>

          <Route path="*" element={<ProductBrowsePage />} />
        </Routes>
      </main>
    </div>
  )
}
