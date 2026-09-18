import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../services/AuthService'

export default function Navbar({
  cartCount = 0,
  wishlistCount = 0,
  onOpenCart,
  onOpenWishlist,
  activeTab,
  setActiveTab
}) {
  const navigate = useNavigate()
  const user = AuthService.getCurrentUser()
  const role = user?.role || 'CUSTOMER'
  const username = user?.username || 'Guest'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    AuthService.logout()
    navigate('/login')
  }

  const handleTabClick = (tab) => {
    setActiveTab(tab)
    navigate('/dashboard')
    setMobileMenuOpen(false)
  }

  const getRoleBadgeClass = () => {
    switch (role) {
      case 'ADMIN': return 'badge badge-red'
      case 'VENDOR': return 'badge badge-gold'
      default: return 'badge badge-purple'
    }
  }

  const navTabs = [
    { id: 'store', label: '🛍️ Storefront', show: true },
    { id: 'customer', label: '📦 My Orders', show: role === 'CUSTOMER' || role === 'USER' || role === 'ADMIN' },
    { id: 'vendor', label: '🏪 Vendor Portal', show: role === 'VENDOR' || role === 'ADMIN' },
    { id: 'warehouse', label: '🏭 Warehouse', show: role === 'WAREHOUSE_STAFF' || role === 'ADMIN', idAttr: 'nav-warehouse' },
    { id: 'admin', label: '⚡ Admin Portal', show: role === 'ADMIN' },
  ].filter(t => t.show)

  return (
    <nav className="dashboard-navbar" style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--border)' }}>
      <div className="navbar-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
        <span style={{ color: 'var(--gold)', fontWeight: '800', fontSize: '1.4rem', letterSpacing: '0.05em' }}>
          OBSIDIAN <span style={{ color: 'var(--text-primary)', fontWeight: '300' }}>LUXURY</span>
        </span>
      </div>

      <div className="nav-tabs-row">
        {navTabs.map(tab => (
          <button
            key={tab.id}
            id={tab.idAttr}
            onClick={() => handleTabClick(tab.id)}
            style={activeTab === tab.id ? activeNavStyle : navStyle}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="navbar-right" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        {/* Wishlist Button */}
        <button
          onClick={onOpenWishlist}
          title="Open Wishlist"
          id="nav-wishlist-btn"
          style={{
            position: 'relative',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.35)',
            color: '#f87171',
            padding: '0.5rem 0.9rem',
            borderRadius: 'var(--radius-btn)',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'var(--transition)',
            flexShrink: 0,
          }}
        >
          <span>❤️</span>
          <span>Wishlist</span>
          {wishlistCount > 0 && (
            <span
              style={{
                background: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                padding: '2px 7px',
                fontSize: '0.75rem',
                fontWeight: '800'
              }}
            >
              {wishlistCount}
            </span>
          )}
        </button>

        {/* Cart Button */}
        <button
          onClick={onOpenCart}
          title="Open Cart"
          id="nav-cart-btn"
          style={{
            position: 'relative',
            background: 'var(--gold-dim)',
            border: '1px solid var(--border-focus)',
            color: 'var(--gold)',
            padding: '0.5rem 0.9rem',
            borderRadius: 'var(--radius-btn)',
            cursor: 'pointer',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            transition: 'var(--transition)',
            flexShrink: 0,
          }}
        >
          <span>🛒</span>
          <span>Cart</span>
          {cartCount > 0 && (
            <span style={{ background: 'var(--gold)', color: '#000', borderRadius: '50%', padding: '2px 7px', fontSize: '0.75rem', fontWeight: '800' }}>
              {cartCount}
            </span>
          )}
        </button>

        <div
          onClick={() => navigate('/profile')}
          className="navbar-username"
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
        >
          <span className={getRoleBadgeClass()}>{role}</span>
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{username}</span>
        </div>

        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>

        <button
          className="hamburger-btn"
          onClick={() => setMobileMenuOpen(v => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          {navTabs.map(tab => (
            <button
              key={tab.id}
              id={tab.idAttr}
              onClick={() => handleTabClick(tab.id)}
              style={activeTab === tab.id ? activeNavStyle : navStyle}
            >
              {tab.label}
            </button>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', margin: '0.5rem 0' }}>
            <button
              onClick={() => {
                onOpenWishlist()
                setMobileMenuOpen(false)
              }}
              style={{
                background: 'rgba(239,68,68,0.15)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#f87171',
                padding: '0.6rem',
                borderRadius: 'var(--radius-btn)',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              ❤️ Wishlist ({wishlistCount})
            </button>
            <button
              onClick={() => {
                onOpenCart()
                setMobileMenuOpen(false)
              }}
              style={{
                background: 'var(--gold-dim)',
                border: '1px solid var(--border-focus)',
                color: 'var(--gold)',
                padding: '0.6rem',
                borderRadius: 'var(--radius-btn)',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.85rem'
              }}
            >
              🛒 Cart ({cartCount})
            </button>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }} onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }}>
              <span className={getRoleBadgeClass()}>{role}</span>
              <span style={{ color: 'var(--text-secondary)', fontWeight: '600', fontSize: '0.875rem' }}>{username}</span>
            </div>
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(220,38,38,0.15)',
                border: '1px solid var(--error)',
                color: '#fca5a5',
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.85rem'
              }}
            >
              Logout ⎋
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

const navStyle = {
  background: 'transparent',
  border: '1px solid transparent',
  color: 'var(--text-secondary)',
  padding: '0.5rem 1rem',
  borderRadius: 'var(--radius-btn)',
  cursor: 'pointer',
  fontWeight: '500',
  transition: 'var(--transition)'
}

const activeNavStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-focus)',
  color: 'var(--gold)',
  padding: '0.5rem 1rem',
  borderRadius: 'var(--radius-btn)',
  cursor: 'pointer',
  fontWeight: '700',
  boxShadow: 'var(--shadow-gold)'
}
