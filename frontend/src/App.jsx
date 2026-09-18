import React, { useState, useEffect, Suspense, lazy } from 'react';
import { LogOut, X, AlertTriangle } from 'lucide-react';
import MobileBottomNav from './components/MobileBottomNav';
import axios from 'axios';

// Dynamic route-based code splitting: loads dashboards only when accessed
const Register = lazy(() => import('./components/Register'));
const Login = lazy(() => import('./components/Login'));
const HomeDashboard = lazy(() => import('./components/HomeDashboard'));
const CustomerDashboard = lazy(() => import('./components/CustomerDashboard'));
const VendorDashboard = lazy(() => import('./components/VendorDashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const WarehouseDashboard = lazy(() => import('./components/WarehouseDashboard'));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          background: 'var(--bg-primary, #0f172a)',
          color: 'var(--text-primary, #f8fafc)',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            padding: '32px',
            borderRadius: '16px',
            background: 'var(--bg-secondary, #1e293b)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--accent-rose, #ef4444)'
            }}>
              <AlertTriangle size={24} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary, #94a3b8)', marginBottom: '24px', lineHeight: 1.5 }}>
              {this.state.error?.message || 'An unexpected error occurred while loading this page.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReset}
                className="btn btn-primary"
                style={{ padding: '10px 24px', fontWeight: '600', cursor: 'pointer' }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function DashboardLoadingFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      background: 'var(--bg-primary, #0f172a)',
      color: 'var(--text-primary, #f8fafc)'
    }}>
      <div className="spin" style={{
        width: '38px',
        height: '38px',
        borderRadius: '50%',
        border: '3px solid rgba(59, 130, 246, 0.2)',
        borderTopColor: 'var(--accent-blue, #3b82f6)'
      }} />
      <span style={{ fontSize: '13.5px', fontWeight: '500', color: 'var(--text-secondary, #94a3b8)', letterSpacing: '0.2px' }}>
        Loading ShopStack...
      </span>
    </div>
  );
}

function App() {
  // Purge any legacy global auth keys from localStorage once on boot
  useEffect(() => {
    try {
      localStorage.removeItem('shopstack_user');
      localStorage.removeItem('shopstack_cart');
      localStorage.removeItem('shopstack_orders');
    } catch (e) {}
  }, []);

  const [view, setView] = useState(() => {
    const savedUser = sessionStorage.getItem('shopstack_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        if (u && (u.id || u.email)) {
          return 'home';
        }
      } catch (e) {
        return 'login';
      }
    }
    return 'login';
  });
  
  // Persistent user state (100% isolated per browser tab via sessionStorage)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = sessionStorage.getItem('shopstack_user');
      if (!savedUser) return null;
      const u = JSON.parse(savedUser);
      if (u && u.email) {
        if (u.email.endsWith('@admin') && u.role !== 'ADMINISTRATOR') {
          u.role = 'ADMINISTRATOR';
        } else if (u.email.endsWith('@staff') && u.role !== 'WAREHOUSE_STAFF') {
          u.role = 'WAREHOUSE_STAFF';
        }
      }
      return u;
    } catch (e) {
      return null;
    }
  });

  // Persistent cart state (isolated per tab)
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = sessionStorage.getItem('shopstack_cart');
      const parsed = savedCart ? JSON.parse(savedCart) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  // Persistent order history state (isolated per tab)
  const [orders, setOrders] = useState(() => {
    try {
      const savedOrders = sessionStorage.getItem('shopstack_orders');
      const parsed = savedOrders ? JSON.parse(savedOrders) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  });

  // Global Wishlist state
  const [wishlist, setWishlist] = useState([]);

  // Active Profile Tab state
  const [profileTab, setProfileTab] = useState('profile');
  const [vendorTab, setVendorTab] = useState('analytics');
  const [adminTab, setAdminTab] = useState('overview');
  const [warehouseTab, setWarehouseTab] = useState('analytics');

  // Global Theme state
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('shopstack_theme');
    return savedTheme ? savedTheme : 'dark'; // Default theme is dark
  });

  // Sync theme with document class/attribute and localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('shopstack_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Save state updates (sessionStorage ensures each browser tab has completely isolated user & cart data)
  useEffect(() => {
    try {
      sessionStorage.setItem('shopstack_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  useEffect(() => {
    try {
      sessionStorage.setItem('shopstack_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  useEffect(() => {
    if (currentUser) {
      try {
        sessionStorage.setItem('shopstack_user', JSON.stringify(currentUser));
      } catch (e) {}
    } else {
      try {
        sessionStorage.removeItem('shopstack_user');
      } catch (e) {}
    }
  }, [currentUser]);

  const navigateTo = (newView) => {
    setView(newView);
    window.history.pushState({ view: newView }, '', '');
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setView(event.state.view);
      } else {
        setView('login');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    navigateTo('home');
  };

  // Logout Confirmation Modal state
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    setCurrentUser(null);
    setCart([]);
    sessionStorage.removeItem('shopstack_cart');
    sessionStorage.removeItem('shopstack_user');
    sessionStorage.removeItem('shopstack_orders');
    localStorage.removeItem('shopstack_cart');
    localStorage.removeItem('shopstack_user');
    localStorage.removeItem('shopstack_orders');
    navigateTo('login');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleUpdateUser = (updatedUser) => {
    setCurrentUser(updatedUser);
  };

  // Global Wishlist fetcher
  const fetchWishlist = async () => {
    if (!currentUser || !currentUser.id) return;
    try {
      const res = await axios.get(`http://localhost:8080/api/customer/${currentUser.id}/wishlist`);
      if (Array.isArray(res.data)) {
        setWishlist(res.data);
      } else {
        setWishlist([]);
      }
    } catch (err) {
      console.error("Failed to load wishlist", err);
      setWishlist([]);
    }
  };

  // Global Wishlist toggle
  const toggleWishlist = async (product, showFlash = null) => {
    if (!currentUser || !currentUser.id) return;
    const wishlistItems = Array.isArray(wishlist) ? wishlist : [];
    const isWishlisted = wishlistItems.some(p => p.id === product.id);
    try {
      if (isWishlisted) {
        await axios.delete(`http://localhost:8080/api/customer/${currentUser.id}/wishlist/${product.id}`);
        setWishlist(wishlistItems.filter(p => p.id !== product.id));
        if (showFlash) showFlash('success', "Removed from wishlist.");
      } else {
        await axios.post(`http://localhost:8080/api/customer/${currentUser.id}/wishlist/${product.id}`);
        setWishlist([...wishlistItems, product]);
        if (showFlash) showFlash('success', "Added to wishlist.");
      }
    } catch (err) {
      console.error("Failed to update wishlist", err);
      if (showFlash) showFlash('error', "Failed to update wishlist.");
    }
  };

  // Global Cart adder
  const addToCart = (product, showFlash = null) => {
    const cartItems = Array.isArray(cart) ? cart : [];
    const existing = cartItems.find(item => item.id === product.id);

    const discPct = Number(product.discountPercentage) || 0;
    const origPrice = Number(product.price) || 0;
    const effectivePrice = product.finalPrice != null 
      ? Number(product.finalPrice) 
      : (discPct > 0 ? Math.round(origPrice * (1 - discPct / 100) * 100) / 100 : origPrice);

    if (existing) {
      if (existing.quantity >= product.stock) {
        if (showFlash) showFlash('error', `Insufficient stock. Only ${product.stock} units available.`);
        return;
      }
      setCart(cartItems.map(item => 
        item.id === product.id ? { 
          ...item, 
          price: effectivePrice,
          originalPrice: origPrice,
          discountPercentage: discPct,
          quantity: item.quantity + 1 
        } : item
      ));
    } else {
      if (product.stock <= 0) {
        if (showFlash) showFlash('error', "This product is currently out of stock.");
        return;
      }
      setCart([...cartItems, { 
        ...product, 
        price: effectivePrice,
        originalPrice: origPrice,
        discountPercentage: discPct,
        quantity: 1 
      }]);
    }
    if (showFlash) showFlash('success', `${product.name} added to cart at ₹${effectivePrice.toLocaleString('en-IN')}.`);
  };

  // Global Orders fetcher
  const fetchOrders = async () => {
    if (!currentUser || !currentUser.id) return;
    try {
      const res = await axios.get(`http://localhost:8080/api/customer/${currentUser.id}/orders`);
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
      setOrders([]);
    }
  };

  // Sync wishlist and orders on user login or switch
  useEffect(() => {
    if (currentUser?.id) {
      fetchWishlist();
      fetchOrders();
    } else {
      setWishlist([]);
      setOrders([]);
    }
  }, [currentUser?.id]);

  // Cart open state (coordinated across navigation)
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Pending submissions count for Admin badge in bottom nav
  const [pendingAdminCount, setPendingAdminCount] = useState(0);

  useEffect(() => {
    if (currentUser && (currentUser.role === 'ADMINISTRATOR' || currentUser.role === 'ADMIN')) {
      axios.get('http://localhost:8080/api/products/admin/pending')
        .then(res => setPendingAdminCount(Array.isArray(res.data) ? res.data.length : 0))
        .catch(err => console.error("Error fetching pending products for admin badge:", err));
    } else {
      setPendingAdminCount(0);
    }
  }, [currentUser?.id, currentUser?.role]);

  const handleOpenCart = () => {
    if (view !== 'home') {
      navigateTo('home');
    }
    setIsCartOpen(true);
  };

  return (
    <div>
      <ErrorBoundary>
        <Suspense fallback={<DashboardLoadingFallback />}>
          {view === 'home' && currentUser ? (
            <HomeDashboard 
              user={currentUser} 
              cart={cart}
              setCart={setCart}
              orders={orders}
              setOrders={setOrders}
              wishlist={wishlist}
              setWishlist={setWishlist}
              toggleWishlist={toggleWishlist}
              addToCart={addToCart}
              fetchOrders={fetchOrders}
              onLogout={handleLogout} 
              onGoToProfile={(tab) => {
                setIsCartOpen(false);
                setProfileTab(typeof tab === 'string' && tab ? tab : 'profile');
                navigateTo('profile');
              }} 
              onGoToVendor={(tab) => {
                setIsCartOpen(false);
                setVendorTab(typeof tab === 'string' && tab ? tab : 'analytics');
                navigateTo('vendor-dashboard');
              }}
              onGoToAdmin={(tab) => {
                setIsCartOpen(false);
                setAdminTab(typeof tab === 'string' && tab ? tab : 'overview');
                navigateTo('admin-dashboard');
              }}
              onGoToWarehouse={(tab) => {
                setIsCartOpen(false);
                setWarehouseTab(typeof tab === 'string' && tab ? tab : 'analytics');
                navigateTo('warehouse-dashboard');
              }}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              isCartOpen={isCartOpen}
              setIsCartOpen={setIsCartOpen}
            />
          ) : view === 'profile' && currentUser ? (
            <CustomerDashboard 
              user={currentUser} 
              orders={orders}
              setOrders={setOrders}
              cart={cart}
              setCart={setCart}
              wishlist={wishlist}
              setWishlist={setWishlist}
              toggleWishlist={toggleWishlist}
              addToCart={addToCart}
              fetchOrders={fetchOrders}
              fetchWishlist={fetchWishlist}
              onUpdateUser={handleUpdateUser}
              onLogout={handleLogout} 
              onGoToHome={() => navigateTo('home')} 
              onGoToAdmin={(tab) => {
                setAdminTab(typeof tab === 'string' && tab ? tab : 'overview');
                navigateTo('admin-dashboard');
              }}
              onGoToWarehouse={(tab) => {
                setWarehouseTab(typeof tab === 'string' && tab ? tab : 'analytics');
                navigateTo('warehouse-dashboard');
              }}
              onGoToVendor={(tab) => {
                setVendorTab(typeof tab === 'string' && tab ? tab : 'analytics');
                navigateTo('vendor-dashboard');
              }}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              initialTab={profileTab}
            />
          ) : view === 'vendor-dashboard' && currentUser ? (
            <VendorDashboard 
              user={currentUser} 
              orders={orders}
              onGoToHome={() => navigateTo('home')} 
              onGoToProfile={(tab) => {
                setIsCartOpen(false);
                setProfileTab(tab || 'orders');
                navigateTo('profile');
              }}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onLogout={handleLogout}
              initialTab={vendorTab}
            />
          ) : view === 'admin-dashboard' && currentUser ? (
            <AdminDashboard 
              user={currentUser} 
              onGoToHome={() => navigateTo('home')} 
              onGoToProfile={(tab) => {
                setIsCartOpen(false);
                setProfileTab(tab || 'profile');
                navigateTo('profile');
              }}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onLogout={handleLogout}
              initialTab={adminTab}
            />
          ) : view === 'warehouse-dashboard' && currentUser ? (
            <WarehouseDashboard 
              user={currentUser} 
              onGoToHome={() => navigateTo('home')} 
              onGoToProfile={(tab) => {
                setIsCartOpen(false);
                setProfileTab(tab || 'profile');
                navigateTo('profile');
              }}
              theme={theme}
              onToggleTheme={handleToggleTheme}
              onLogout={handleLogout}
              initialTab={warehouseTab}
            />
          ) : view === 'register' ? (
            <Register 
              switchToLogin={() => navigateTo('login')} 
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          ) : (
            <Login 
              switchToRegister={() => navigateTo('register')} 
              onLoginSuccess={handleLoginSuccess}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />
          )}
        </Suspense>
      </ErrorBoundary>

      {/* Logout Re-assurance / Confirmation Modal */}
      {showLogoutConfirm && (
        <div 
          className="modal-overlay" 
          style={{ zIndex: 99999, padding: '16px' }}
          onClick={cancelLogout}
        >
          <div 
            className="dialog-content" 
            style={{ 
              maxWidth: '400px', 
              width: '100%', 
              padding: '24px 20px', 
              textAlign: 'center', 
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45), var(--shadow-glow)', 
              borderRadius: 'var(--radius-lg)',
              animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button" 
              onClick={cancelLogout} 
              className="btn-icon-only" 
              style={{ position: 'absolute', top: '14px', right: '14px', padding: '6px' }}
              title="Close"
            >
              <X size={16} />
            </button>

            <div 
              style={{ 
                width: '56px', 
                height: '56px', 
                borderRadius: '50%', 
                background: 'rgba(239, 68, 68, 0.12)', 
                border: '1px solid rgba(239, 68, 68, 0.25)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 16px', 
                color: 'var(--accent-rose)' 
              }}
            >
              <LogOut size={26} />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '8px' }}>
              Log Out of ShopStack?
            </h3>
            
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '22px' }}>
              Are you sure you want to sign out? You will need to log back in to access your orders, cart, and account settings.
            </p>

            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button 
                type="button" 
                onClick={cancelLogout} 
                className="btn btn-secondary" 
                style={{ flex: 1, padding: '10px 14px', justifyContent: 'center', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                onClick={confirmLogout} 
                className="btn btn-danger" 
                style={{ flex: 1, padding: '10px 14px', justifyContent: 'center', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <LogOut size={15} /> Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      {currentUser && view !== 'login' && view !== 'register' && (
        <MobileBottomNav 
          currentView={view}
          currentUser={currentUser}
          cartCount={Array.isArray(cart) ? cart.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0) : 0}
          pendingAdminCount={pendingAdminCount}
          profileTab={profileTab}
          isCartOpen={view === 'home' && isCartOpen}
          onNavigateHome={() => {
            setIsCartOpen(false);
            navigateTo('home');
          }}
          onNavigateProfile={(tab = 'profile') => {
            setIsCartOpen(false);
            setProfileTab(tab);
            navigateTo('profile');
          }}
          onNavigateDashboard={(dashView) => {
            setIsCartOpen(false);
            navigateTo(dashView);
          }}
          onOpenCart={handleOpenCart}
        />
      )}
    </div>
  );
}

export default App;