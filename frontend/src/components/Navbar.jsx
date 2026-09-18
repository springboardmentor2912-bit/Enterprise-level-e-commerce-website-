import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { notificationApi } from '../api';
import RoleBadge from './RoleBadge';
import { Store, ShoppingCart, Heart, User as UserIcon, LogOut, ShieldCheck, Search, MapPin, ChevronDown, Sparkles, Layers, SlidersHorizontal, X, PackageCheck, Menu, Bell, Check, Clock, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';

const Navbar = ({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categories = [] }) => {
  const { user, logout, isAdmin, isVendor } = useAuth();
  const { cartCount } = useCart();
  const [selectedCatId, setSelectedCatId] = useState(selectedCategory || '');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000); // 30s poll
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      if (res && res.data) {
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      // Ignore background network issues
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await notificationApi.getMyNotifications();
      if (res && res.data) {
        setNotifications(res.data);
      }
    } catch (e) {
      console.error("Error fetching notifications:", e);
    }
  };

  const toggleNotifDropdown = () => {
    if (!notifOpen) {
      fetchNotifications();
      fetchUnreadCount();
    }
    setNotifOpen(!notifOpen);
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Error marking read:", e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error("Error marking all read:", e);
    }
  };


  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const isHomePage = location.pathname === '/';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
    }
    if (mobileSearchOpen) setMobileSearchOpen(false);
  };

  const handleCategorySelectChange = (e) => {
    const val = e.target.value ? Number(e.target.value) : null;
    setSelectedCatId(e.target.value);
    if (setSelectedCategory) setSelectedCategory(val);
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      
      {/* Top Utility Ribbon - Hidden on small mobile */}
      <div className="hide-on-mobile" style={{ background: '#070a12', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0.35rem 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#818cf8' }}>
              {/* <Sparkles size={13} /> */}
              {/* <span>Multi-Vendor Enterprise E-Commerce</span> */}
            </div>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <span style={{ color: '#34d399', fontWeight: 600 }}>100% Verified Vendors & Regional Warehouses</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <span style={{ color: 'var(--text-subtle)' }}>24/7 Enterprise Support</span>
            <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
            <span style={{ color: '#a5b4fc', fontWeight: 600 }}>Razorpay Test Mode Active</span>
          </div>

        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="glass-nav">
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px', gap: '1rem' }}>
          
          {/* Brand Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
            }}>
              <Store size={22} color="#ffffff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', lineHeight: 1 }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Shop</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#6366f1', letterSpacing: '-0.02em' }}>Stack</span>
              </div>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-subtle)', letterSpacing: '0.08em', fontWeight: 700, textTransform: 'uppercase' }}>Enterprise</span>
            </div>
          </Link>

          {/* Integrated Search Bar for Desktop (hidden on Auth pages) */}
          {!isAuthPage ? (
            <form onSubmit={handleSearchSubmit} className="hide-on-mobile" style={{ flex: '1 1 400px', maxWidth: '520px', display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.85)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '2px', overflow: 'hidden' }}>
              <select
                value={selectedCatId}
                onChange={handleCategorySelectChange}
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  color: 'var(--text-muted)',
                  border: 'none',
                  borderRight: '1px solid var(--border-color)',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                  maxWidth: '130px'
                }}
              >
                <option value="" style={{ background: '#0f172a', color: '#fff' }}>All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} style={{ background: '#0f172a', color: '#fff' }}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px' }} />
                <input
                  type="text"
                  placeholder="Search products, brands, SKUs..."
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    padding: '0.6rem 2rem 0.6rem 2.3rem',
                    fontSize: '0.86rem',
                    outline: 'none'
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '10px', background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <button type="submit" className="btn btn-primary btn-sm" style={{ padding: '0.5rem 0.9rem', borderRadius: 'var(--radius-sm)', marginRight: '2px' }}>
                <Search size={15} />
              </button>
            </form>
          ) : (
            <div style={{ flex: 1 }} />
          )}

          {/* Actions & Role Links (Desktop) */}
          <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            
            {/* My Orders Link */}
            {user && (
              <Link
                to="/orders"
                className="btn btn-secondary btn-sm"
                title="View order history"
              >
                <PackageCheck size={15} /> My Orders
              </Link>
            )}

            {isVendor && (
              <Link to="/vendor" className="btn btn-secondary btn-sm" style={{ borderColor: 'rgba(99, 102, 241, 0.4)', color: '#818cf8' }}>
                <Store size={14} /> Vendor
              </Link>
            )}

            {(user?.role === 'WAREHOUSE_STAFF' || isAdmin) && (
              <Link to="/warehouse-staff" className="btn btn-secondary btn-sm" style={{ borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}>
                <PackageCheck size={14} /> Staff
              </Link>
            )}

            {isAdmin && (
              <Link to="/admin" className="btn btn-secondary btn-sm" style={{ borderColor: 'rgba(236, 72, 153, 0.4)', color: '#f472b6' }}>
                <ShieldCheck size={14} /> Admin
              </Link>
            )}

            {/* Notification Bell Dropdown */}
            {user && (
              <div ref={notifRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={toggleNotifDropdown}
                  className="btn btn-secondary btn-sm"
                  style={{ position: 'relative', padding: '0.5rem 0.75rem' }}
                  title="Notifications"
                >
                  <Bell size={17} color="#fff" />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        background: '#ef4444',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '19px',
                        height: '19px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)'
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown Panel */}
                {notifOpen && (
                  <div className="notif-dropdown-panel">
                    {/* Header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Bell size={16} color="#818cf8" />
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Notifications</span>
                        {unreadCount > 0 && (
                          <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px' }}>
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllAsRead}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Check size={13} /> Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notification List */}
                    <div style={{ overflowY: 'auto', flex: 1, padding: '6px' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '36px 16px', textAlign: 'center', color: '#64748b' }}>
                          <Bell size={28} style={{ opacity: 0.4, margin: '0 auto 8px' }} />
                          <p style={{ margin: 0, fontSize: '0.85rem' }}>No notifications yet</p>
                          <p style={{ margin: '4px 0 0', fontSize: '0.75rem', opacity: 0.8 }}>Real-time updates will appear here</p>
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const isUnread = !n.isRead;
                          let typeColor = '#3b82f6';
                          let typeBg = 'rgba(59, 130, 246, 0.15)';
                          let typeLabel = 'Update';

                          if (n.type === 'ORDER_PLACED') {
                            typeColor = '#10b981';
                            typeBg = 'rgba(16, 185, 129, 0.15)';
                            typeLabel = 'Order Placed';
                          } else if (n.type === 'PAYMENT_SUCCESS') {
                            typeColor = '#6366f1';
                            typeBg = 'rgba(99, 102, 241, 0.15)';
                            typeLabel = 'Payment Success';
                          } else if (n.type === 'PAYMENT_FAILED') {
                            typeColor = '#ef4444';
                            typeBg = 'rgba(239, 68, 68, 0.15)';
                            typeLabel = 'Payment Failed';
                          } else if (n.type === 'ORDER_SHIPPED') {
                            typeColor = '#0284c7';
                            typeBg = 'rgba(2, 132, 199, 0.15)';
                            typeLabel = 'Shipped';
                          } else if (n.type === 'ORDER_DELIVERED') {
                            typeColor = '#16a34a';
                            typeBg = 'rgba(22, 163, 74, 0.15)';
                            typeLabel = 'Delivered';
                          } else if (n.type === 'REFUND_COMPLETED') {
                            typeColor = '#a855f7';
                            typeBg = 'rgba(168, 85, 247, 0.15)';
                            typeLabel = 'Refunded';
                          }

                          return (
                            <div
                              key={n.id}
                              onClick={() => handleMarkAsRead(n.id)}
                              style={{
                                padding: '10px 12px',
                                borderRadius: '8px',
                                marginBottom: '4px',
                                background: isUnread ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                                borderLeft: isUnread ? `3px solid ${typeColor}` : '3px solid transparent',
                                cursor: 'pointer',
                                transition: 'background 0.15s ease'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ background: typeBg, color: typeColor, fontSize: '0.68rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>
                                  {typeLabel}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                                  {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>
                              <div style={{ fontSize: '0.82rem', fontWeight: isUnread ? 700 : 500, color: isUnread ? '#fff' : '#94a3b8', lineHeight: 1.3 }}>
                                {n.subject}
                              </div>
                              {n.referenceId && (
                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '3px', fontFamily: 'monospace' }}>
                                  Ref: #{n.referenceId}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shopping Cart Trigger */}
            <Link
              to="/cart"
              className="btn btn-secondary btn-sm"
              style={{ position: 'relative', padding: '0.5rem 0.75rem' }}
              title="Shopping Cart"
            >
              <ShoppingCart size={17} color="#fff" />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '-6px',
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '19px',
                    height: '19px',
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px var(--primary-glow)'
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Login */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(255,255,255,0.04)', padding: '0.3rem 0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
                    {user.role === 'CUSTOMER' ? (user.fullName === 'Sarah Jenkins' || !user.fullName ? 'Chiru' : user.fullName) : (user.fullName || 'User')}
                  </div>
                  <RoleBadge role={user.role} />
                </div>
                
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="btn btn-secondary btn-sm"
                  title="Sign out"
                  style={{ padding: '0.35rem', borderRadius: '50%', width: '30px', height: '30px' }}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : isAuthPage ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Link to="/" className="btn btn-secondary btn-sm">Explore Store</Link>
                {location.pathname === '/login' ? (
                  <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
                ) : (
                  <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
              </div>
            )}

          </div>

          {/* Mobile Right Controls: Notification Bell, Search Toggle, Cart, Hamburger Menu */}
          <div className="show-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            
            {!isAuthPage && (
              <button
                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}
                title="Search"
              >
                <Search size={18} />
              </button>
            )}

            {/* Mobile Notification Bell */}
            {user && (
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={toggleNotifDropdown}
                  className="btn btn-secondary btn-sm"
                  style={{ position: 'relative', padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}
                  title="Notifications"
                >
                  <Bell size={18} color="#fff" />
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-4px',
                        right: '-4px',
                        background: '#ef4444',
                        color: '#fff',
                        borderRadius: '50%',
                        width: '17px',
                        height: '17px',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)'
                      }}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Mobile Notification Dropdown */}
                {notifOpen && (
                  <div className="notif-dropdown-panel" style={{ position: 'fixed', top: '65px', left: '12px', right: '12px', width: 'auto', maxWidth: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Bell size={15} color="#818cf8" />
                        <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#fff' }}>Notifications</span>
                        {unreadCount > 0 && (
                          <span style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: '9999px' }}>
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleMarkAllAsRead}
                            style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '0.72rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <Check size={12} /> Mark read
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setNotifOpen(false)}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>

                    <div style={{ overflowY: 'auto', maxHeight: '340px', padding: '6px' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '28px 14px', textAlign: 'center', color: '#64748b' }}>
                          <Bell size={24} style={{ opacity: 0.4, margin: '0 auto 6px' }} />
                          <p style={{ margin: 0, fontSize: '0.82rem' }}>No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkAsRead(n.id)}
                            style={{
                              padding: '8px 10px',
                              borderRadius: '6px',
                              marginBottom: '4px',
                              background: !n.isRead ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                              borderLeft: !n.isRead ? '3px solid #6366f1' : '3px solid transparent',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#818cf8' }}>{n.type}</span>
                              <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                                {n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.8rem', fontWeight: !n.isRead ? 700 : 500, color: !n.isRead ? '#fff' : '#94a3b8', lineHeight: 1.3 }}>
                              {n.subject}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link
              to="/cart"
              className="btn btn-secondary btn-sm"
              style={{ position: 'relative', padding: '0.45rem' }}
              title="Cart"
            >
              <ShoppingCart size={18} />
              {cartCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: 'var(--primary)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.45rem', borderRadius: 'var(--radius-sm)' }}
              title="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>

          </div>

        </div>

        {/* Mobile Search Expandable Bar */}
        {mobileSearchOpen && !isAuthPage && (
          <div className="show-on-mobile" style={{ padding: '0.6rem 1rem', background: '#0f172a', borderTop: '1px solid var(--border-color)' }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '10px' }} />
                <input
                  type="text"
                  placeholder="Search catalog..."
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    padding: '0.5rem 2rem 0.5rem 2.2rem',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '8px', background: 'none', border: 'none', color: 'var(--text-subtle)' }}
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Search</button>
            </form>
          </div>
        )}

        {/* Category Shortcuts Sub-Ribbon (Only displayed on Home Catalog page) */}
        {isHomePage && (
          <div style={{ background: 'rgba(15, 23, 42, 0.95)', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '0.4rem 0', fontSize: '0.82rem' }}>
            <div className="container horizontal-scroll-ribbon" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
              <button
                onClick={() => setSelectedCategory && setSelectedCategory(null)}
                style={{ background: 'none', border: 'none', color: selectedCategory === null ? 'var(--primary)' : '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0 }}
              >
                <Layers size={14} /> All Categories
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory && setSelectedCategory(cat.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: selectedCategory === cat.id ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: selectedCategory === cat.id ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    flexShrink: 0
                  }}
                >
                  {cat.name}
                </button>
              ))}

              <span style={{ color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem', flexShrink: 0, marginLeft: 'auto' }}>
                <Sparkles size={13} /> Deals
              </span>
            </div>
          </div>
        )}

      </nav>

      {/* Mobile Slide-in Drawer */}
      <div className={`mobile-nav-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu} />
      
      <div className={`mobile-nav-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Store size={22} color="#818cf8" />
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>ShopStack</span>
          </div>
          <button onClick={closeMobileMenu} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* User Card in Drawer */}
        {user ? (
          <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
              {user.role === 'CUSTOMER' ? (user.fullName === 'Sarah Jenkins' || !user.fullName ? 'Chiru' : user.fullName) : (user.fullName || 'User')}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{user.email}</div>
            <RoleBadge role={user.role} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <Link to="/login" onClick={closeMobileMenu} className="btn btn-secondary btn-mobile-full" style={{ justifyContent: 'center' }}>Log In</Link>
            <Link to="/register" onClick={closeMobileMenu} className="btn btn-primary btn-mobile-full" style={{ justifyContent: 'center' }}>Get Started</Link>
          </div>
        )}

        {/* Drawer Navigation Links */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          <Link to="/" onClick={closeMobileMenu} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}>
            <Store size={18} /> Catalog Home
          </Link>

          <Link to="/cart" onClick={closeMobileMenu} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}>
            <ShoppingCart size={18} /> Shopping Cart {cartCount > 0 ? `(${cartCount})` : ''}
          </Link>

          {user && (
            <Link to="/orders" onClick={closeMobileMenu} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem' }}>
              <PackageCheck size={18} /> My Orders & Tracking
            </Link>
          )}

          {isVendor && (
            <Link to="/vendor" onClick={closeMobileMenu} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', borderColor: 'rgba(99, 102, 241, 0.4)', color: '#818cf8' }}>
              <Store size={18} /> Vendor Portal
            </Link>
          )}

          {(user?.role === 'WAREHOUSE_STAFF' || isAdmin) && (
            <Link to="/warehouse-staff" onClick={closeMobileMenu} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', borderColor: 'rgba(56, 189, 248, 0.4)', color: '#38bdf8' }}>
              <PackageCheck size={18} /> Warehouse Staff Portal
            </Link>
          )}

          {isAdmin && (
            <Link to="/admin" onClick={closeMobileMenu} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '0.75rem 1rem', borderColor: 'rgba(236, 72, 153, 0.4)', color: '#f472b6' }}>
              <ShieldCheck size={18} /> Admin Dashboard
            </Link>
          )}
        </div>

        {/* Drawer Sign Out */}
        {user && (
          <button
            onClick={() => {
              logout();
              closeMobileMenu();
              navigate('/');
            }}
            className="btn btn-danger btn-mobile-full"
            style={{ marginTop: 'auto', justifyContent: 'center' }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        )}
      </div>

    </header>
  );
};

export default Navbar;

