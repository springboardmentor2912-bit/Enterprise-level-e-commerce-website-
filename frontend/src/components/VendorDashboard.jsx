import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  TrendingUp, Package, AlertTriangle, IndianRupee, Plus, Edit2, 
  Trash2, X, Check, Save, Truck, Calendar, ShoppingBag, Eye, EyeOff, Power, Layers,
  DollarSign, RefreshCw, CheckCircle, Clock, ShieldCheck, FileText, Search, Ticket, RotateCcw,
  Sun, Moon, ArrowLeft, ChevronDown, User, LogOut
} from 'lucide-react';
import ProductIcon from './ProductIcon';
import NotificationCenter from './NotificationCenter';
import { extractErrorMessage } from '../utils/errorHandler';
import { formatImageUrl } from '../utils/imageHelper';
import { 
  generateVendorNotifications, 
  markNotifAsRead, 
  markAllNotifsAsRead, 
  clearAllNotifs, 
  dismissNotif 
} from '../utils/notificationService';

const getWordCount = (text) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

export default function VendorDashboard({ user, orders = [], onGoToHome, onGoToProfile, theme, onToggleTheme, onLogout, initialTab = 'analytics' }) {
  const getSanitizedTab = (tab) => {
    if (typeof tab === 'string' && tab) {
      return tab === 'products' ? 'inventory' : tab;
    }
    return 'analytics';
  };

  const [activeTab, setActiveTab] = useState(getSanitizedTab(initialTab));
  const [showDropdown, setShowDropdown] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    setActiveTab(getSanitizedTab(initialTab));
  }, [initialTab]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [showDropdown]);
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalItemsSold: 0,
    averageOrderValue: 0,
    lowStockCount: 0,
    topSellingProducts: [],
    productsCount: 0
  });

  const [products, setProducts] = useState([]);
  const [vendorOrders, setVendorOrders] = useState([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'

  // Coupons states
  const [coupons, setCoupons] = useState([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(false);

  // Dynamic Vendor Notifications State
  const [notificationList, setNotificationList] = useState([]);

  const refreshNotifications = () => {
    const list = generateVendorNotifications({
      user,
      products,
      orders: vendorOrders,
      purchaseOrders: orders,
      coupons,
      onGoToTab: (tab) => {
        setActiveTab(tab);
      },
      onOpenPurchaseOrder: () => {
        if (onGoToProfile) onGoToProfile('orders');
        else if (onGoToHome) onGoToHome();
      }
    });
    setNotificationList(list);
  };

  useEffect(() => {
    refreshNotifications();
  }, [user, products, vendorOrders, orders, coupons]);

  const handleMarkNotifAsRead = (id) => {
    markNotifAsRead(id, user?.id || user?.email);
    refreshNotifications();
  };

  const handleMarkAllNotifsAsRead = () => {
    markAllNotifsAsRead(notificationList.map(n => n.id), user?.id || user?.email);
    refreshNotifications();
  };

  const handleClearAllNotifs = () => {
    clearAllNotifs(user?.id || user?.email, notificationList.map(n => n.id));
    refreshNotifications();
  };

  const handleDismissNotif = (id) => {
    dismissNotif(id, user?.id || user?.email);
    refreshNotifications();
  };
  
  // Settlements / Payouts state
  const [settlements, setSettlements] = useState([]);
  const [settlementsSummary, setSettlementsSummary] = useState({
    totalGross: 0,
    totalCommission: 0,
    totalNetPayout: 0,
    pendingPayout: 0,
    settledPayout: 0
  });
  const [isLoadingSettlements, setIsLoadingSettlements] = useState(false);
  const [settlementFilter, setSettlementFilter] = useState('ALL');
  
  // Dedicated Stock Management state (Zero Admin Approval Required)
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [quickStockValue, setQuickStockValue] = useState(0);
  const [isUpdatingStock, setIsUpdatingStock] = useState(false);
  
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    category: 'Electronics',
    brand: '',
    description: '',
    price: '',
    discountPercentage: 0,
    stock: '',
    couponsEnabled: true,
    imageUrl: '📦',
    images: [],
    vendorId: user.id,
    status: 'PENDING',
    rejectionReason: null
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [flashMessage, setFlashMessage] = useState({ type: '', text: '' });

  // Return Disputes states
  const [vendorReturns, setVendorReturns] = useState([]);
  const [isLoadingReturns, setIsLoadingReturns] = useState(false);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    fetchProducts();
    fetchVendorOrders();
    if (user?.id) {
      fetchVendorCoupons();
    }
  }, [user?.id]);

  const showFlash = (type, text) => {
    let msg = text;
    if (typeof text === 'object' && text !== null) {
      msg = extractErrorMessage(text);
    }
    setFlashMessage({ type, text: msg });
    setTimeout(() => setFlashMessage({ type: '', text: '' }), 3500);
  };

  const fetchVendorCoupons = async () => {
    setIsLoadingCoupons(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/coupons/vendor/${user.id}`);
      setCoupons(res.data);
    } catch (err) {
      console.error("Failed to fetch vendor coupons", err);
    } finally {
      setIsLoadingCoupons(false);
    }
  };

  const fetchReturns = async () => {
    setIsLoadingReturns(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin/refunds');
      // Filter returns belonging to orders containing vendor's items
      const matchingReturns = res.data.filter(r => 
        vendorOrders.some(vo => vo.orderId === r.orderId)
      );
      setVendorReturns(matchingReturns);
    } catch (err) {
      console.error("Failed to fetch return disputes", err);
    } finally {
      setIsLoadingReturns(false);
    }
  };

  const [showAcceptPromoModal, setShowAcceptPromoModal] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState(null);
  const [acceptPromoMode, setAcceptPromoMode] = useState('all'); // 'all' | 'specific'
  const [selectedPromoProductIds, setSelectedPromoProductIds] = useState([]);

  const handleApproveCoupon = async (code) => {
    setSelectedPromoCode(code);
    try {
      const res = await axios.get(`http://localhost:8080/api/coupons/${code}/products`);
      if (res.data && res.data.length > 0) {
        setSelectedPromoProductIds(res.data);
        setAcceptPromoMode('specific');
      } else {
        const initialSelected = products.filter(p => p.couponsEnabled !== false).map(p => p.id);
        setSelectedPromoProductIds(initialSelected);
        setAcceptPromoMode('all');
      }
    } catch (err) {
      console.error("Failed to load approved products for coupon", err);
      const initialSelected = products.filter(p => p.couponsEnabled !== false).map(p => p.id);
      setSelectedPromoProductIds(initialSelected);
      setAcceptPromoMode('all');
    }
    setShowAcceptPromoModal(true);
  };

  const submitApproveCoupon = async (code, applyToAll, productIds) => {
    try {
      await axios.post(`http://localhost:8080/api/coupons/vendor/${user.id}/approve`, {
        couponCode: code,
        applyToAll: applyToAll,
        productIds: productIds
      });
      fetchVendorCoupons();
      fetchProducts();
      setShowAcceptPromoModal(false);
      showFlash('success', `Approved coupon campaign "${code}" for your products.`);
    } catch (err) {
      console.error("Failed to approve coupon", err);
      showFlash('error', 'Failed to approve coupon.');
    }
  };

  const handleRejectCoupon = async (code) => {
    try {
      await axios.post(`http://localhost:8080/api/coupons/vendor/${user.id}/reject`, { couponCode: code });
      fetchVendorCoupons();
      showFlash('success', `Rejected coupon campaign "${code}".`);
    } catch (err) {
      console.error("Failed to reject coupon", err);
      showFlash('error', 'Failed to reject coupon.');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/vendor/${user.id}/analytics`);
      setAnalytics(res.data);
    } catch (err) {
      console.error("Failed to load analytics", err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/products/vendor/${user.id}`);
      setProducts(res.data);
    } catch (err) {
      console.error("Failed to load vendor products", err);
    }
  };

  const fetchVendorOrders = async () => {
    setIsLoadingOrders(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/vendor/${user.id}/orders`);
      setVendorOrders(res.data);
    } catch (err) {
      console.error("Failed to load vendor orders", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const fetchSettlements = async () => {
    setIsLoadingSettlements(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/vendor/${user.id}/settlements`);
      if (res.data) {
        setSettlements(res.data.settlements || []);
        setSettlementsSummary(res.data.summary || {
          totalGross: 0,
          totalCommission: 0,
          totalNetPayout: 0,
          pendingPayout: 0,
          settledPayout: 0
        });
      }
    } catch (err) {
      console.error("Failed to load vendor settlements", err);
    } finally {
      setIsLoadingSettlements(false);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode('add');
    setProductForm({
      id: null,
      name: '',
      category: 'Electronics',
      brand: '',
      description: '',
      price: '',
      discountPercentage: 0,
      stock: '10',
      couponsEnabled: true,
      returnPolicy: '7_DAYS',
      imageUrl: '📦',
      images: [],
      vendorId: user.id,
      status: 'PENDING',
      rejectionReason: null
    });
    setShowProductModal(true);
  };

  const handleOpenEditModal = (prod) => {
    setModalMode('edit');
    setProductForm({
      id: prod.id,
      name: prod.name,
      category: prod.category,
      brand: prod.brand || '',
      description: prod.description || '',
      price: prod.price,
      discountPercentage: prod.discountPercentage != null ? prod.discountPercentage : 0,
      stock: prod.stock,
      couponsEnabled: prod.couponsEnabled !== false,
      returnPolicy: prod.returnPolicy || '7_DAYS',
      imageUrl: prod.imageUrl || '📦',
      images: prod.images || [],
      vendorId: user.id,
      status: prod.status,
      rejectionReason: prod.rejectionReason || null
    });
    setShowProductModal(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    setIsUploadingImage(true);
    try {
      const res = await axios.post('http://localhost:8080/api/products/upload-images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const uploadedUrls = res.data.imageUrls || [];
      if (uploadedUrls.length > 0) {
        setProductForm(prev => {
          const newImages = [...prev.images, ...uploadedUrls];
          return {
            ...prev,
            images: newImages,
            // If imageUrl is default or empty, set the first uploaded image as cover
            imageUrl: (!prev.imageUrl || prev.imageUrl === '📦') ? uploadedUrls[0] : prev.imageUrl
          };
        });
        showFlash('success', `Successfully uploaded ${uploadedUrls.length} image(s) to server storage.`);
      }
    } catch (err) {
      console.error("Image upload failed:", err);
      showFlash('danger', 'Failed to upload image(s). Please make sure the backend is running.');
    } finally {
      setIsUploadingImage(false);
      e.target.value = null;
    }
  };

  const handleAddImageUrl = (url) => {
    if (!url.trim()) return;
    setProductForm(prev => {
      const newImages = [...prev.images, url.trim()];
      return {
        ...prev,
        images: newImages,
        imageUrl: prev.imageUrl === '📦' ? url.trim() : prev.imageUrl
      };
    });
  };

  const handleRemoveImage = async (indexToRemove) => {
    const imageToRemove = productForm.images[indexToRemove];

    // Optimistically update form state
    setProductForm(prev => {
      const newImages = prev.images.filter((_, idx) => idx !== indexToRemove);
      let newImageUrl = prev.imageUrl;
      // If we removed the primary image, set primary to the first available image, or fallback to '📦'
      if (prev.imageUrl === prev.images[indexToRemove]) {
        newImageUrl = newImages.length > 0 ? newImages[0] : '📦';
      }
      return {
        ...prev,
        images: newImages,
        imageUrl: newImageUrl
      };
    });

    // If the image was stored on the server disk, delete the physical file immediately
    if (imageToRemove && imageToRemove.includes('/uploads/products/')) {
      try {
        await axios.delete('http://localhost:8080/api/products/delete-image', {
          params: { imageUrl: imageToRemove }
        });
        showFlash('success', 'Image removed and deleted from folder storage.');
      } catch (err) {
        console.error("Failed to delete image file from server:", err);
      }
    }
  };

  const handleSetPrimaryImage = (img) => {
    setProductForm(prev => ({
      ...prev,
      imageUrl: img
    }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name.trim() || !productForm.price || (modalMode === 'add' && productForm.stock === '')) {
      showFlash('error', 'Please fill in all required fields.');
      return;
    }

    if (getWordCount(productForm.name) > 50) {
      showFlash('error', 'Product name cannot exceed 50 words.');
      return;
    }

    if (getWordCount(productForm.description) > 500) {
      showFlash('error', 'Product description cannot exceed 500 words.');
      return;
    }

    const payload = {
      ...productForm,
      price: parseFloat(productForm.price),
      discountPercentage: Math.max(0, Math.min(100, parseFloat(productForm.discountPercentage) || 0)),
      stock: modalMode === 'add' ? parseInt(productForm.stock || 0) : (productForm.stock ?? 0),
      status: 'PENDING'
    };

    try {
      if (modalMode === 'add') {
        await axios.post('http://localhost:8080/api/products', payload);
        showFlash('success', 'Product listed! Status is PENDING awaiting Admin Approval.');
      } else {
        await axios.put(`http://localhost:8080/api/products/${productForm.id}`, payload);
        showFlash('success', 'Product & details updated! Status is now PENDING awaiting Admin Approval.');
      }
      setShowProductModal(false);
      fetchProducts();
      fetchAnalytics();
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to save product details.');
    }
  };

  const handleOpenStockModal = (prod) => {
    setStockModalProduct(prod);
    setQuickStockValue(prod.stock || 0);
  };

  const handleSaveStockModal = async (e) => {
    if (e) e.preventDefault();
    if (!stockModalProduct) return;
    const newStock = parseInt(quickStockValue);
    if (isNaN(newStock) || newStock < 0) {
      showFlash('error', 'Stock quantity must be a non-negative number.');
      return;
    }
    setIsUpdatingStock(true);
    try {
      await axios.put(`http://localhost:8080/api/products/${stockModalProduct.id}/stock`, { stock: newStock });
      setProducts(prev => prev.map(p => p.id === stockModalProduct.id ? { ...p, stock: newStock } : p));
      fetchAnalytics();
      showFlash('success', `Stock inventory updated to ${newStock} units for "${stockModalProduct.name}". (No approval needed)`);
      setStockModalProduct(null);
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to update stock.');
    } finally {
      setIsUpdatingStock(false);
    }
  };

  const handleUpdateProductStock = async (productId, newStock) => {
    if (newStock < 0) return;
    try {
      await axios.put(`http://localhost:8080/api/products/${productId}/stock`, { stock: newStock });
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: newStock } : p));
      fetchAnalytics();
      showFlash('success', 'Stock updated instantly (no approval needed).');
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to update stock.');
    }
  };

  const handleToggleProductStatus = async (productId, currentStatus) => {
    const isCurrentlyDisabled = currentStatus === 'DISABLED';
    const actionName = isCurrentlyDisabled ? 'enable' : 'disable';
    if (!window.confirm(`Are you sure you want to ${actionName} this product? ${isCurrentlyDisabled ? 'It will become active and visible in the store.' : 'It will be hidden from customer browsing and search.'}`)) return;
    try {
      const res = await axios.put(`http://localhost:8080/api/products/${productId}/toggle-status`);
      const newStatus = res.data.status;
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: newStatus } : p));
      showFlash('success', `Product ${isCurrentlyDisabled ? 'enabled and active on store' : 'disabled from customer store'}.`);
      fetchProducts();
      fetchAnalytics();
    } catch (err) {
      showFlash('error', `Failed to ${actionName} product.`);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:8080/api/vendor/orders/${orderId}/status`, { status: newStatus });
      showFlash('success', `Order ${orderId} updated to ${newStatus}`);
      fetchVendorOrders();
      fetchAnalytics();
    } catch (err) {
      showFlash('error', 'Failed to update order status');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Toast Flash Alert */}
      {flashMessage.text && (
        <div className={`toast-notification ${flashMessage.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          <div className="toast-icon-container">
            {flashMessage.type === 'success' ? <Check size={18} /> : <X size={18} />}
          </div>
          <div>
            <strong className="toast-message-title">{flashMessage.type === 'success' ? 'Success' : 'Error'}</strong>
            <div className="toast-message-desc">{flashMessage.text}</div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="navbar">
        <div className="nav-left">
          <h1 className="nav-logo" onClick={onGoToHome} style={{ cursor: 'pointer', margin: 0, fontSize: '20px' }}>
            ShopStack <span className="hide-on-mobile badge badge-vendor" style={{ fontSize: '9px', padding: '1px 5px', verticalAlign: 'middle', marginLeft: '4px' }}>VENDOR</span>
          </h1>
        </div>

        <div className="nav-right">
          <button 
            type="button"
            onClick={onGoToHome} 
            className="btn-store-nav"
            title="Browse ShopStack Storefront"
          >
            <ArrowLeft size={15} style={{ flexShrink: 0 }} />
            <span className="hide-on-mobile">Browse Store</span>
            <span className="show-on-mobile">Store</span>
          </button>

          {/* Vendor Notifications Center */}
          <NotificationCenter
            notifications={notificationList}
            onMarkAsRead={handleMarkNotifAsRead}
            onMarkAllAsRead={handleMarkAllNotifsAsRead}
            onClearAll={handleClearAllNotifs}
            onDismiss={handleDismissNotif}
            role="VENDOR"
            panelTitle="Merchant & Purchase Alerts"
            iconSize={16}
            align="right"
          />

          <div 
            className="nav-user-menu"
            ref={userMenuRef}
          >
            <div 
              className="nav-user-trigger"
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(prev => !prev);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="nav-user-avatar">
                <User size={14} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
              </div>
              <strong className="nav-user-name">{user?.fullName || 'Vendor'}</strong>
              <ChevronDown 
                size={13} 
                className="nav-user-chevron"
                style={{ 
                  transform: showDropdown ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </div>

            {showDropdown && (
              <div className="nav-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="dropdown-header" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Merchant Console</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.fullName || 'Vendor'}
                    </strong>
                    <span className="badge badge-vendor" style={{ fontSize: '9px', padding: '1px 6px' }}>
                      VENDOR
                    </span>
                  </div>
                </div>

                {onGoToProfile && (
                  <div 
                    onClick={() => { 
                      setShowDropdown(false); 
                      onGoToProfile('orders'); 
                    }} 
                    className="dropdown-item"
                  >
                    <User size={16} style={{ flexShrink: 0 }} /> <span>My Purchases & Profile</span>
                  </div>
                )}

                <div onClick={() => { setShowDropdown(false); onGoToHome(); }} className="dropdown-item">
                  <ArrowLeft size={16} style={{ flexShrink: 0 }} /> <span>Browse Store</span>
                </div>

                <div className="dropdown-divider" />

                {/* Light / Dark Mode Toggle Button */}
                {onToggleTheme && (
                  <div 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onToggleTheme(); 
                    }} 
                    className="dropdown-item" 
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {theme === 'dark' ? (
                        <Sun size={16} style={{ color: '#fbbf24', flexShrink: 0 }} />
                      ) : (
                        <Moon size={16} style={{ color: '#6366f1', flexShrink: 0 }} />
                      )}
                      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </div>
                    <span 
                      style={{ 
                        fontSize: '10px', 
                        fontWeight: '700', 
                        padding: '2px 6px', 
                        borderRadius: '4px', 
                        background: 'var(--bg-input)', 
                        color: 'var(--text-secondary)',
                        border: '1px solid var(--border-light)' 
                      }}
                    >
                      {theme === 'dark' ? 'DARK' : 'LIGHT'}
                    </span>
                  </div>
                )}

                <div className="dropdown-divider" />

                {/* Logout Button */}
                {onLogout && (
                  <div 
                    onClick={() => { 
                      setShowDropdown(false); 
                      onLogout(); 
                    }} 
                    className="dropdown-item dropdown-item-danger" 
                    style={{ color: 'var(--accent-rose)', fontWeight: '600' }}
                  >
                    <LogOut size={16} style={{ flexShrink: 0 }} /> <span>Logout</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Sidebar Navigation */}
        <div className="sidebar">
          <div 
            onClick={() => setActiveTab('analytics')} 
            className={`sidebar-item ${activeTab === 'analytics' ? 'sidebar-item-active' : ''}`}
          >
            <TrendingUp size={18} /> Sales & Analytics
          </div>
          <div 
            onClick={() => setActiveTab('inventory')} 
            className={`sidebar-item ${activeTab === 'inventory' ? 'sidebar-item-active' : ''}`}
          >
            <Package size={18} /> Catalog Products ({products.length})
          </div>
          <div 
            onClick={() => setActiveTab('orders')} 
            className={`sidebar-item ${activeTab === 'orders' ? 'sidebar-item-active' : ''}`}
          >
            <ShoppingBag size={18} /> Customer Orders ({vendorOrders.length})
          </div>
          <div 
            onClick={() => { setActiveTab('settlements'); fetchSettlements(); }} 
            className={`sidebar-item ${activeTab === 'settlements' ? 'sidebar-item-active' : ''}`}
          >
            <IndianRupee size={18} /> Settlements & Payouts ({settlements.length})
          </div>
          <div 
            onClick={() => { setActiveTab('coupons'); fetchVendorCoupons(); }} 
            className={`sidebar-item ${activeTab === 'coupons' ? 'sidebar-item-active' : ''}`}
          >
            <Ticket size={18} /> Promotions & Coupons
          </div>
          <div 
            onClick={() => { setActiveTab('returns'); fetchReturns(); }} 
            className={`sidebar-item ${activeTab === 'returns' ? 'sidebar-item-active' : ''}`}
          >
            <RotateCcw size={18} /> Return QC & Disputes ({vendorReturns.length})
          </div>
        </div>

        {/* Content Area */}
        <div className="main-content">
          {activeTab === 'analytics' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Dashboard Overview</h2>
              
              {/* Analytics Metric Cards */}
              <div className="analytics-grid">
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Total Sales Revenue</span>
                    <IndianRupee size={18} style={{ color: 'var(--accent-emerald)' }} />
                  </div>
                  <div className="analytics-card-value">₹{analytics.totalRevenue}</div>
                  <div className="analytics-card-desc">All-time customer sales</div>
                </div>

                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Total Orders</span>
                    <ShoppingBag size={18} style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <div className="analytics-card-value">{analytics.totalOrders}</div>
                  <div className="analytics-card-desc">Distinct order checkouts</div>
                </div>

                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Average Order Value</span>
                    <TrendingUp size={18} style={{ color: 'var(--accent-purple)' }} />
                  </div>
                  <div className="analytics-card-value">₹{analytics.averageOrderValue}</div>
                  <div className="analytics-card-desc">Average billing amount</div>
                </div>

                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Low Stock Items</span>
                    <AlertTriangle size={18} style={{ color: analytics.lowStockCount > 0 ? 'var(--accent-rose)' : 'var(--text-muted)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ color: analytics.lowStockCount > 0 ? 'var(--accent-rose)' : 'inherit' }}>
                    {analytics.lowStockCount}
                  </div>
                  <div className="analytics-card-desc">Products with Stock &lt; 5</div>
                </div>
              </div>

              {/* Top Selling Products List */}
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Top Selling Products</h3>
                {analytics.topSellingProducts.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No sales data available yet.</p>
                ) : (
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Product Name</th>
                          <th style={{ textAlign: 'right' }}>Total Units Sold</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.topSellingProducts.map((p, idx) => (
                          <tr key={idx}>
                            <td>{p.name}</td>
                            <td style={{ textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-blue)' }}>{p.salesCount} units</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Product Inventory</h2>
                <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                  <Plus size={16} /> List New Product
                </button>
              </div>

              {products.length === 0 ? (
                <div className="cart-empty-state">
                  <Package className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>You haven't listed any products yet. Click the button above to list one!</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ minWidth: '1280px' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>Icon</th>
                        <th style={{ minWidth: '220px' }}>Product Name</th>
                        <th style={{ minWidth: '130px' }}>Category</th>
                        <th style={{ minWidth: '130px' }}>Regular Price</th>
                        <th style={{ minWidth: '110px' }}>Discount</th>
                        <th style={{ minWidth: '140px' }}>Final Price</th>
                        <th style={{ minWidth: '160px', textAlign: 'center' }}>Stock Level</th>
                        <th style={{ minWidth: '170px', textAlign: 'center' }}>Approval Status</th>
                        <th style={{ textAlign: 'center', minWidth: '260px', width: '260px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((prod) => {
                        const disc = Number(prod.discountPercentage) || 0;
                        const finalP = prod.finalPrice != null ? prod.finalPrice : (disc > 0 ? Math.round(prod.price * (1 - disc / 100) * 100) / 100 : prod.price);
                        const savings = Math.max(0, Math.round((prod.price - finalP) * 100) / 100);
                        return (
                        <tr key={prod.id}>
                          <td style={{ fontSize: '20px', textAlign: 'center' }}>
                            <div style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', overflow: 'hidden', margin: '0 auto', background: 'var(--bg-input)' }}>
                              {prod.imageUrl && formatImageUrl(prod.imageUrl).length > 4 ? (
                                <img src={formatImageUrl(prod.imageUrl)} alt={prod.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              ) : (
                                <ProductIcon name={prod.name} category={prod.category} size={18} />
                              )}
                            </div>
                          </td>
                          <td style={{ fontWeight: '600', fontSize: '13.5px' }}>{prod.name}</td>
                          <td>
                            <span className="badge badge-customer">{prod.category}</span>
                          </td>
                          <td>
                            {disc > 0 ? (
                              <span style={{ fontSize: '13px', fontWeight: '600', textDecoration: 'line-through', color: '#94a3b8', textDecorationColor: '#ef4444', textDecorationThickness: '1.5px' }}>
                                ₹{Number(prod.price).toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span style={{ fontSize: '14px', fontWeight: '700' }}>
                                ₹{Number(prod.price).toLocaleString('en-IN')}
                              </span>
                            )}
                          </td>
                          <td>
                            {disc > 0 ? (
                              <span style={{ 
                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                                color: '#ffffff', 
                                fontWeight: '800', 
                                fontSize: '11px', 
                                padding: '3px 8px', 
                                borderRadius: '4px',
                                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)',
                                display: 'inline-block'
                              }}>
                                {disc}% OFF
                              </span>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>0% (No discount)</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontWeight: '900', fontSize: '15px', color: 'var(--text-primary)' }}>
                                ₹{Number(finalP).toLocaleString('en-IN')}
                              </span>
                              {disc > 0 && (
                                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '700' }}>
                                  Save ₹{Number(savings).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', minWidth: '160px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              <button 
                                type="button"
                                onClick={() => handleUpdateProductStock(prod.id, prod.stock - 1)}
                                className="btn-icon-only"
                                style={{ padding: '2px', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                disabled={prod.stock <= 0}
                                title="Quick decrease stock by 1 (Instant update)"
                              >
                                -
                              </button>
                              <span style={{ 
                                minWidth: '42px',
                                textAlign: 'center',
                                fontWeight: prod.stock < 5 ? 'bold' : '700',
                                fontSize: '14px',
                                color: prod.stock < 5 ? 'var(--accent-rose)' : 'inherit'
                              }}>
                                {prod.stock}
                              </span>
                              <button 
                                type="button"
                                onClick={() => handleUpdateProductStock(prod.id, prod.stock + 1)}
                                className="btn-icon-only"
                                style={{ padding: '2px', width: '24px', height: '24px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                                title="Quick increase stock by 1 (Instant update)"
                              >
                                +
                              </button>
                            </div>
                            <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'center' }}>
                              {prod.stock <= 0 ? (
                                <span className="badge badge-rejected" style={{ fontSize: '10px', padding: '2px 8px' }}>Out of Stock</span>
                              ) : prod.stock < 5 ? (
                                <span className="badge badge-pending" style={{ fontSize: '10px', padding: '2px 8px' }}>Only {prod.stock} left</span>
                              ) : (
                                <span className="badge badge-approved" style={{ fontSize: '10px', padding: '2px 8px' }}>In Stock</span>
                              )}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', minWidth: '170px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <span className={`badge ${
                                prod.status === 'APPROVED' ? 'badge-approved' : 
                                prod.status === 'REJECTED' ? 'badge-rejected' : 
                                prod.status === 'DISABLED' ? 'badge-pending' : 'badge-pending'
                              }`} style={{ 
                                fontWeight: '700', 
                                padding: '3px 10px',
                                ...(prod.status === 'DISABLED' ? { background: 'rgba(148, 163, 184, 0.15)', color: '#64748b', border: '1px solid rgba(148, 163, 184, 0.3)' } : {}) 
                              }}>
                                {prod.status === 'APPROVED' ? 'APPROVED' : 
                                 prod.status === 'REJECTED' ? 'REJECTED' : 
                                 prod.status === 'DISABLED' ? 'DISABLED' : 'PENDING APPROVAL'}
                              </span>
                              {prod.status === 'PENDING' && (
                                <div style={{ fontSize: '10px', color: 'var(--accent-amber)', fontWeight: '600' }}>
                                  Awaiting Admin Approval
                                </div>
                              )}
                              {prod.status === 'DISABLED' && (
                                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '600' }}>
                                  Hidden from Store
                                </div>
                              )}
                              {prod.status === 'REJECTED' && prod.rejectionReason && (
                                <div style={{ fontSize: '11px', color: 'var(--accent-rose)', maxWidth: '160px', lineBreak: 'anywhere' }}>
                                  <strong>Reason:</strong> {prod.rejectionReason}
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', minWidth: '260px', width: '260px' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', flexWrap: 'nowrap' }}>
                              <button 
                                type="button"
                                onClick={() => handleOpenStockModal(prod)} 
                                className="btn btn-secondary" 
                                title="Manage Stock (Instant - No Admin Approval Required)"
                                style={{ 
                                  padding: '6px 12px', 
                                  fontSize: '12px', 
                                  fontWeight: '600',
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '5px', 
                                  color: 'var(--accent-teal)', 
                                  borderColor: 'rgba(20, 184, 166, 0.3)',
                                  background: 'rgba(20, 184, 166, 0.08)',
                                  height: '32px',
                                  flexShrink: 0
                                }}
                              >
                                <Layers size={14} /> Stock
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleOpenEditModal(prod)} 
                                className="btn btn-secondary" 
                                title="Edit Product Details"
                                style={{ 
                                  padding: '6px 12px', 
                                  fontSize: '12px', 
                                  fontWeight: '600',
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '5px', 
                                  color: 'var(--accent-blue)', 
                                  borderColor: 'rgba(59, 130, 246, 0.3)',
                                  background: 'rgba(59, 130, 246, 0.08)',
                                  height: '32px',
                                  flexShrink: 0
                                }}
                              >
                                <Edit2 size={14} /> Edit
                              </button>
                              <button 
                                type="button"
                                onClick={() => handleToggleProductStatus(prod.id, prod.status)} 
                                className="btn btn-secondary" 
                                title={prod.status === 'DISABLED' ? "Enable Product (Make live on store)" : "Disable Product (Hide from customers)"}
                                style={{ 
                                  padding: '6px 12px', 
                                  fontSize: '12px', 
                                  fontWeight: '600',
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  gap: '5px',
                                  color: prod.status === 'DISABLED' ? '#10b981' : '#f59e0b',
                                  borderColor: prod.status === 'DISABLED' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)',
                                  background: prod.status === 'DISABLED' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
                                  height: '32px',
                                  flexShrink: 0
                                }}
                              >
                                {prod.status === 'DISABLED' ? <Eye size={14} /> : <EyeOff size={14} />}
                                {prod.status === 'DISABLED' ? 'Enable' : 'Disable'}
                              </button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Merchant Customer Orders</h2>
                <button 
                  type="button" 
                  onClick={fetchVendorOrders} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingOrders ? "spin-animation" : ""} /> Refresh Orders
                </button>
              </div>
              
              {vendorOrders.length === 0 ? (
                <div className="cart-empty-state">
                  <ShoppingBag className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No orders received for your items yet.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ minWidth: '1150px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '130px' }}>Date</th>
                        <th style={{ minWidth: '140px' }}>Order ID</th>
                        <th style={{ minWidth: '220px' }}>Product</th>
                        <th style={{ minWidth: '110px' }}>Quantity</th>
                        <th style={{ minWidth: '130px' }}>Total Paid</th>
                        <th style={{ minWidth: '130px', textAlign: 'center' }}>Status</th>
                        <th style={{ textAlign: 'center', minWidth: '160px', width: '160px' }}>Shipping Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorOrders.map((ord) => (
                        <tr key={ord.orderItemId}>
                          <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Calendar size={12} />
                              {ord.date}
                            </div>
                          </td>
                          <td style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{ord.orderId}</td>
                          <td style={{ fontWeight: '600' }}>{ord.productName}</td>
                          <td>{ord.quantity}x</td>
                          <td style={{ fontWeight: '700' }}>₹{ord.totalAmount}</td>
                          <td>
                            <span className={`badge ${
                              ord.status === 'DELIVERED' ? 'badge-approved' : 
                              ord.status === 'SHIPPED' ? 'badge-pending' : 'badge-customer'
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td>
                            {ord.status === 'PENDING_CONFIRMATION' ? (
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrderStatus(ord.orderId, 'CONFIRMED')}
                                  className="btn btn-primary"
                                  style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center' }}
                                >
                                  Accept Order
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateOrderStatus(ord.orderId, 'CANCELLED')}
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 8px', fontSize: '11px', color: 'var(--accent-rose)' }}
                                >
                                  Reject
                                </button>
                              </div>
                            ) : ord.status === 'CONFIRMED' ? (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(ord.orderId, 'CANCELLED')}
                                className="btn btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--accent-rose)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
                              >
                                Cancel Order
                              </button>
                            ) : (
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                Warehouse Controlled
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settlements' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Vendor Settlement & Payout Ledger</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Transparent earnings breakdown per sold item with automatic platform commission deduction (10%).
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchSettlements} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingSettlements ? "spin-animation" : ""} /> Refresh
                </button>
              </div>

              {/* Settlement Summary Cards */}
              <div className="analytics-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Gross Sales Volume</span>
                    <DollarSign size={16} style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px' }}>
                    ₹{settlementsSummary.totalGross?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <div className="analytics-card-desc">Total sales before commission</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Platform Fee (10%)</span>
                    <ShieldCheck size={16} style={{ color: 'var(--accent-rose)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px' }}>
                    ₹{settlementsSummary.totalCommission?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <div className="analytics-card-desc">ShopStack commission</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Net Payout Earned</span>
                    <IndianRupee size={16} style={{ color: 'var(--accent-teal)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px' }}>
                    ₹{settlementsSummary.totalNetPayout?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <div className="analytics-card-desc">Total vendor earnings</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Pending Payouts</span>
                    <Clock size={16} style={{ color: '#f59e0b' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#f59e0b' }}>
                    ₹{settlementsSummary.pendingPayout?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <div className="analytics-card-desc">Awaiting admin settlement</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Settled Payouts</span>
                    <CheckCircle size={16} style={{ color: 'var(--accent-emerald)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: 'var(--accent-emerald)' }}>
                    ₹{settlementsSummary.settledPayout?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <div className="analytics-card-desc">Successfully transferred</div>
                </div>
              </div>

              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {['ALL', 'PENDING', 'SETTLED', 'REFUNDED'].map(filter => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSettlementFilter(filter)}
                    className={`btn ${settlementFilter === filter ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '12px', padding: '6px 14px' }}
                  >
                    {filter === 'ALL' ? `All Records (${settlements.length})` : 
                     filter === 'PENDING' ? `Pending (${settlements.filter(s => s.status === 'PENDING').length})` : 
                     filter === 'SETTLED' ? `Settled (${settlements.filter(s => s.status === 'SETTLED').length})` : 
                     `Refunded (${settlements.filter(s => s.status === 'REFUNDED').length})`}
                  </button>
                ))}
              </div>

              {/* Settlement Records Table */}
              {settlements.length === 0 ? (
                <div className="cart-empty-state">
                  <IndianRupee className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No settlement records found. Settlements are automatically created when paid orders are placed.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ minWidth: '1150px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '130px' }}>Date</th>
                        <th style={{ minWidth: '140px' }}>Order ID</th>
                        <th style={{ minWidth: '220px' }}>Product Item</th>
                        <th style={{ minWidth: '130px' }}>Gross Sale</th>
                        <th style={{ minWidth: '140px' }}>Commission</th>
                        <th style={{ minWidth: '140px' }}>Net Payout</th>
                        <th style={{ minWidth: '130px', textAlign: 'center' }}>Status</th>
                        <th style={{ minWidth: '130px' }}>Settled On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlements
                        .filter(s => settlementFilter === 'ALL' || s.status === settlementFilter)
                        .map((s) => {
                          const isSettled = s.status === 'SETTLED';
                          const isRefunded = s.status === 'REFUNDED';
                          return (
                            <tr key={s.id}>
                              <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                {s.createdAt || 'Recent'}
                              </td>
                              <td style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--accent-blue)' }}>
                                {s.orderId}
                              </td>
                              <td style={{ fontWeight: '600', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {s.productName || `Item #${s.orderItemId}`}
                              </td>
                              <td style={{ fontWeight: '700' }}>
                                ₹{Number(s.grossAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </td>
                              <td style={{ color: isRefunded ? 'var(--text-muted)' : 'var(--accent-rose)', fontSize: '13px' }}>
                                {isRefunded ? '₹0.00 (Reversed)' : `-₹${Number(s.commissionAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${s.commissionPercentage}%)`}
                              </td>
                              <td style={{ fontWeight: '800', color: isRefunded ? 'var(--text-muted)' : 'var(--accent-emerald)', fontSize: '14px' }}>
                                {isRefunded ? '₹0.00' : `₹${Number(s.netPayoutAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {isRefunded ? (
                                  <span className="badge badge-rejected" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: '700' }}>
                                    <RotateCcw size={11} /> REFUNDED
                                  </span>
                                ) : isSettled ? (
                                  <span className="badge badge-approved" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Check size={12} /> SETTLED
                                  </span>
                                ) : (
                                  <span className="badge" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                    <Clock size={12} /> PENDING
                                  </span>
                                )}
                              </td>
                              <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {isRefunded ? 'Order Refunded' : isSettled ? (s.settledAt || s.createdAt || 'Settled') : 'Pending Disbursal'}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: PROMOTIONS & COUPONS */}
          {activeTab === 'coupons' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Promotional Coupon Campaigns</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Confirm or reject admin-launched coupon promotions for your store. Customers can only redeem coupons on your items after you approve them.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchVendorCoupons} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingCoupons ? "spin-animation" : ""} /> Refresh Campaigns
                </button>
              </div>

              {isLoadingCoupons ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  Loading coupon campaigns...
                </div>
              ) : coupons.length === 0 ? (
                <div className="cart-empty-state">
                  <Ticket className="cart-empty-icon" style={{ opacity: 0.2, width: '48px', height: '48px' }} />
                  <p>No coupon campaigns currently active on the platform.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ minWidth: '1100px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '140px' }}>Promo Code</th>
                        <th style={{ minWidth: '160px' }}>Discount Info</th>
                        <th style={{ minWidth: '160px' }}>Min Order Required</th>
                        <th style={{ minWidth: '180px' }}>Campaign Dates</th>
                        <th style={{ minWidth: '160px', textAlign: 'center' }}>Your Status</th>
                        <th style={{ textAlign: 'center', minWidth: '180px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((coupon) => {
                        const isApproved = coupon.approvalStatus === 'APPROVED';
                        const isRejected = coupon.approvalStatus === 'REJECTED';
                        const isPending = !isApproved && !isRejected;

                        return (
                          <tr key={coupon.id}>
                            <td>
                              <strong style={{ color: 'var(--accent-teal)', fontSize: '14px', letterSpacing: '0.5px' }}>{coupon.code}</strong>
                            </td>
                            <td>
                              <span style={{ fontWeight: 'bold' }}>
                                {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% Off` : `₹${coupon.discountValue} Flat Off`}
                              </span>
                              {coupon.maxDiscount && (
                                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                                  Cap: ₹{coupon.maxDiscount}
                                </span>
                              )}
                            </td>
                            <td>
                              {coupon.minOrderAmount ? `₹${coupon.minOrderAmount}` : 'No Minimum'}
                            </td>
                            <td style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                              <div>Start: {coupon.startDate ? coupon.startDate.replace('T', ' ').substring(0, 16) : ''}</div>
                              <div>Expiry: {coupon.expiryDate ? coupon.expiryDate.replace('T', ' ').substring(0, 16) : ''}</div>
                            </td>
                            <td>
                              {isApproved && (
                                <span className="badge badge-approved" style={{ fontSize: '11px' }}>
                                  ACCEPTED
                                </span>
                              )}
                              {isRejected && (
                                <span className="badge badge-rejected" style={{ fontSize: '11px' }}>
                                  REJECTED
                                </span>
                              )}
                              {isPending && (
                                <span className="badge" style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                  AWAITING CONFIRMATION
                                </span>
                              )}
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  type="button" 
                                  onClick={() => handleApproveCoupon(coupon.code)}
                                  className="btn btn-primary"
                                  style={{ padding: '4px 10px', fontSize: '12px', background: isApproved ? 'var(--bg-card-hover)' : 'var(--accent-teal)', border: isApproved ? '1px solid var(--border-light)' : 'none', color: isApproved ? 'var(--text-muted)' : '#fff' }}
                                  disabled={isApproved}
                                >
                                  {isApproved ? 'Accepted' : 'Accept'}
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => handleRejectCoupon(coupon.code)}
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '12px', color: isRejected ? 'var(--text-muted)' : 'var(--accent-rose)' }}
                                  disabled={isRejected}
                                >
                                  {isRejected ? 'Rejected' : 'Reject'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: RETURNS QC & GOVERNANCE */}
          {activeTab === 'returns' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0 }}>Customer Return Requests</h2>
                <button 
                  type="button" 
                  onClick={async () => {
                    await fetchVendorOrders();
                    await fetchReturns();
                  }} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingReturns || isLoadingOrders ? "spin-animation" : ""} /> Refresh Returns
                </button>
              </div>
              {vendorReturns.length === 0 ? (
                <div className="cart-empty-state">
                  <RotateCcw className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No customer return requests found for your store.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ minWidth: '1200px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '130px' }}>Date Requested</th>
                        <th style={{ minWidth: '140px' }}>Order ID</th>
                        <th style={{ minWidth: '180px' }}>Reason Category</th>
                        <th style={{ minWidth: '220px' }}>Customer Notes</th>
                        <th style={{ minWidth: '140px' }}>Resolution Type</th>
                        <th style={{ minWidth: '150px' }}>Fulfillment Stage</th>
                        <th style={{ textAlign: 'center', minWidth: '220px', width: '220px' }}>Review Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorReturns.map((r) => {
                        const canReview = r.status === 'PENDING' && r.returnStage === 'REQUESTED';
                        return (
                          <tr key={r.id}>
                            <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{r.requestedAt}</td>
                            <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{r.orderId}</td>
                            <td>
                              <span className="badge badge-customer">{r.returnReasonCategory}</span>
                              <div style={{ fontSize: '12px', marginTop: '2px' }}>{r.reason}</div>
                            </td>
                            <td>{r.customerNotes || 'No notes'}</td>
                            <td>
                              <span className="badge" style={{ background: 'var(--bg-input)' }}>{r.resolutionType}</span>
                            </td>
                            <td>
                              <span className={`badge ${
                                r.returnStage === 'REFUNDED' ? 'badge-approved' : 
                                r.returnStage === 'QC_PASSED' ? 'badge-approved' : 
                                r.returnStage === 'VENDOR_DISPUTED' ? 'badge-rejected' : 'badge-pending'
                              }`}>
                                {r.returnStage}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {canReview ? (
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button
                                    onClick={async () => {
                                      try {
                                        await axios.put(`http://localhost:8080/api/payment/refunds/${r.id}/vendor-review`, { action: 'APPROVE' });
                                        showFlash('success', 'Return request approved. Proceeding to courier pickup.');
                                        fetchReturns();
                                      } catch (err) {
                                        showFlash('error', 'Action failed.');
                                      }
                                    }}
                                    className="btn btn-primary"
                                    style={{ padding: '4px 10px', fontSize: '12px' }}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={async () => {
                                      const notes = window.prompt("Enter dispute notes for Administrator review:");
                                      if (notes === null) return;
                                      try {
                                        await axios.put(`http://localhost:8080/api/payment/refunds/${r.id}/vendor-review`, { action: 'DISPUTE', notes: notes });
                                        showFlash('success', 'Return disputed and escalated to Admin.');
                                        fetchReturns();
                                      } catch (err) {
                                        showFlash('error', 'Action failed.');
                                      }
                                    }}
                                    className="btn btn-secondary"
                                    style={{ padding: '4px 10px', fontSize: '12px', color: 'var(--accent-rose)' }}
                                  >
                                    Dispute
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No Action Required</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'add' ? 'List New Product' : 'Edit Product Details'}
              </h2>
              <button onClick={() => setShowProductModal(false)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1, paddingRight: '6px' }}>
              {modalMode === 'edit' && productForm.status === 'REJECTED' && (
                <div className="rejection-warning-banner">
                  <div className="rejection-warning-title">
                    <AlertTriangle size={16} /> Listing Rejected
                  </div>
                  <div className="rejection-warning-desc">
                    This product submission was rejected. Reason: <strong>{productForm.rejectionReason || 'No reason provided.'}</strong>.
                    Please make the necessary adjustments and submit changes to resubmit for review.
                  </div>
                </div>
              )}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Product Name</label>
                  <span style={{ fontSize: '12px', color: getWordCount(productForm.name) > 50 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                    {getWordCount(productForm.name)} / 50 words
                  </span>
                </div>
                <input 
                  type="text" 
                  value={productForm.name} 
                  onChange={(e) => setProductForm({...productForm, name: e.target.value})} 
                  placeholder="e.g. Wireless Sports Earbuds"
                  className="form-input" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Brand</label>
                <input 
                  type="text" 
                  value={productForm.brand} 
                  onChange={(e) => setProductForm({...productForm, brand: e.target.value})} 
                  placeholder="e.g. Sony, Nike, L'Oreal"
                  className="form-input" 
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  value={productForm.category} 
                  onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                  className="form-select"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home">Home & Decor</option>
                  <option value="Sports">Sports & Outdoors</option>
                </select>
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Description</label>
                  <span style={{ fontSize: '12px', color: getWordCount(productForm.description) > 500 ? 'var(--accent-rose)' : 'var(--text-muted)' }}>
                    {getWordCount(productForm.description)} / 500 words
                  </span>
                </div>
                <textarea 
                  value={productForm.description} 
                  onChange={(e) => setProductForm({...productForm, description: e.target.value})} 
                  placeholder="Enter a detailed description of the product..."
                  className="form-input" 
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: modalMode === 'add' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Price (MRP ₹)</label>
                  <input 
                    type="number" 
                    value={productForm.price} 
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})} 
                    placeholder="999"
                    className="form-input" 
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Discount (%)</label>
                  <input 
                    type="number" 
                    value={productForm.discountPercentage} 
                    onChange={(e) => setProductForm({...productForm, discountPercentage: e.target.value})} 
                    placeholder="0"
                    className="form-input" 
                    min="0"
                    max="99"
                    step="1"
                  />
                </div>
                {modalMode === 'add' && (
                  <div className="form-group">
                    <label className="form-label">Initial Stock</label>
                    <input 
                      type="number" 
                      value={productForm.stock} 
                      onChange={(e) => setProductForm({...productForm, stock: e.target.value})} 
                      placeholder="10"
                      className="form-input" 
                      min="0"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', marginBottom: '10px' }}>
                <input 
                  type="checkbox" 
                  id="couponsEnabled"
                  checked={productForm.couponsEnabled}
                  onChange={(e) => setProductForm({...productForm, couponsEnabled: e.target.checked})} 
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <label htmlFor="couponsEnabled" style={{ fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                  Enable Promotional Coupons for this Product
                </label>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '600' }}>Return Policy Eligibility</label>
                <select 
                  value={productForm.returnPolicy || '7_DAYS'} 
                  onChange={(e) => setProductForm({...productForm, returnPolicy: e.target.value})}
                  className="form-select"
                  style={{ padding: '8px', fontSize: '13px' }}
                >
                  <option value="7_DAYS">7 Days Return window</option>
                  <option value="15_DAYS">15 Days Return window</option>
                  <option value="NON_RETURNABLE">Non-Returnable / Final Sale</option>
                </select>
              </div>

              {modalMode === 'edit' && (
                <div style={{
                  background: 'rgba(20, 184, 166, 0.08)',
                  border: '1px solid rgba(20, 184, 166, 0.3)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>⚡</span>
                  <span><strong>Tip:</strong> Need to change inventory quantity? Use the <strong>"Stock"</strong> button on your product list to adjust inventory immediately without admin re-approval.</span>
                </div>
              )}

              {/* Real-time System Calculates Final Price Preview */}
              {(() => {
                const p = parseFloat(productForm.price) || 0;
                const d = Math.max(0, Math.min(99, parseFloat(productForm.discountPercentage) || 0));
                const finalCalculated = d > 0 ? Math.round(p * (1 - d / 100) * 100) / 100 : p;
                const savings = Math.max(0, Math.round((p - finalCalculated) * 100) / 100);

                return (
                  <div style={{
                    background: 'rgba(20, 184, 166, 0.08)',
                    border: '1.5px solid rgba(20, 184, 166, 0.35)',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '10px'
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', fontWeight: '800' }}>
                        ⚡ System Calculated Final Selling Price
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '4px' }}>
                        <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-primary)' }}>
                          ₹{finalCalculated.toLocaleString('en-IN')}
                        </span>
                        {d > 0 && p > 0 && (
                          <>
                            <span style={{ fontSize: '14px', fontWeight: '600', textDecoration: 'line-through', color: '#94a3b8', textDecorationColor: '#ef4444', textDecorationThickness: '1.5px' }}>
                              ₹{p.toLocaleString('en-IN')}
                            </span>
                            <span style={{ 
                              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', 
                              color: '#ffffff', 
                              fontWeight: '800', 
                              fontSize: '11px', 
                              padding: '2px 8px', 
                              borderRadius: '4px',
                              boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
                            }}>
                              {d}% OFF
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {d > 0 && p > 0 && (
                      <div style={{ 
                        background: 'rgba(16, 185, 129, 0.16)', 
                        border: '1px solid rgba(16, 185, 129, 0.4)', 
                        padding: '6px 12px', 
                        borderRadius: '6px', 
                        fontSize: '13px', 
                        fontWeight: '700',
                        color: '#10b981' 
                      }}>
                        Customer Saves: <strong>₹{savings.toLocaleString('en-IN')}</strong>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="form-group" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px' }}>
                <label className="form-label" style={{ fontWeight: '700' }}>Product Images & Gallery</label>
                
                {/* Image Upload / Input controls */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                  {/* File Upload Row */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <label 
                      className={`btn ${isUploadingImage ? 'btn-secondary disabled' : 'btn-secondary'}`} 
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: isUploadingImage ? 'not-allowed' : 'pointer', margin: 0, padding: '8px 12px', fontSize: '13px', opacity: isUploadingImage ? 0.7 : 1 }}
                    >
                      {isUploadingImage ? (
                        <>
                          <span className="spinner-border spinner-border-sm" style={{ width: '14px', height: '14px', border: '2px solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.75s linear infinite' }} />
                          Uploading to folder...
                        </>
                      ) : (
                        <>
                          <Plus size={16} /> Upload Image File (Stores on Disk)
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        disabled={isUploadingImage}
                        onChange={handleImageUpload} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                    
                    {/* Emoji Select option to quickly add visual icons */}
                    <select 
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddImageUrl(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="form-select"
                      style={{ width: '130px', fontSize: '13px', padding: '7px 10px' }}
                      defaultValue=""
                    >
                      <option value="" disabled>+ Add Emoji</option>
                      <option value="📦">📦 Box</option>
                      <option value="🎧">🎧 Headphones</option>
                      <option value="⌚">⌚ Smart Watch</option>
                      <option value="💄">💄 Lipstick / Beauty</option>
                      <option value="👗">👗 Dress</option>
                      <option value="👟">👟 Shoes</option>
                      <option value="🕶️">🕶️ Sunglasses</option>
                      <option value="📚">📚 Book</option>
                      <option value="☕">☕ Mug</option>
                      <option value="🧴">🧴 Lotion</option>
                      <option value="🎁">🎁 Gift Box</option>
                      <option value="✨">✨ Sparkles</option>
                    </select>
                  </div>

                  {/* Manual URL Row */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      id="manual-image-url"
                      placeholder="Paste Image URL here..." 
                      className="form-input"
                      style={{ flex: 1, padding: '6px 10px', fontSize: '13px' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddImageUrl(e.target.value);
                          e.target.value = '';
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => {
                        const input = document.getElementById('manual-image-url');
                        if (input && input.value) {
                          handleAddImageUrl(input.value);
                          input.value = '';
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Thumbnails Grid */}
                {productForm.images && productForm.images.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px dashed var(--border-light)' }}>
                    {productForm.images.map((img, idx) => {
                      const isPrimary = productForm.imageUrl === img;
                      const isEmoji = img.length <= 4; // Emojis are short strings
                      return (
                        <div 
                          key={idx} 
                          style={{ position: 'relative', aspectRatio: '1', borderRadius: '6px', overflow: 'hidden', border: isPrimary ? '2px solid var(--accent-indigo)' : '1px solid var(--border-light)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                          title={isPrimary ? "Primary Cover Image" : "Click to set as primary"}
                          onClick={() => handleSetPrimaryImage(img)}
                        >
                          {/* Image rendering */}
                          {isEmoji ? (
                            <span style={{ fontSize: '24px' }}>{img}</span>
                          ) : (
                            <img src={formatImageUrl(img)} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          )}

                          {/* Hover action banner */}
                          {isPrimary && (
                            <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'var(--accent-indigo)', color: '#fff', fontSize: '8px', textAlign: 'center', padding: '2px 0', fontWeight: 'bold' }}>
                              COVER
                            </div>
                          )}

                          {/* Delete X Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveImage(idx);
                            }}
                            style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: '0', fontSize: '9px', fontWeight: 'bold' }}
                            title="Remove Image"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px', border: '1px dashed var(--border-light)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
                    <span>No additional images uploaded. Upload files or paste URLs above.</span>
                    <span style={{ fontSize: '11px' }}>Current Cover Icon/Emoji: <strong>{productForm.imageUrl}</strong></span>
                  </div>
                )}
              </div>

              <div className="modal-footer" style={{ borderTop: 'none', marginTop: '0', paddingTop: '8px' }}>
                <button type="button" onClick={() => setShowProductModal(false)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> {modalMode === 'add' ? 'Submit Listing' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Accept Promo Coupon Modal */}
      {showAcceptPromoModal && selectedPromoCode && (
        <div className="modal-overlay" onClick={() => setShowAcceptPromoModal(false)} style={{ zIndex: 3000 }}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h2 className="modal-title">Activate Coupon: {selectedPromoCode}</h2>
              <button onClick={() => setShowAcceptPromoModal(false)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 0', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                Choose how you want this promotional discount to apply to your listings:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setAcceptPromoMode('all')}
                  className={`btn ${acceptPromoMode === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '12px', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                >
                  <strong style={{ fontSize: '14px' }}>Apply to All</strong>
                  <span style={{ fontSize: '11px', opacity: 0.8 }}>Enable for all current products</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAcceptPromoMode('specific')}
                  className={`btn ${acceptPromoMode === 'specific' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '12px', fontSize: '13px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                >
                  <strong style={{ fontSize: '14px' }}>Select Products</strong>
                  <span style={{ fontSize: '11px', opacity: 0.8 }}>Choose specific items manually</span>
                </button>
              </div>

              {acceptPromoMode === 'specific' && (
                <div style={{ border: '1px solid var(--border-light)', borderRadius: '8px', padding: '12px', background: 'var(--bg-input)', overflowX: 'auto' }}>
                  <label style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', display: 'block', marginBottom: '12px', textTransform: 'uppercase' }}>
                    Select Eligible Products ({selectedPromoProductIds.length} / {products.length})
                  </label>
                  <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                    <table className="custom-table" style={{ fontSize: '12px', width: '100%' }}>
                      <thead>
                        <tr>
                          <th style={{ width: '32px', padding: '6px' }}>
                            <input 
                              type="checkbox"
                              checked={selectedPromoProductIds.length === products.length && products.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPromoProductIds(products.map(p => p.id));
                                } else {
                                  setSelectedPromoProductIds([]);
                                }
                              }}
                              style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                            />
                          </th>
                          <th style={{ width: '48px', padding: '6px' }}>Icon</th>
                          <th style={{ padding: '6px' }}>Name</th>
                          <th style={{ padding: '6px' }}>Category</th>
                          <th style={{ padding: '6px' }}>Price</th>
                          <th style={{ padding: '6px' }}>Stock</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.length === 0 ? (
                          <tr>
                            <td colSpan="6" style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)' }}>
                              No products listed.
                            </td>
                          </tr>
                        ) : (
                          products.map((prod) => {
                            const isChecked = selectedPromoProductIds.includes(prod.id);
                            return (
                              <tr 
                                key={prod.id} 
                                style={{ 
                                  background: isChecked ? 'rgba(20, 184, 166, 0.08)' : 'transparent',
                                  transition: 'background-color 0.2s'
                                }}
                              >
                                <td style={{ padding: '6px', textAlign: 'center' }}>
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedPromoProductIds([...selectedPromoProductIds, prod.id]);
                                      } else {
                                        setSelectedPromoProductIds(selectedPromoProductIds.filter(id => id !== prod.id));
                                      }
                                    }}
                                    style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                                  />
                                </td>
                                <td style={{ padding: '6px' }}>
                                  <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', overflow: 'hidden', background: 'var(--bg-card)' }}>
                                    {prod.imageUrl && formatImageUrl(prod.imageUrl).length > 4 ? (
                                      <img src={formatImageUrl(prod.imageUrl)} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                      <ProductIcon name={prod.name} category={prod.category} size={14} />
                                    )}
                                  </div>
                                </td>
                                <td style={{ padding: '6px', fontWeight: '600', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={prod.name}>
                                  {prod.name}
                                </td>
                                <td style={{ padding: '6px' }}>
                                  <span className="badge badge-customer" style={{ fontSize: '10px', padding: '2px 6px' }}>{prod.category}</span>
                                </td>
                                <td style={{ padding: '6px', fontWeight: '700' }}>
                                  ₹{prod.price}
                                </td>
                                <td style={{ padding: '6px' }}>
                                  <span style={{ fontWeight: '600', color: prod.stock <= 3 ? 'var(--accent-rose)' : 'inherit' }}>
                                    {prod.stock}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
              <button type="button" onClick={() => setShowAcceptPromoModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button 
                type="button" 
                onClick={() => submitApproveCoupon(selectedPromoCode, acceptPromoMode === 'all', selectedPromoProductIds)} 
                className="btn btn-primary"
                style={{ background: 'var(--accent-teal)' }}
              >
                Confirm & Accept Coupon
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Stock Management Modal (Instant Update - No Admin Approval Required) */}
      {stockModalProduct && (
        <div className="modal-overlay" onClick={() => setStockModalProduct(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={20} style={{ color: 'var(--accent-teal)' }} />
                Manage Stock & Inventory
              </h2>
              <button onClick={() => setStockModalProduct(null)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStockModal} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '8px 0' }}>
              <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Product</div>
                <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>{stockModalProduct.name}</strong>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Current Live Inventory: <strong style={{ color: stockModalProduct.stock > 0 ? 'var(--accent-teal)' : 'var(--accent-rose)' }}>{stockModalProduct.stock} units</strong>
                </div>
              </div>

              <div style={{
                background: 'rgba(20, 184, 166, 0.08)',
                border: '1px solid rgba(20, 184, 166, 0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '16px' }}>⚡</span>
                <span>Stock updates take effect <strong>instantly</strong> in the store without requiring administrator re-approval.</span>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '700' }}>Available Stock Units</label>
                <input 
                  type="number"
                  value={quickStockValue}
                  onChange={(e) => setQuickStockValue(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  className="form-input"
                  style={{ fontSize: '20px', fontWeight: '800', textAlign: 'center', padding: '10px' }}
                  required
                  autoFocus
                />
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '6px 8px', fontSize: '12px' }}
                  onClick={() => setQuickStockValue(0)}
                >
                  Set 0 (Out of Stock)
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '6px 8px', fontSize: '12px' }}
                  onClick={() => setQuickStockValue(prev => (parseInt(prev) || 0) + 10)}
                >
                  +10
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '6px 8px', fontSize: '12px' }}
                  onClick={() => setQuickStockValue(prev => (parseInt(prev) || 0) + 50)}
                >
                  +50
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '6px 8px', fontSize: '12px' }}
                  onClick={() => setQuickStockValue(prev => (parseInt(prev) || 0) + 100)}
                >
                  +100
                </button>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setStockModalProduct(null)} 
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isUpdatingStock} 
                  className="btn btn-primary"
                  style={{ flex: 2 }}
                >
                  {isUpdatingStock ? 'Updating Stock...' : 'Save Stock (Instant Update)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
