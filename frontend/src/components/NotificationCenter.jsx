import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Trash2, 
  Tag, 
  Package, 
  Truck, 
  CreditCard, 
  Percent, 
  Gift, 
  Sparkles, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Copy, 
  X, 
  Store, 
  TrendingUp, 
  Box, 
  Layers,
  ShoppingBag,
  Info
} from 'lucide-react';

/**
 * Reusable, High-Polish Notification Center for ShopStack Dashboards
 * Supports Customer, Vendor, Admin, and Warehouse specific alerts and actions.
 */
export default function NotificationCenter({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onDismiss,
  role = 'CUSTOMER',
  panelTitle = 'Notifications',
  filterCategories = null, // e.g. ['all', 'order', 'coupon', 'system']
  buttonClassName = 'btn-icon-nav',
  buttonStyle = {},
  iconSize = 17,
  align = 'right',
  onNotificationClick
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Compute unread count
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Filter notifications based on active category
  const filteredNotifications = useMemo(() => {
    if (!activeTab || activeTab === 'all') return notifications;
    if (activeTab === 'unread') return notifications.filter(n => !n.read);
    const targetKey = String(activeTab).toLowerCase();
    return notifications.filter(n => String(n.category).toLowerCase() === targetKey);
  }, [notifications, activeTab]);

  // Copy coupon / promo code to clipboard
  const handleCopyCode = (e, code) => {
    e.stopPropagation();
    if (!code) return;
    navigator.clipboard?.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }).catch(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    });
  };

  // Notification Icon Resolver
  const renderNotificationIcon = (item) => {
    const iconType = item.iconType || item.category;
    switch (iconType) {
      case 'order_placed':
      case 'order':
        return (
          <div className="notif-icon-avatar bg-gradient-blue">
            <Package size={16} />
          </div>
        );
      case 'order_confirmed':
      case 'payment_success':
      case 'payment':
        return (
          <div className="notif-icon-avatar bg-gradient-emerald">
            <CreditCard size={16} />
          </div>
        );
      case 'order_shipped':
      case 'shipping':
        return (
          <div className="notif-icon-avatar bg-gradient-indigo">
            <Truck size={16} />
          </div>
        );
      case 'order_delivered':
        return (
          <div className="notif-icon-avatar bg-gradient-teal">
            <CheckCircle2 size={16} />
          </div>
        );
      case 'coupon':
      case 'offer':
      case 'discount':
        return (
          <div className="notif-icon-avatar bg-gradient-amber">
            <Gift size={16} />
          </div>
        );
      case 'product_approved':
      case 'product':
        return (
          <div className="notif-icon-avatar bg-gradient-emerald">
            <ShoppingBag size={16} />
          </div>
        );
      case 'product_pending':
      case 'admin_alert':
        return (
          <div className="notif-icon-avatar bg-gradient-rose">
            <ShieldAlert size={16} />
          </div>
        );
      case 'low_stock':
      case 'stock':
      case 'warning':
        return (
          <div className="notif-icon-avatar bg-gradient-orange">
            <AlertTriangle size={16} />
          </div>
        );
      case 'payout':
      case 'earnings':
        return (
          <div className="notif-icon-avatar bg-gradient-purple">
            <TrendingUp size={16} />
          </div>
        );
      case 'warehouse_alloc':
      case 'pick':
      case 'pack':
        return (
          <div className="notif-icon-avatar bg-gradient-cyan">
            <Box size={16} />
          </div>
        );
      default:
        return (
          <div className="notif-icon-avatar bg-gradient-slate">
            <Info size={16} />
          </div>
        );
    }
  };

  // Derive available filter tabs
  const tabs = useMemo(() => {
    if (filterCategories && Array.isArray(filterCategories)) {
      return filterCategories;
    }
    // Auto generate based on present categories
    const baseTabs = [
      { key: 'all', label: 'All', count: notifications.length },
    ];
    if (unreadCount > 0) {
      baseTabs.push({ key: 'unread', label: 'Unread', count: unreadCount });
    }
    
    // Categorize with deduplication and normalized keys
    const seenCats = new Set();
    notifications.forEach(n => {
      if (!n.category) return;
      const catKey = String(n.category).toLowerCase();
      if (!seenCats.has(catKey)) {
        seenCats.add(catKey);
        const label = catKey.charAt(0).toUpperCase() + catKey.slice(1);
        const count = notifications.filter(item => String(item.category).toLowerCase() === catKey).length;
        baseTabs.push({ key: catKey, label, count });
      }
    });
    return baseTabs;
  }, [notifications, filterCategories, unreadCount]);

  return (
    <div className="notification-bell-container" ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Bell Trigger Button */}
      <button 
        type="button"
        onClick={() => setIsOpen(prev => !prev)} 
        className={buttonClassName} 
        style={{ 
          position: 'relative', 
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...buttonStyle
        }}
        title="Notifications & Alerts"
        aria-label="View notifications and alerts"
        aria-expanded={isOpen}
      >
        <Bell size={iconSize} className={unreadCount > 0 ? 'bell-anim-ring' : ''} />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="notifications-dropdown modern-notif-panel" 
          style={{ 
            right: align === 'right' ? 0 : 'auto', 
            left: align === 'left' ? 0 : 'auto',
            width: 'min(420px, calc(100vw - 20px))',
            maxHeight: '540px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 9999
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="notif-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Bell size={15} style={{ color: 'var(--accent-blue)' }} />
                <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)', letterSpacing: '0.2px' }}>
                  {panelTitle}
                </strong>
              </div>
              {unreadCount > 0 && (
                <span className="badge badge-customer" style={{ fontSize: '10px', padding: '1px 7px' }}>
                  {unreadCount} new
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {unreadCount > 0 && onMarkAllAsRead && (
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  className="notif-header-action-btn"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  <span>Mark Read</span>
                </button>
              )}
              {notifications.length > 0 && onClearAll && (
                <button
                  type="button"
                  onClick={onClearAll}
                  className="notif-header-action-btn notif-clear-btn"
                  title="Clear all notifications"
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          {tabs.length > 1 && (
            <div className="notif-filter-bar">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`notif-filter-tab ${activeTab === tab.key ? 'active' : ''}`}
                >
                  <span>{tab.label}</span>
                  <span className="notif-tab-count">{tab.count}</span>
                </button>
              ))}
            </div>
          )}

          {/* Notifications List */}
          <div className="notif-list-container">
            {filteredNotifications.length === 0 ? (
              <div className="notif-empty-state">
                <div className="notif-empty-icon">
                  <Bell size={28} style={{ opacity: 0.4, color: 'var(--text-muted)' }} />
                </div>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '8px' }}>
                  No notifications
                </strong>
                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '4px 0 0 0', textAlign: 'center', maxWidth: '240px' }}>
                  {activeTab === 'unread' 
                    ? "You've read all your notifications!" 
                    : "You're all caught up! No active notifications."}
                </p>
              </div>
            ) : (
              filteredNotifications.map((item, idx) => (
                <div 
                  key={item.id ? `${item.id}_${idx}` : `notif_${idx}`}
                  className={`notif-card ${!item.read ? 'unread' : ''}`}
                  onClick={() => {
                    if (!item.read && onMarkAsRead) {
                      onMarkAsRead(item.id);
                    }
                    if (item.onAction) {
                      item.onAction();
                      setIsOpen(false);
                    } else if (onNotificationClick) {
                      onNotificationClick(item);
                      setIsOpen(false);
                    }
                  }}
                >
                  {/* Left Avatar Icon */}
                  <div style={{ flexShrink: 0 }}>
                    {renderNotificationIcon(item)}
                  </div>

                  {/* Main Content Area */}
                  <div className="notif-card-body">
                    <div className="notif-card-topline">
                      <span className="notif-card-title">{item.title}</span>
                      <span className="notif-card-time">{item.time || 'Recent'}</span>
                    </div>

                    <div className="notif-card-message">
                      {item.message}
                    </div>

                    {/* Meta Pill / Code / Action Buttons */}
                    <div className="notif-card-footer">
                      {item.codeToCopy && (
                        <button
                          type="button"
                          onClick={(e) => handleCopyCode(e, item.codeToCopy)}
                          className={`notif-copy-badge ${copiedCode === item.codeToCopy ? 'copied' : ''}`}
                          title="Click to copy coupon code"
                        >
                          <Copy size={11} />
                          <span>{copiedCode === item.codeToCopy ? 'Copied!' : item.codeToCopy}</span>
                        </button>
                      )}

                      {item.badge && !item.codeToCopy && (
                        <span className={`badge ${
                          item.badgeType === 'success' ? 'badge-verified' : 
                          item.badgeType === 'warning' ? 'badge-pending' : 
                          item.badgeType === 'danger' ? 'badge-rejected' : 
                          item.badgeType === 'purple' ? 'badge-vendor' : 'badge-customer'
                        }`} style={{ fontSize: '9.5px', padding: '1px 6px' }}>
                          {item.badge}
                        </span>
                      )}

                      {item.actionLabel && (
                        <span className="notif-action-hint">
                          {item.actionLabel} <ArrowRight size={11} />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Unread Glowing Dot / Dismiss */}
                  <div className="notif-card-side-actions" onClick={(e) => e.stopPropagation()}>
                    {!item.read && (
                      <span className="notif-unread-dot" title="Unread" />
                    )}
                    {onDismiss && (
                      <button
                        type="button"
                        onClick={() => onDismiss(item.id)}
                        className="notif-dismiss-btn"
                        title="Dismiss notification"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Info */}
          <div className="notif-footer">
            <span>ShopStack Live Notification Engine</span>
            <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
              {filteredNotifications.length} items
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
