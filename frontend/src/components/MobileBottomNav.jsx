import React from 'react';
import { 
  Home, 
  ShoppingCart, 
  User, 
  ShieldAlert, 
  Store, 
  Truck, 
  Package 
} from 'lucide-react';

function MobileBottomNav({
  currentView,
  currentUser,
  cartCount = 0,
  pendingAdminCount = 0,
  profileTab = 'profile',
  isCartOpen = false,
  onNavigateHome,
  onNavigateProfile,
  onNavigateDashboard,
  onOpenCart
}) {
  if (!currentUser) return null;

  const role = currentUser?.role || 'CUSTOMER';
  const isAdmin = role === 'ADMINISTRATOR' || role === 'ADMIN';
  const isVendor = role === 'VENDOR';
  const isWarehouse = role === 'WAREHOUSE_STAFF';

  // Determine role dashboard tab details
  let dashboardItem = {
    id: 'orders',
    label: 'Orders',
    icon: Package,
    badge: 0,
    badgeColor: 'var(--accent-blue)',
    isActive: currentView === 'profile' && profileTab === 'orders',
    onClick: () => onNavigateProfile('orders')
  };

  if (isAdmin) {
    dashboardItem = {
      id: 'admin',
      label: 'Admin',
      icon: ShieldAlert,
      badge: pendingAdminCount,
      badgeColor: 'var(--accent-rose)',
      isActive: currentView === 'admin-dashboard',
      onClick: () => onNavigateDashboard('admin-dashboard')
    };
  } else if (isVendor) {
    dashboardItem = {
      id: 'vendor',
      label: 'Seller',
      icon: Store,
      badge: 0,
      badgeColor: 'var(--accent-emerald)',
      isActive: currentView === 'vendor-dashboard',
      onClick: () => onNavigateDashboard('vendor-dashboard')
    };
  } else if (isWarehouse) {
    dashboardItem = {
      id: 'warehouse',
      label: 'Warehouse',
      icon: Truck,
      badge: 0,
      badgeColor: 'var(--accent-indigo)',
      isActive: currentView === 'warehouse-dashboard',
      onClick: () => onNavigateDashboard('warehouse-dashboard')
    };
  }

  const isHomeActive = currentView === 'home' && !isCartOpen;
  const isProfileActive = currentView === 'profile' && profileTab !== 'orders' && !isCartOpen;

  const DashboardIcon = dashboardItem.icon;

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      <div className="mobile-bottom-nav-inner">
        {/* Home Tab */}
        <button
          type="button"
          onClick={onNavigateHome}
          className={`mobile-nav-btn ${isHomeActive ? 'active' : ''}`}
          aria-label="Home"
        >
          <div className="mobile-nav-icon-wrapper">
            <Home size={20} strokeWidth={isHomeActive ? 2.5 : 1.8} />
          </div>
          <span className="mobile-nav-label">Home</span>
          {isHomeActive && <span className="mobile-nav-active-pill" />}
        </button>

        {/* Dynamic Dashboard Panel Tab (Admin, Vendor, Warehouse, or Customer Orders) */}
        <button
          type="button"
          onClick={dashboardItem.onClick}
          className={`mobile-nav-btn ${dashboardItem.isActive ? 'active' : ''}`}
          aria-label={dashboardItem.label}
        >
          <div className="mobile-nav-icon-wrapper">
            <DashboardIcon size={20} strokeWidth={dashboardItem.isActive ? 2.5 : 1.8} />
            {dashboardItem.badge > 0 && (
              <span 
                className="mobile-nav-badge" 
                style={{ backgroundColor: dashboardItem.badgeColor }}
              >
                {dashboardItem.badge > 99 ? '99+' : dashboardItem.badge}
              </span>
            )}
          </div>
          <span className="mobile-nav-label">{dashboardItem.label}</span>
          {dashboardItem.isActive && <span className="mobile-nav-active-pill" />}
        </button>

        {/* Cart Tab */}
        {!isAdmin && !isWarehouse && (
          <button
            type="button"
            onClick={onOpenCart}
            className={`mobile-nav-btn ${isCartOpen ? 'active' : ''}`}
            aria-label={`Cart with ${cartCount} items`}
          >
            <div className="mobile-nav-icon-wrapper">
              <ShoppingCart size={20} strokeWidth={isCartOpen ? 2.5 : 1.8} />
              {cartCount > 0 && (
                <span className="mobile-nav-badge mobile-nav-badge-cart">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            <span className="mobile-nav-label">Cart</span>
            {isCartOpen && <span className="mobile-nav-active-pill" />}
          </button>
        )}

        {/* Profile Tab */}
        <button
          type="button"
          onClick={() => onNavigateProfile('profile')}
          className={`mobile-nav-btn ${isProfileActive ? 'active' : ''}`}
          aria-label="Profile"
        >
          <div className="mobile-nav-icon-wrapper">
            <User size={20} strokeWidth={isProfileActive ? 2.5 : 1.8} />
          </div>
          <span className="mobile-nav-label">Profile</span>
          {isProfileActive && <span className="mobile-nav-active-pill" />}
        </button>
      </div>
    </nav>
  );
}

export default MobileBottomNav;
