import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { categoryApi } from './api';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomeCatalog from './pages/HomeCatalog';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import WarehouseStaffPortal from './pages/WarehouseStaffPortal';
import MyOrdersPage from './pages/MyOrdersPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

// Protected Route wrappers
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    categoryApi.getAll()
      .then(res => setCategories(res.data))
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  const handleOrderPlaced = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="app-container">
      <div className="bg-ambient">
        <div className="bg-blob-1"></div>
        <div className="bg-blob-2"></div>
      </div>

      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
      />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route
            path="/"
            element={
              <HomeCatalog
                key={refreshKey}
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                categories={categories}
              />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<ProtectedRoute allowedRoles={['CUSTOMER', 'VENDOR', 'ADMIN']}><CheckoutPage /></ProtectedRoute>} />
          
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'VENDOR', 'ADMIN']}>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/vendor"
            element={
              <ProtectedRoute allowedRoles={['VENDOR', 'ADMIN']}>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/warehouse-staff"
            element={
              <ProtectedRoute allowedRoles={['WAREHOUSE_STAFF', 'ADMIN']}>
                <WarehouseStaffPortal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}
