import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import ProductCatalog from '../components/ProductCatalog'
import CustomerModule from '../components/CustomerModule'
import VendorModule from '../components/VendorModule'
import AdminModule from '../components/AdminModule'
import WarehouseStaffModule from '../components/WarehouseStaffModule'
import WishlistDrawer from '../components/WishlistDrawer'
import CustomerService from '../services/CustomerService'
import WishlistService from '../services/WishlistService'
import AuthService from '../services/AuthService'

import { useLocation } from 'react-router-dom'

export default function Dashboard() {
  const user = AuthService.getCurrentUser()
  const role = user?.role || 'CUSTOMER'
  const location = useLocation()

  const getInitialTab = () => {
    const path = location.pathname.toLowerCase()
    // Warehouse Staff always land on warehouse portal
    if (role === 'WAREHOUSE_STAFF') return 'warehouse'
    if (path.includes('/admin') && role === 'ADMIN') return 'admin'
    if (path.includes('/vendor') && (role === 'VENDOR' || role === 'ADMIN')) return 'vendor'
    if (path.includes('/customer')) return 'customer'
    if (path.includes('/warehouse') && (role === 'ADMIN' || role === 'WAREHOUSE_STAFF')) return 'warehouse'
    return 'store'
  }

  const [activeTab, setActiveTab] = useState(getInitialTab)
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isWishlistOpen, setIsWishlistOpen] = useState(false)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [initialCheckout, setInitialCheckout] = useState(false)

  const updateCartCount = async () => {
    if (!user?.id) return
    try {
      const items = await CustomerService.getCart(user.id)
      setCartCount(items.length)
    } catch (err) {
      console.error('Failed to fetch cart count:', err)
    }
  }

  const updateWishlistCount = async () => {
    if (!user?.id) return
    try {
      const items = await WishlistService.getWishlist(user.id)
      setWishlistCount(items.length)
    } catch (err) {
      console.error('Failed to fetch wishlist count:', err)
    }
  }

  useEffect(() => {
    updateCartCount()
    updateWishlistCount()
  }, [user?.id])

  return (
    <div className="dashboard-bg" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Navigation Bar */}
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onOpenCart={() => {
          setInitialCheckout(false)
          setIsCartOpen(true)
        }}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Module Content */}
      <main className="dashboard-content" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {activeTab === 'store' && (
          <ProductCatalog
            onAddToCartSuccess={() => {
              updateCartCount()
              setInitialCheckout(false)
              setIsCartOpen(true)
            }}
            onBuyNow={async () => {
              await updateCartCount()
              setInitialCheckout(true)
              setIsCartOpen(true)
            }}
            onWishlistUpdated={(cnt) => {
              setWishlistCount(cnt)
            }}
          />
        )}

        {activeTab === 'customer' && (
          <CustomerModule
            isCartOpen={isCartOpen}
            initialCheckout={initialCheckout}
            onCloseCart={() => {
              setIsCartOpen(false)
              setInitialCheckout(false)
            }}
            onCartUpdated={(cnt) => setCartCount(cnt)}
          />
        )}

        {activeTab === 'vendor' && (
          <VendorModule />
        )}

        {activeTab === 'warehouse' && (
          <WarehouseStaffModule />
        )}

        {activeTab === 'admin' && (
          <AdminModule />
        )}
      </main>

      {/* Cart Modal when open from Store or Navbar */}
      {activeTab !== 'customer' && (
        <CustomerModule
          isCartOpen={isCartOpen}
          initialCheckout={initialCheckout}
          onCloseCart={() => {
            setIsCartOpen(false)
            setInitialCheckout(false)
          }}
          onCartUpdated={(cnt) => setCartCount(cnt)}
          showOrderHistory={false}
        />
      )}

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        onWishlistUpdated={(cnt) => setWishlistCount(cnt)}
        onCartUpdated={() => updateCartCount()}
        onOpenCart={() => {
          setIsWishlistOpen(false)
          setInitialCheckout(false)
          setIsCartOpen(true)
        }}
      />
    </div>
  )
}
