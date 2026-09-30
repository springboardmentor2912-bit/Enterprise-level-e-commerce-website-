import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Truck, Calendar, ShoppingBag, Check, X, ShieldAlert, ShieldCheck, Package, CheckCircle2, 
  RotateCcw, Clock, RefreshCw, Eye, Plus, Edit, PlusCircle, Trash, Box, 
  MapPin, CheckCircle, BarChart3, AlertCircle, PlayCircle, Loader2, Bell,
  Layers, Repeat, ArrowRightLeft, FileText, ArrowRight, Store, Search, AlertTriangle,
  Sun, Moon, ArrowLeft, ChevronDown, User, LogOut
} from 'lucide-react';
import ProductIcon from './ProductIcon';
import NotificationCenter from './NotificationCenter';
import { extractErrorMessage } from '../utils/errorHandler';
import { formatImageUrl } from '../utils/imageHelper';
import { 
  generateWarehouseNotifications, 
  markNotifAsRead, 
  markAllNotifsAsRead, 
  clearAllNotifs, 
  dismissNotif 
} from '../utils/notificationService';

export default function WarehouseDashboard({ user, onGoToHome, onGoToProfile, theme, onToggleTheme, onLogout, initialTab = 'analytics' }) {
  const [warehouses, setWarehouses] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [returnsList, setReturnsList] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userMenuRef = useRef(null);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
    };
    if (showUserDropdown) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [showUserDropdown]);

  // Tabs: 'analytics' | 'fulfillment' | 'warehouses' | 'inventory' | 'returns'
  const getSanitizedTab = (tab) => {
    return (typeof tab === 'string' && tab) ? tab : 'analytics';
  };

  const [activeTab, setActiveTab] = useState(getSanitizedTab(initialTab));
  useEffect(() => {
    setActiveTab(getSanitizedTab(initialTab));
  }, [initialTab]);
  // Fulfillment Pipeline Sub-tabs: 'allocate' | 'pick' | 'pack' | 'ship'
  const [fulfillmentSubTab, setFulfillmentSubTab] = useState('allocate');
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [flashMessage, setFlashMessage] = useState({ type: '', text: '' });
  const [selectedReturnDetails, setSelectedReturnDetails] = useState(null);

  // Modals / Form States
  const [showAddWhModal, setShowAddWhModal] = useState(false);
  const [showEditWhModal, setShowEditWhModal] = useState(false);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [showManualAllocModal, setShowManualAllocModal] = useState(false);
  const [showQcModal, setShowQcModal] = useState(false);
  const [showDamagedActionModal, setShowDamagedActionModal] = useState(false);
  const [selectedDamagedItem, setSelectedDamagedItem] = useState(null);
  const [damagedActionForm, setDamagedActionForm] = useState({ action: 'WRITE_OFF', quantity: 1, notes: '' });
  const [damagedSearchTerm, setDamagedSearchTerm] = useState('');
  const [damagedWhFilter, setDamagedWhFilter] = useState('ALL');

  const [whForm, setWhForm] = useState({ name: '', code: '', address: '', city: '', active: true });
  const [editingWhId, setEditingWhId] = useState(null);
  const [restockForm, setRestockForm] = useState({ warehouseId: '', productId: '', quantity: 10 });
  const [manualAllocForm, setManualAllocForm] = useState({ orderId: '', orderItemId: '', warehouseId: '', quantity: 1, maxQty: 1 });
  const [selectedProductForAlloc, setSelectedProductForAlloc] = useState(null);
  const [qcForm, setQcForm] = useState({ refundId: null, passed: true, restockOption: 'RESELLABLE', warehouseId: '', notes: '', warehouseInspectionImage: '' });

  // Temporary local states for packing & dispatch
  const [packagingSelections, setPackagingSelections] = useState({});
  const [courierSelections, setCourierSelections] = useState({});
  const [trackingNumbers, setTrackingNumbers] = useState({});

  // Facility filter (defaults to user's assigned warehouse if set)
  const [facilityFilter, setFacilityFilter] = useState(user?.warehouseId ? String(user.warehouseId) : 'ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const getFilteredAllocations = () => {
    if (facilityFilter === 'ALL') return allocations;
    return allocations.filter(a => String(a.warehouseId) === String(facilityFilter) || (a.warehouse && String(a.warehouse.id) === String(facilityFilter)));
  };

  const displayedAllocations = getFilteredAllocations();
  const displayedInventories = facilityFilter === 'ALL'
    ? inventories
    : inventories.filter(i => String(i.warehouseId) === String(facilityFilter) || (i.warehouse && String(i.warehouse.id) === String(facilityFilter)));

  const activeReturnsList = facilityFilter === 'ALL'
    ? returnsList
    : returnsList.filter(r => {
        const orderAllocs = allocations.filter(a => a.orderId === r.orderId);
        if (orderAllocs.length === 0) return true;
        return orderAllocs.some(a => String(a.warehouseId) === String(facilityFilter) || (a.warehouse && String(a.warehouse.id) === String(facilityFilter)));
      });

  const pendingReturns = activeReturnsList.filter(r => r.status === 'PENDING');
  const damagedInventories = facilityFilter === 'ALL'
    ? inventories.filter(i => (i.damagedQuantity || 0) > 0)
    : inventories.filter(i => (i.damagedQuantity || 0) > 0 && (String(i.warehouseId) === String(facilityFilter) || (i.warehouse && String(i.warehouse.id) === String(facilityFilter))));

  const staffPendingAllocations = allocations.filter(a => 
    a.status === 'ALLOCATED' && (
      !user.warehouseId || String(a.warehouseId) === String(user.warehouseId) || (a.warehouse && String(a.warehouse.id) === String(user.warehouseId))
    )
  );

  // Dynamic Warehouse Notifications State
  const [notificationList, setNotificationList] = useState([]);

  const refreshNotifications = () => {
    const list = generateWarehouseNotifications({
      user,
      pendingAllocationsCount: staffPendingAllocations?.length || 0,
      onGoToQueue: (tab, subTab) => {
        setActiveTab(tab);
        if (subTab) setFulfillmentSubTab(subTab);
      }
    });
    setNotificationList(list);
  };

  useEffect(() => {
    refreshNotifications();
  }, [user, staffPendingAllocations]);

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

  const showFlash = (type, text) => {
    let msg = text;
    if (typeof text === 'object' && text !== null) {
      msg = extractErrorMessage(text);
    }
    setFlashMessage({ type, text: msg });
    setTimeout(() => setFlashMessage({ type: '', text: '' }), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const whRes = await axios.get('http://localhost:8080/api/warehouses');
      setWarehouses(whRes.data || []);

      const invRes = await axios.get('http://localhost:8080/api/warehouses/inventory/all');
      setInventories(invRes.data || []);

      const allocRes = await axios.get('http://localhost:8080/api/warehouses/allocations');
      setAllocations(allocRes.data || []);

      const ordersRes = await axios.get('http://localhost:8080/api/customer/orders/all');
      setAllOrders(ordersRes.data || []);

      const productsRes = await axios.get('http://localhost:8080/api/products');
      setProducts(productsRes.data || []);

      const returnsRes = await axios.get('http://localhost:8080/api/admin/refunds');
      setReturnsList(returnsRes.data || []);

      const analyticsRes = await axios.get('http://localhost:8080/api/warehouses/analytics');
      setAnalytics(analyticsRes.data || {});
    } catch (err) {
      console.error("Failed to load warehouse data", err);
      showFlash('error', 'Error loading warehouse workspace data.');
    } finally {
      setLoading(false);
    }
  };

  // --- WAREHOUSE MANAGEMENT ACTIONS ---
  
  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/warehouses', whForm);
      showFlash('success', `Warehouse ${whForm.name} created successfully.`);
      setShowAddWhModal(false);
      setWhForm({ name: '', code: '', address: '', city: '', active: true });
      fetchData();
    } catch (err) {
      showFlash('error', 'Failed to create warehouse.');
    }
  };

  const handleEditWarehouse = (wh) => {
    setEditingWhId(wh.id);
    setWhForm({ name: wh.name, code: wh.code, address: wh.address, city: wh.city, active: wh.active });
    setShowEditWhModal(true);
  };

  const handleUpdateWarehouse = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/api/warehouses/${editingWhId}`, whForm);
      showFlash('success', 'Warehouse details updated successfully.');
      setShowEditWhModal(false);
      setEditingWhId(null);
      setWhForm({ name: '', code: '', address: '', city: '', active: true });
      fetchData();
    } catch (err) {
      showFlash('error', 'Failed to update warehouse.');
    }
  };

  const handleToggleWarehouseStatus = async (wh) => {
    try {
      await axios.put(`http://localhost:8080/api/warehouses/${wh.id}`, {
        ...wh,
        active: !wh.active
      });
      showFlash('success', `Warehouse ${wh.name} is now ${!wh.active ? 'Active' : 'Inactive'}.`);
      fetchData();
    } catch (err) {
      showFlash('error', 'Failed to change warehouse status.');
    }
  };

  // --- INVENTORY RESTOCK ACTIONS ---

  const handleRestockStock = async (e) => {
    e.preventDefault();
    if (!restockForm.warehouseId || !restockForm.productId || restockForm.quantity <= 0) {
      showFlash('error', 'Please fill in all restocking details.');
      return;
    }
    try {
      await axios.post(`http://localhost:8080/api/warehouses/${restockForm.warehouseId}/inventory`, {
        productId: restockForm.productId,
        quantity: restockForm.quantity
      });
      showFlash('success', 'Stock replenished successfully.');
      setShowRestockModal(false);
      fetchData();
    } catch (err) {
      showFlash('error', 'Failed to restock inventory.');
    }
  };

  const handleUpdateInventoryDirect = async (invId, newQty) => {
    if (newQty < 0) return;
    try {
      await axios.put(`http://localhost:8080/api/warehouses/inventory/${invId}`, {
        quantity: newQty
      });
      showFlash('success', 'Inventory level adjusted.');
      fetchData();
    } catch (err) {
      showFlash('error', 'Failed to adjust stock level.');
    }
  };

  // --- ALLOCATION WORKFLOW ACTIONS ---

  const handleAutoAllocate = async (orderId) => {
    try {
      await axios.post(`http://localhost:8080/api/warehouses/allocations/allocate/${orderId}`);
      showFlash('success', `Order ${orderId} automatically allocated to warehouses based on stock.`);
      fetchData();
    } catch (err) {
      showFlash('error', err.response?.data?.message || 'Automatic stock allocation failed.');
    }
  };

  const openManualAllocation = (ordId, item) => {
    // Find product information
    const prod = products.find(p => p.id === item.productId);
    setSelectedProductForAlloc(prod);

    setManualAllocForm({
      orderId: ordId,
      orderItemId: item.id,
      warehouseId: warehouses.length > 0 ? warehouses[0].id.toString() : '',
      quantity: item.quantity,
      maxQty: item.quantity
    });
    setShowManualAllocModal(true);
  };

  const handleManualAllocate = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/warehouses/allocations/manual', {
        orderId: manualAllocForm.orderId,
        orderItemId: manualAllocForm.orderItemId,
        warehouseId: manualAllocForm.warehouseId,
        quantity: manualAllocForm.quantity
      });
      showFlash('success', 'Stock manual allocation recorded.');
      setShowManualAllocModal(false);
      fetchData();
    } catch (err) {
      showFlash('error', err.response?.data || 'Manual stock allocation failed.');
    }
  };

  // --- WORKFLOW WORKFLOW LIFECYCLE (PICK, PACK, SHIP) ---

  const handleAdvanceStatus = async (allocId, nextStatus, payloadDetails = {}) => {
    try {
      await axios.put(`http://localhost:8080/api/warehouses/allocations/${allocId}/status`, {
        status: nextStatus,
        ...payloadDetails
      });
      showFlash('success', `Allocation status updated to ${nextStatus}.`);
      fetchData();
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to update workflow step.');
    }
  };

  const handlePickAllocation = (allocId) => {
    handleAdvanceStatus(allocId, 'PICKED');
  };

  const handlePackAllocation = (allocId) => {
    const pkg = packagingSelections[allocId] || 'Standard Box';
    handleAdvanceStatus(allocId, 'PACKED', { packagingType: pkg });
  };

  const handleShipAllocation = (allocId) => {
    const courier = courierSelections[allocId] || 'ShopStack Express';
    const tracking = trackingMap(allocId) || 'SS-' + Math.floor(100000 + Math.random() * 900000);
    handleAdvanceStatus(allocId, 'READY_FOR_SHIPMENT', {
      courierPartner: courier,
      trackingNumber: tracking
    });
  };

  const trackingMap = (allocId) => {
    return trackingNumbers[allocId] || '';
  };

  const handleReceivePackage = async (refundId) => {
    try {
      await axios.put(`http://localhost:8080/api/payment/refunds/${refundId}/receive`);
      showFlash('success', 'Return package marked as received at warehouse facility. Ready for QC inspection.');
      fetchData();
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to mark return package as received.');
    }
  };

  const handleQcSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:8080/api/payment/refunds/${qcForm.refundId}/qc-inspection`, {
        passed: qcForm.passed,
        restockOption: qcForm.restockOption,
        warehouseId: qcForm.warehouseId || (warehouses.length > 0 ? warehouses[0].id : null),
        notes: qcForm.notes,
        warehouseInspectionImage: qcForm.warehouseInspectionImage
      });
      showFlash('success', 'QC verification log saved successfully.');
      setShowQcModal(false);
      fetchData();
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to submit QC details.');
    }
  };

  const handleOpenDamagedActionModal = (inv) => {
    setSelectedDamagedItem(inv);
    setDamagedActionForm({
      action: 'WRITE_OFF',
      quantity: inv.damagedQuantity || 1,
      notes: ''
    });
    setShowDamagedActionModal(true);
  };

  const submitDamagedAction = async (e) => {
    e.preventDefault();
    if (!selectedDamagedItem) return;
    try {
      await axios.post(`http://localhost:8080/api/warehouses/damaged-stock/${selectedDamagedItem.id}/action`, {
        action: damagedActionForm.action,
        quantity: parseInt(damagedActionForm.quantity) || 1,
        notes: damagedActionForm.notes
      });
      showFlash('success', `Disposition action (${damagedActionForm.action}) executed successfully.`);
      setShowDamagedActionModal(false);
      setSelectedDamagedItem(null);
      fetchData();
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to process damaged stock action.');
    }
  };


  const filteredDamagedInventories = damagedInventories.filter(i => {
    const matchesSearch = !damagedSearchTerm || 
      (i.productName && i.productName.toLowerCase().includes(damagedSearchTerm.toLowerCase())) ||
      (i.productCategory && i.productCategory.toLowerCase().includes(damagedSearchTerm.toLowerCase())) ||
      (i.warehouseName && i.warehouseName.toLowerCase().includes(damagedSearchTerm.toLowerCase())) ||
      (i.warehouseCode && i.warehouseCode.toLowerCase().includes(damagedSearchTerm.toLowerCase()));
    const matchesWh = damagedWhFilter === 'ALL' || String(i.warehouseId) === String(damagedWhFilter);
    return matchesSearch && matchesWh;
  });

  // Compute pending allocations or partially allocated items
  const getAllocationStatus = (orderId, orderItems) => {
    const orderAllocs = allocations.filter(a => a.orderId === orderId);
    if (orderAllocs.length === 0) return { label: 'Unallocated', class: 'badge-rejected', code: 0 };
    
    // Check total quantities
    const totalAllocatedQty = orderAllocs.reduce((sum, a) => sum + (a.quantity || 0), 0);
    const totalRequiredQty = orderItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

    const hasUnallocated = orderAllocs.some(a => a.status === 'UNALLOCATED');
    
    if (hasUnallocated) {
      return { label: 'Stock Pending / Unallocated', class: 'badge-pending', code: 1 };
    }
    if (totalAllocatedQty < totalRequiredQty) {
      return { label: 'Partially Allocated', class: 'badge-pending', code: 1 };
    }
    return { label: 'Fully Allocated', class: 'badge-approved', code: 2 };
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
            ShopStack <span className="hide-on-mobile badge badge-vendor" style={{ fontSize: '9px', padding: '1px 5px', verticalAlign: 'middle', marginLeft: '4px' }}>STAFF</span>
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

          {/* Warehouse Notifications Center */}
          <NotificationCenter
            notifications={notificationList}
            onMarkAsRead={handleMarkNotifAsRead}
            onMarkAllAsRead={handleMarkAllNotifsAsRead}
            onClearAll={handleClearAllNotifs}
            onDismiss={handleDismissNotif}
            role="STAFF"
            panelTitle="Facility Alerts"
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
                setShowUserDropdown(prev => !prev);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="nav-user-avatar">
                <User size={14} style={{ color: 'var(--accent-indigo)', flexShrink: 0 }} />
              </div>
              <strong className="nav-user-name">{user?.fullName || 'Staff'}</strong>
              <ChevronDown 
                size={13} 
                className="nav-user-chevron"
                style={{ 
                  transform: showUserDropdown ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }} 
              />
            </div>

            {showUserDropdown && (
              <div className="nav-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="dropdown-header" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Warehouse Panel</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.fullName || 'Staff'}
                    </strong>
                    <span className="badge badge-vendor" style={{ fontSize: '9px', padding: '1px 6px' }}>
                      STAFF
                    </span>
                  </div>
                </div>

                <div 
                  onClick={() => { 
                    setShowUserDropdown(false); 
                    if (onGoToProfile) onGoToProfile('profile'); 
                  }} 
                  className="dropdown-item"
                >
                  <User size={16} style={{ flexShrink: 0 }} /> <span>My Profile</span>
                </div>

                <div onClick={() => { setShowUserDropdown(false); onGoToHome(); }} className="dropdown-item">
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
                      setShowUserDropdown(false); 
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

          <button onClick={fetchData} className="btn btn-secondary" style={{ padding: '6px 10px', display: 'flex', gap: '4px', alignItems: 'center', fontSize: '12px' }}>
            {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            <span className="hide-on-mobile">Reload</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs-bar">
        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={`sidebar-item ${activeTab === 'analytics' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '14px 18px', background: 'transparent', borderBottom: activeTab === 'analytics' ? '2px solid var(--accent-indigo)' : 'none' }}
        >
          <BarChart3 size={17} style={{ color: activeTab === 'analytics' ? 'var(--accent-indigo)' : 'var(--text-muted)' }} />
          <span>Dashboard Analytics</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('fulfillment')}
          className={`sidebar-item ${activeTab === 'fulfillment' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '14px 18px', background: 'transparent', borderBottom: activeTab === 'fulfillment' ? '2px solid var(--accent-indigo)' : 'none' }}
        >
          <Truck size={17} style={{ color: activeTab === 'fulfillment' ? 'var(--accent-indigo)' : 'var(--text-muted)' }} />
          <span>Fulfillment Pipeline</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`sidebar-item ${activeTab === 'inventory' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '14px 18px', background: 'transparent', borderBottom: activeTab === 'inventory' ? '2px solid var(--accent-indigo)' : 'none' }}
        >
          <Package size={17} style={{ color: activeTab === 'inventory' ? 'var(--accent-indigo)' : 'var(--text-muted)' }} />
          <span>Warehouse Stock ({displayedInventories.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('returns')}
          className={`sidebar-item ${activeTab === 'returns' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '14px 18px', background: 'transparent', borderBottom: activeTab === 'returns' ? '2px solid var(--accent-indigo)' : 'none' }}
        >
          <RotateCcw size={17} style={{ color: activeTab === 'returns' ? 'var(--accent-indigo)' : 'var(--text-muted)' }} />
          <span>Inward Returns & QC ({pendingReturns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('damaged')}
          className={`sidebar-item ${activeTab === 'damaged' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '14px 18px', background: 'transparent', borderBottom: activeTab === 'damaged' ? '2px solid var(--accent-rose, #ef4444)' : 'none' }}
        >
          <ShieldAlert size={17} style={{ color: activeTab === 'damaged' ? 'var(--accent-rose, #ef4444)' : 'var(--text-muted)' }} />
          <span>Damaged & Quarantine ({damagedInventories.length})</span>
        </button>
      </div>

      {/* Staff Allocation Notification Alert Banner */}
      {staffPendingAllocations.length > 0 && (
        <div style={{
          margin: '16px 24px 0 24px',
          padding: '14px 20px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.12) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--accent-indigo)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              flexShrink: 0
            }}>
              <Bell size={18} />
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                New Order Allocation Alert
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Administrator allocated <strong>{staffPendingAllocations.length}</strong> new order item(s) to <strong>{user.warehouseName || 'your facility'}</strong>. Ready for physical picking and packing.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab('fulfillment');
              setFulfillmentSubTab('pick');
            }}
            className="btn btn-primary"
            style={{ padding: '6px 16px', fontSize: '12px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            Open Picking Queue ({staffPendingAllocations.length}) →
          </button>
        </div>
      )}

      <div className="dashboard-layout" style={{ flexDirection: 'column', padding: '24px' }}>
        <div className="main-content" style={{ width: '100%' }}>

          {/* TAB 1: ANALYTICS OVERVIEW */}
          {activeTab === 'analytics' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0 }}>Fulfillment Logistics Center</h2>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0 0' }}>
                    Operational dashboard and key efficiency metrics for physical warehouse capacities and order queues.
                  </p>
                </div>

                {/* Facility Scope Switcher */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '600' }}>Scope:</span>
                  <select
                    value={facilityFilter}
                    onChange={(e) => setFacilityFilter(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '6px', minWidth: '220px' }}
                  >
                    <option value="ALL">🌐 Network-Wide (All 3 Hubs)</option>
                    {warehouses.map(wh => (
                      <option key={wh.id} value={String(wh.id)}>
                        {wh.name} ({wh.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Analytics Summary Cards - Dynamically scoped to selected facility */}
              {(() => {
                const activeWhInventories = facilityFilter === 'ALL'
                  ? inventories
                  : inventories.filter(i => String(i.warehouseId) === String(facilityFilter) || (i.warehouse && String(i.warehouse.id) === String(facilityFilter)));
                const facilityPhysicalStock = activeWhInventories.reduce((s, i) => s + (i.quantity || 0), 0);
                const facilityAllocatedStock = activeWhInventories.reduce((s, i) => s + (i.allocated || 0), 0);
                const facilityAvailableStock = Math.max(0, facilityPhysicalStock - facilityAllocatedStock);
                const facilityDamagedStock = activeWhInventories.reduce((s, i) => s + (i.damagedQuantity || 0), 0);
                const facilityDamagedValue = activeWhInventories.reduce((s, i) => s + ((i.damagedQuantity || 0) * (i.productPrice || 0)), 0);

                const facilityStatusAllocated = facilityFilter === 'ALL' ? (analytics.statusBreakdown?.ALLOCATED || 0) : displayedAllocations.filter(a => a.status === 'ALLOCATED').length;
                const facilityStatusPicked = facilityFilter === 'ALL' ? (analytics.statusBreakdown?.PICKED || 0) : displayedAllocations.filter(a => a.status === 'PICKED').length;
                const facilityStatusPacked = facilityFilter === 'ALL' ? (analytics.statusBreakdown?.PACKED || 0) : displayedAllocations.filter(a => a.status === 'PACKED').length;
                const facilityStatusShipped = facilityFilter === 'ALL' ? (analytics.statusBreakdown?.READY_FOR_SHIPMENT || 0) : displayedAllocations.filter(a => a.status === 'READY_FOR_SHIPMENT' || a.status === 'SHIPPED').length;

                return (
                  <>
                    <div className="analytics-grid">
                      <div className="metric-card">
                        <div className="flex-between">
                          <span className="metric-label">{facilityFilter === 'ALL' ? 'Active Facilities' : 'Facility Status'}</span>
                          <MapPin size={18} style={{ color: 'var(--accent-indigo)' }} />
                        </div>
                        <div className="metric-value">{facilityFilter === 'ALL' ? `${warehouses.filter(w => w.active).length} Hubs` : 'OPERATIONAL'}</div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {facilityFilter === 'ALL' ? `${warehouses.length} registered fulfillment facilities` : `${warehouses.find(w => String(w.id) === String(facilityFilter))?.name || 'Dedicated fulfillment hub'}`}
                        </span>
                      </div>

                      <div className="metric-card">
                        <div className="flex-between">
                          <span className="metric-label">Physical Stock Stored</span>
                          <Package size={18} style={{ color: 'var(--accent-teal)' }} />
                        </div>
                        <div className="metric-value">{facilityPhysicalStock} units</div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Total items residing physically inside warehouse bins.
                        </span>
                      </div>

                      <div className="metric-card">
                        <div className="flex-between">
                          <span className="metric-label">Allocated/Reserved Stock</span>
                          <Clock size={18} style={{ color: 'var(--accent-amber)' }} />
                        </div>
                        <div className="metric-value">{facilityAllocatedStock} units</div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Items reserved for confirmed orders being packaged.
                        </span>
                      </div>

                      <div className="metric-card">
                        <div className="flex-between">
                          <span className="metric-label">Available for Sale</span>
                          <CheckCircle size={18} style={{ color: 'var(--accent-emerald)' }} />
                        </div>
                        <div className="metric-value" style={{ color: 'var(--accent-emerald)' }}>{facilityAvailableStock} units</div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Unreserved warehouse stock ready for retail order matching.
                        </span>
                      </div>

                      <div className="metric-card" style={{ border: '1px solid rgba(239, 68, 68, 0.25)', background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(239, 68, 68, 0.04) 100%)' }}>
                        <div className="flex-between">
                          <span className="metric-label" style={{ color: '#ef4444' }}>Damaged & Quarantine</span>
                          <ShieldAlert size={18} style={{ color: '#ef4444' }} />
                        </div>
                        <div className="metric-value" style={{ color: '#ef4444' }}>{facilityDamagedStock} units</div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          ₹{Math.round(facilityDamagedValue).toLocaleString('en-IN')} loss valuation quarantined from active catalog.
                        </span>
                      </div>
                    </div>

                    {/* Status Breakdown Tracker */}
                    <div className="pipeline-tracker-container">
                      <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Pipeline Distribution Tracker</h3>
                      <div className="pipeline-tracker-grid">
                        <div className="pipeline-tracker-item">
                          <div className="pipeline-tracker-step">1. STOCK ALLOCATED</div>
                          <div className="pipeline-tracker-val" style={{ color: 'var(--accent-blue)' }}>
                            {facilityStatusAllocated}
                          </div>
                          <div className="pipeline-tracker-desc">Awaiting Pick list check</div>
                        </div>

                        <div className="pipeline-tracker-item">
                          <div className="pipeline-tracker-step">2. PRODUCT PICKED</div>
                          <div className="pipeline-tracker-val" style={{ color: 'var(--accent-teal)' }}>
                            {facilityStatusPicked}
                          </div>
                          <div className="pipeline-tracker-desc">Pending carton packing</div>
                        </div>

                        <div className="pipeline-tracker-item">
                          <div className="pipeline-tracker-step">3. ORDER PACKED</div>
                          <div className="pipeline-tracker-val" style={{ color: 'var(--accent-indigo)' }}>
                            {facilityStatusPacked}
                          </div>
                          <div className="pipeline-tracker-desc">Pending courier shipment</div>
                        </div>

                        <div className="pipeline-tracker-item">
                          <div className="pipeline-tracker-step">4. READY FOR SHIPMENT</div>
                          <div className="pipeline-tracker-val" style={{ color: 'var(--accent-emerald)' }}>
                            {facilityStatusShipped}
                          </div>
                          <div className="pipeline-tracker-desc">Deducted from physical stock</div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Warehouse Occupancy Capacities */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Operational Warehouse Capacities</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {analytics.warehouseDetails && analytics.warehouseDetails.map((wh) => {
                    const totalWhStock = wh.physicalStock || 0;
                    const limit = 500; // Simulated capacity threshold
                    const pct = Math.min(100, Math.round((totalWhStock / limit) * 100));
                    return (
                      <div key={wh.id} style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px' }}>
                        <div className="flex-between" style={{ marginBottom: '6px', flexWrap: 'wrap', gap: '6px' }}>
                          <div>
                            <strong style={{ fontSize: '14px' }}>{wh.name} ({wh.code})</strong>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '12px' }}>
                              Available Stock: <strong style={{ color: 'var(--accent-emerald)' }}>{wh.availableStock}</strong> | Reserved: <strong>{wh.allocatedStock}</strong>
                              {wh.damagedStock > 0 && (
                                <span style={{ color: 'var(--accent-rose, #ef4444)', marginLeft: '8px', fontWeight: '700' }}>
                                  • ⚠️ Quarantined: {wh.damagedStock} unit{wh.damagedStock > 1 ? 's' : ''}
                                </span>
                              )}
                            </span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: '600' }}>{totalWhStock} / {limit} Units ({pct}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${pct}%`, 
                            height: '100%', 
                            background: pct > 85 ? 'var(--accent-rose)' : pct > 60 ? 'var(--accent-amber)' : 'var(--accent-indigo)', 
                            borderRadius: '4px',
                            transition: 'width 0.4s ease'
                          }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FULFILLMENT WORKFLOW PIPELINE */}
          {activeTab === 'fulfillment' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={22} style={{ color: 'var(--accent-indigo)' }} />
                    Logistics Fulfillment Pipeline
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Process assigned customer orders through physical Pick → Pack → Dispatch & Ship → Delivery phases.
                  </p>
                </div>

                {/* Facility Scope Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Facility Filter:</span>
                  <select
                    value={facilityFilter}
                    onChange={(e) => setFacilityFilter(e.target.value)}
                    className="form-select"
                    style={{ fontSize: '12px', padding: '6px 12px', minWidth: '180px' }}
                  >
                    <option value="ALL">All Facilities Hub ({allocations.length})</option>
                    {warehouses.map(wh => (
                      <option key={wh.id} value={String(wh.id)}>
                        {wh.name} ({wh.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sub-tab Navigation */}
              <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', marginBottom: '20px', gap: '4px', overflowX: 'auto' }}>
                <button 
                  onClick={() => setFulfillmentSubTab('allocate')}
                  className={`btn ${fulfillmentSubTab === 'allocate' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '6px 6px 0 0', padding: '8px 16px', fontSize: '13px', borderBottom: 'none' }}
                >
                  1. Allocation Review ({allOrders.filter(o => o.status === 'CONFIRMED').length})
                </button>
                <button 
                  onClick={() => setFulfillmentSubTab('pick')}
                  className={`btn ${fulfillmentSubTab === 'pick' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '6px 6px 0 0', padding: '8px 16px', fontSize: '13px', borderBottom: 'none' }}
                >
                  2. Picking Queue ({displayedAllocations.filter(a => a.status === 'ALLOCATED').length})
                </button>
                <button 
                  onClick={() => setFulfillmentSubTab('pack')}
                  className={`btn ${fulfillmentSubTab === 'pack' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '6px 6px 0 0', padding: '8px 16px', fontSize: '13px', borderBottom: 'none' }}
                >
                  3. Packing Queue ({displayedAllocations.filter(a => a.status === 'PICKED').length})
                </button>
                <button 
                  onClick={() => setFulfillmentSubTab('ship')}
                  className={`btn ${fulfillmentSubTab === 'ship' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '6px 6px 0 0', padding: '8px 16px', fontSize: '13px', borderBottom: 'none' }}
                >
                  4. Carrier Dispatch ({displayedAllocations.filter(a => a.status === 'PACKED').length})
                </button>
                <button 
                  onClick={() => setFulfillmentSubTab('transit')}
                  className={`btn ${fulfillmentSubTab === 'transit' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ borderRadius: '6px 6px 0 0', padding: '8px 16px', fontSize: '13px', borderBottom: 'none' }}
                >
                  5. In Transit & Delivered ({displayedAllocations.filter(a => a.status === 'READY_FOR_SHIPMENT' || a.status === 'SHIPPED').length})
                </button>
              </div>

              {/* SUBTAB 1: WAREHOUSE ALLOCATION */}
              {fulfillmentSubTab === 'allocate' && (
                <div>
                  {allOrders.filter(o => o.status === 'CONFIRMED').length === 0 ? (
                    <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px' }}>
                      <CheckCircle2 className="cart-empty-icon" style={{ opacity: 0.2, color: 'var(--accent-emerald)' }} />
                      <p>All active order items have been allocated! No pending orders in queue.</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table" style={{ minWidth: '1200px' }}>
                        <thead>
                          <tr>
                            <th style={{ minWidth: '140px' }}>Order Details</th>
                            <th style={{ minWidth: '180px' }}>Recipients</th>
                            <th style={{ minWidth: '220px' }}>Items Placed</th>
                            <th style={{ minWidth: '160px' }}>Allocation Status</th>
                            <th style={{ textAlign: 'center', minWidth: '280px', width: '280px' }}>Allocation Control</th>
                          </tr>
                        </thead>
                        <tbody>
                          {allOrders.filter(o => o.status === 'CONFIRMED').map((ord) => {
                            const allocState = getAllocationStatus(ord.orderId, ord.items || []);
                            return (
                              <tr key={ord.id}>
                                <td>
                                  <div style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{ord.orderId}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ord.date}</div>
                                </td>
                                <td>
                                  <div style={{ fontWeight: '600', fontSize: '13px' }}>{ord.recipientName}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{ord.deliveryAddress}</div>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {ord.items && ord.items.map((item) => (
                                      <div key={item.id} style={{ fontSize: '12px' }}>
                                        {item.productName} <span style={{ color: 'var(--text-muted)' }}>x{item.quantity}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td>
                                  <span className={`badge ${allocState.class}`}>{allocState.label}</span>
                                </td>
                                <td>
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                    <button 
                                      onClick={() => handleAutoAllocate(ord.orderId)} 
                                      className="btn btn-secondary" 
                                      style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', gap: '4px', alignItems: 'center' }}
                                    >
                                      <PlayCircle size={13} /> Auto
                                    </button>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                      {ord.items && ord.items.map((item) => (
                                        <button
                                          key={item.id}
                                          onClick={() => openManualAllocation(ord.orderId, item)}
                                          className="btn btn-primary"
                                          style={{ padding: '4px 8px', fontSize: '10px' }}
                                        >
                                          Manual: {item.productName.substring(0, 12)}...
                                        </button>
                                      ))}
                                    </div>
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

              {/* SUBTAB 2: PICKING QUEUE */}
              {fulfillmentSubTab === 'pick' && (
                <div>
                  {displayedAllocations.filter(a => a.status === 'ALLOCATED').length === 0 ? (
                    <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px' }}>
                      <CheckCircle2 className="cart-empty-icon" style={{ opacity: 0.2, color: 'var(--accent-emerald)' }} />
                      <p>Picking queues are clear. No pending items to pull from bins.</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table" style={{ minWidth: '1050px' }}>
                        <thead>
                          <tr>
                            <th style={{ minWidth: '140px' }}>Order ID</th>
                            <th style={{ minWidth: '220px' }}>Product to Pick</th>
                            <th style={{ minWidth: '200px' }}>Target Warehouse</th>
                            <th style={{ minWidth: '140px' }}>Quantity</th>
                            <th style={{ textAlign: 'center', minWidth: '180px' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedAllocations.filter(a => a.status === 'ALLOCATED').map((alloc) => (
                            <tr key={alloc.id}>
                              <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{alloc.orderId}</td>
                              <td style={{ fontWeight: '600' }}>{alloc.productName}</td>
                              <td>
                                <strong style={{ color: 'var(--accent-blue)' }}>{alloc.warehouseName}</strong>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Code: {alloc.warehouseCode}</div>
                              </td>
                              <td style={{ fontSize: '14px', fontWeight: 'bold' }}>{alloc.quantity} units</td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  onClick={() => handlePickAllocation(alloc.id)} 
                                  className="btn btn-success" 
                                  style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', gap: '4px', alignItems: 'center', margin: '0 auto' }}
                                >
                                  <CheckCircle size={14} /> Confirm Pick
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 3: PACKING QUEUE */}
              {fulfillmentSubTab === 'pack' && (
                <div>
                  {displayedAllocations.filter(a => a.status === 'PICKED').length === 0 ? (
                    <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px' }}>
                      <CheckCircle2 className="cart-empty-icon" style={{ opacity: 0.2, color: 'var(--accent-emerald)' }} />
                      <p>Packaging tables are clear. No picked items require boxing.</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table" style={{ minWidth: '1150px' }}>
                        <thead>
                          <tr>
                            <th style={{ minWidth: '140px' }}>Order ID</th>
                            <th style={{ minWidth: '220px' }}>Product Name</th>
                            <th style={{ minWidth: '180px' }}>Warehouse Source</th>
                            <th style={{ minWidth: '120px' }}>Quantity</th>
                            <th style={{ minWidth: '200px' }}>Carton Style Selection</th>
                            <th style={{ textAlign: 'center', minWidth: '180px' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedAllocations.filter(a => a.status === 'PICKED').map((alloc) => (
                            <tr key={alloc.id}>
                              <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{alloc.orderId}</td>
                              <td style={{ fontWeight: '600' }}>{alloc.productName}</td>
                              <td>{alloc.warehouseName}</td>
                              <td style={{ fontWeight: 'bold' }}>{alloc.quantity}</td>
                              <td>
                                <select 
                                  value={packagingSelections[alloc.id] || 'Standard Box'}
                                  onChange={(e) => setPackagingSelections({
                                    ...packagingSelections,
                                    [alloc.id]: e.target.value
                                  })}
                                  className="form-select"
                                  style={{ padding: '6px', fontSize: '12px', width: '160px' }}
                                >
                                  <option value="Standard Box">📦 Standard Box</option>
                                  <option value="Bubble Wrap Envelope">✉️ Bubble Wrap Envelope</option>
                                  <option value="Eco-friendly Cardboard">🌱 Eco-friendly Cardboard</option>
                                  <option value="Fragile Wood Crate">🪵 Fragile Wood Crate</option>
                                </select>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  onClick={() => handlePackAllocation(alloc.id)} 
                                  className="btn btn-primary" 
                                  style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', gap: '4px', alignItems: 'center', margin: '0 auto' }}
                                >
                                  <Box size={14} /> Pack & Containerize
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 4: CARRIER DISPATCH */}
              {fulfillmentSubTab === 'ship' && (
                <div>
                  {displayedAllocations.filter(a => a.status === 'PACKED').length === 0 ? (
                    <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px' }}>
                      <CheckCircle2 className="cart-empty-icon" style={{ opacity: 0.2, color: 'var(--accent-emerald)' }} />
                      <p>All packed items have been dispatched to shipping carriers.</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table" style={{ minWidth: '1200px' }}>
                        <thead>
                          <tr>
                            <th style={{ minWidth: '140px' }}>Order ID</th>
                            <th style={{ minWidth: '220px' }}>Product & Quantity</th>
                            <th style={{ minWidth: '140px' }}>Packaging</th>
                            <th style={{ minWidth: '180px' }}>Carrier Partner</th>
                            <th style={{ minWidth: '220px' }}>Awb/Tracking Reference</th>
                            <th style={{ textAlign: 'center', minWidth: '180px' }}>Dispatch Control</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedAllocations.filter(a => a.status === 'PACKED').map((alloc) => (
                            <tr key={alloc.id}>
                              <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{alloc.orderId}</td>
                              <td>{alloc.productName} <span style={{ color: 'var(--text-secondary)' }}>x{alloc.quantity}</span></td>
                              <td>
                                <span className="badge badge-customer" style={{ fontSize: '11px' }}>{alloc.packagingType || 'Standard Box'}</span>
                              </td>
                              <td>
                                <select
                                  value="ShopStack Express"
                                  disabled
                                  className="form-select"
                                  style={{ padding: '6px', fontSize: '12px', width: '150px', background: 'var(--bg-card)' }}
                                >
                                  <option value="ShopStack Express">ShopStack Express</option>
                                </select>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <input 
                                    type="text"
                                    placeholder="Enter Tracking AWB"
                                    value={trackingNumbers[alloc.id] || ''}
                                    onChange={(e) => setTrackingNumbers({
                                      ...trackingNumbers,
                                      [alloc.id]: e.target.value
                                    })}
                                    className="form-input"
                                    style={{ padding: '6px', fontSize: '12px', width: '150px' }}
                                  />
                                  <button
                                    onClick={() => {
                                      const genTracking = 'AWB-' + Math.floor(10000000 + Math.random() * 90000000);
                                      setTrackingNumbers({ ...trackingNumbers, [alloc.id]: genTracking });
                                    }}
                                    className="btn btn-secondary"
                                    style={{ padding: '2px 6px', fontSize: '10px' }}
                                  >
                                    Gen
                                  </button>
                                </div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  onClick={() => handleShipAllocation(alloc.id)} 
                                  className="btn btn-success" 
                                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', gap: '4px', alignItems: 'center', margin: '0 auto' }}
                                >
                                  <Truck size={14} /> Ready for Shipment
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* SUBTAB 5: IN TRANSIT QUEUE */}
              {fulfillmentSubTab === 'transit' && (
                <div>
                  {displayedAllocations.filter(a => a.status === 'READY_FOR_SHIPMENT' || a.status === 'SHIPPED').length === 0 ? (
                    <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px' }}>
                      <CheckCircle2 className="cart-empty-icon" style={{ opacity: 0.2, color: 'var(--accent-emerald)' }} />
                      <p>No packages currently in transit.</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table" style={{ minWidth: '1150px' }}>
                        <thead>
                          <tr>
                            <th style={{ minWidth: '140px' }}>Order ID</th>
                            <th style={{ minWidth: '220px' }}>Product & Quantity</th>
                            <th style={{ minWidth: '140px' }}>Packaging</th>
                            <th style={{ minWidth: '200px' }}>Carrier & AWB</th>
                            <th style={{ textAlign: 'center', minWidth: '180px' }}>Delivery Control</th>
                          </tr>
                        </thead>
                        <tbody>
                          {displayedAllocations.filter(a => a.status === 'READY_FOR_SHIPMENT' || a.status === 'SHIPPED').map((alloc) => (
                            <tr key={alloc.id}>
                              <td style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{alloc.orderId}</td>
                              <td>{alloc.productName} <span style={{ color: 'var(--text-secondary)' }}>x{alloc.quantity}</span></td>
                              <td>
                                <span className="badge badge-customer" style={{ fontSize: '11px' }}>{alloc.packagingType || 'Standard Box'}</span>
                              </td>
                              <td>
                                <div style={{ fontSize: '13px', fontWeight: '600' }}>{alloc.courierPartner}</div>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>AWB: <code style={{ color: 'var(--accent-teal)' }}>{alloc.trackingNumber}</code></div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <button 
                                  onClick={() => handleAdvanceStatus(alloc.id, 'DELIVERED')} 
                                  className="btn btn-primary" 
                                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', gap: '4px', alignItems: 'center', margin: '0 auto', background: 'var(--accent-teal)', border: 'none', color: '#fff' }}
                                >
                                  <CheckCircle size={14} /> Mark Delivered
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* TAB 3: WAREHOUSE LOCAL STOCK */}
          {activeTab === 'inventory' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Package size={22} style={{ color: 'var(--accent-indigo)' }} />
                    Warehouse Inventory & Stock
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Physical stock located in this facility with real-time allocated reservations and available quantities.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setShowRestockModal(true)}
                    className="btn btn-primary"
                    style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={14} /> Replenish Stock
                  </button>
                  <button
                    onClick={fetchData}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
                  </button>
                </div>
              </div>

              {displayedInventories.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px' }}>
                  <Package className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No inventory records found for the selected facility.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ minWidth: '1200px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '220px' }}>Product Details</th>
                        <th style={{ minWidth: '130px' }}>Category</th>
                        <th style={{ minWidth: '180px' }}>Facility / Hub</th>
                        <th style={{ textAlign: 'center', minWidth: '130px' }}>Physical Count</th>
                        <th style={{ textAlign: 'center', minWidth: '130px' }}>Allocated Hold</th>
                        <th style={{ textAlign: 'center', minWidth: '140px' }}>Available to Pick</th>
                        <th style={{ textAlign: 'center', minWidth: '180px' }}>Quick Stock Adjustment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedInventories.map((inv) => (
                        <tr key={inv.id}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-input)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {inv.productImageUrl ? (
                                  <img src={formatImageUrl(inv.productImageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <ProductIcon name={inv.productName} category={inv.productCategory} size={16} />
                                )}
                              </div>
                              <div>
                                <strong>{inv.productName}</strong>
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>₹{inv.productPrice}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className="badge badge-customer">{inv.productCategory}</span></td>
                          <td>
                            <strong>{inv.warehouseName}</strong>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Code: {inv.warehouseCode}</div>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: '800' }}>{inv.quantity} units</td>
                          <td style={{ textAlign: 'center', color: 'var(--accent-blue)', fontWeight: '700' }}>{inv.allocated || 0}</td>
                          <td style={{ textAlign: 'center' }}>
                            <strong style={{ color: (inv.available || 0) < 5 ? '#ef4444' : '#10b981', fontSize: '14px' }}>
                              {inv.available || 0} units
                            </strong>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                              <button
                                onClick={() => handleUpdateInventoryDirect(inv.id, (inv.quantity || 0) - 1)}
                                className="btn btn-secondary"
                                style={{ padding: '2px 8px', fontSize: '12px' }}
                                disabled={inv.quantity <= (inv.allocated || 0)}
                              >
                                -
                              </button>
                              <span style={{ minWidth: '30px', fontWeight: '700', textAlign: 'center' }}>{inv.quantity}</span>
                              <button
                                onClick={() => handleUpdateInventoryDirect(inv.id, (inv.quantity || 0) + 1)}
                                className="btn btn-secondary"
                                style={{ padding: '2px 8px', fontSize: '12px' }}
                              >
                                +
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}



          {/* TAB 5: INWARD RETURNS & QC */}
          {activeTab === 'returns' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RotateCcw size={22} style={{ color: 'var(--accent-indigo)' }} /> Inward Returns & Quality Check (QC) Intake
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Inspect returned products against customer reasons and flag verification status for administrative refund clearance.
                  </p>
                </div>
              </div>

              {activeReturnsList.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px' }}>
                  <RotateCcw className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No customer return packages registered.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ minWidth: '1250px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '130px' }}>Date Requested</th>
                        <th style={{ minWidth: '140px' }}>Order ID</th>
                        <th style={{ minWidth: '220px' }}>Customer Reason</th>
                        <th style={{ minWidth: '140px' }}>Resolution Choice</th>
                        <th style={{ minWidth: '130px' }}>Refund Value</th>
                        <th style={{ minWidth: '150px' }}>Inspection Stage</th>
                        <th style={{ textAlign: 'center', minWidth: '140px' }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeReturnsList.map((r) => (
                        <tr key={r.id}>
                          <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{r.requestedAt}</td>
                          <td style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{r.orderId}</td>
                          <td>
                            <span className="badge badge-customer" style={{ fontSize: '10px' }}>{r.returnReasonCategory || 'DEFECTIVE'}</span>
                            <div style={{ fontSize: '12px', fontWeight: '500', marginTop: '2px' }}>{r.reason}</div>
                          </td>
                          <td>
                            <span className="badge" style={{ background: 'var(--bg-input)', fontSize: '11px' }}>{r.resolutionType || 'REFUND'}</span>
                          </td>
                          <td style={{ fontWeight: '700', color: 'var(--accent-emerald)' }}>₹{r.amount}</td>
                          <td>
                            {r.status === 'PENDING' ? (
                              r.returnStage === 'QC_PASSED' ? (
                                <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Check size={11} /> QC Passed
                                </span>
                              ) : r.returnStage === 'QC_FAILED' ? (
                                <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <X size={11} /> QC Failed
                                </span>
                              ) : r.returnStage === 'ITEM_RETURNED' ? (
                                <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  <Clock size={11} /> QC Inspection Pending
                                </span>
                              ) : (
                                <span className="badge badge-customer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-blue)', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                                  <Clock size={11} /> Awaiting Package Pickup
                                </span>
                              )
                            ) : r.status === 'PROCESSED' ? (
                              <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Check size={11} /> Passed & Refunded
                              </span>
                            ) : (
                              <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <X size={11} /> QC Failed / Rejected
                              </span>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedReturnDetails(r)}
                                className="btn btn-secondary"
                                style={{ fontSize: '11px', padding: '4px 8px' }}
                              >
                                <Eye size={12} /> Details
                              </button>
                              {r.status === 'PENDING' && (r.returnStage === 'REQUESTED' || r.returnStage === 'VENDOR_APPROVED' || r.returnStage === 'VENDOR_DISPUTED' || r.returnStage === 'ADMIN_APPROVED') && (
                                <button
                                  type="button"
                                  onClick={() => handleReceivePackage(r.id)}
                                  className="btn btn-success"
                                  style={{ fontSize: '11px', padding: '4px 8px', display: 'flex', gap: '4px', alignItems: 'center' }}
                                >
                                  Receive Package
                                </button>
                              )}
                              {r.status === 'PENDING' && r.returnStage === 'ITEM_RETURNED' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const isDamaged = (r.returnReasonCategory && (r.returnReasonCategory.toUpperCase().includes('DEFECT') || r.returnReasonCategory.toUpperCase().includes('DAMAGE'))) ||
                                      (r.reason && (r.reason.toLowerCase().includes('defect') || r.reason.toLowerCase().includes('damage')));

                                    // Find originating allocated warehouse for this specific order
                                    const orderAllocs = allocations.filter(a => a.orderId === r.orderId);
                                    const allocatedWhId = orderAllocs.find(a => a.warehouseId || a.warehouse)?.warehouseId 
                                      || (orderAllocs.find(a => a.warehouse)?.warehouse?.id)
                                      || (user.warehouseId ? String(user.warehouseId) : '')
                                      || (warehouses.length > 0 ? String(warehouses[0].id) : '');

                                    setQcForm({
                                      refundId: r.id,
                                      orderId: r.orderId,
                                      customerReason: r.reason,
                                      category: r.returnReasonCategory,
                                      isDamagedCategory: isDamaged,
                                      passed: true,
                                      restockOption: isDamaged ? 'DAMAGED_QUARANTINE' : 'RESELLABLE',
                                      warehouseId: String(allocatedWhId),
                                      notes: isDamaged ? 'Customer reported defective/damaged. Quarantining unit in originating warehouse.' : 'Inspected in resellable condition.',
                                      warehouseInspectionImage: ''
                                    });
                                    setShowQcModal(true);
                                  }}
                                  className="btn btn-primary"
                                  style={{ fontSize: '11px', padding: '4px 8px' }}
                                >
                                  Inspect QC
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DAMAGED GOODS & QUARANTINE SECTION */}
          {activeTab === 'damaged' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={22} style={{ color: 'var(--accent-rose, #ef4444)' }} /> 
                    Quarantine & Damaged Goods Facility
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    Segregated inventory holding for defective customer returns or failed QC items. Strictly isolated from main retail stock.
                  </p>
                </div>
              </div>

              {/* Damaged KPI Cards */}
              <div className="responsive-kpi-grid">
                <div className="metric-card" style={{ borderLeft: '4px solid #ef4444' }}>
                  <div className="flex-between">
                    <span className="metric-label" style={{ color: '#ef4444' }}>Total Quarantined Items</span>
                    <ShieldAlert size={18} style={{ color: '#ef4444' }} />
                  </div>
                  <div className="metric-value" style={{ color: '#ef4444' }}>
                    {damagedInventories.reduce((acc, curr) => acc + (curr.damagedQuantity || 0), 0)} units
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Across all warehouse bins</span>
                </div>

                <div className="metric-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <div className="flex-between">
                    <span className="metric-label">Quarantined Loss Valuation</span>
                    <Package size={18} style={{ color: '#f59e0b' }} />
                  </div>
                  <div className="metric-value" style={{ color: '#f59e0b' }}>
                    ₹{damagedInventories.reduce((acc, curr) => acc + ((curr.damagedQuantity || 0) * (curr.productPrice || 0)), 0).toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Estimated damaged asset value</span>
                </div>

                <div className="metric-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
                  <div className="flex-between">
                    <span className="metric-label">Affected SKUs</span>
                    <Box size={18} style={{ color: '#8b5cf6' }} />
                  </div>
                  <div className="metric-value" style={{ color: '#8b5cf6' }}>{damagedInventories.length}</div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Distinct products in quarantine</span>
                </div>
              </div>

              {/* Filter and Search Toolbar */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '10px', padding: '14px 18px', marginBottom: '20px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '220px' }}>
                  <input
                    type="text"
                    placeholder="Search damaged goods by product, category, or warehouse..."
                    value={damagedSearchTerm}
                    onChange={(e) => setDamagedSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ height: '36px', fontSize: '12px' }}
                  />
                </div>
                <div style={{ minWidth: '200px' }}>
                  <select
                    value={damagedWhFilter}
                    onChange={(e) => setDamagedWhFilter(e.target.value)}
                    className="form-select"
                    style={{ height: '36px', fontSize: '12px' }}
                  >
                    <option value="ALL">All Warehouses ({warehouses.length})</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Damaged Stock Table */}
              {filteredDamagedInventories.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 20px', background: 'var(--bg-card)', borderRadius: '12px', border: '1px dashed var(--border-light)' }}>
                  <CheckCircle2 size={40} style={{ color: 'var(--accent-emerald)', margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '16px', fontWeight: '700', margin: '0 0 6px 0' }}>No Damaged Items in Quarantine</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                    Any customer returns with defective/damaged issues routed during QC inspection will appear here for disposition.
                  </p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ minWidth: '1200px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '220px' }}>Product Details</th>
                        <th style={{ minWidth: '180px' }}>Quarantine Warehouse</th>
                        <th style={{ minWidth: '120px' }}>Unit Price</th>
                        <th style={{ minWidth: '130px', textAlign: 'center' }}>Damaged Units</th>
                        <th style={{ minWidth: '180px' }}>Total Quarantine Valuation</th>
                        <th style={{ textAlign: 'center', minWidth: '220px', width: '220px' }}>Disposition Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDamagedInventories.map((item) => {
                        const val = (item.damagedQuantity || 0) * (item.productPrice || 0);
                        return (
                          <tr key={item.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {item.productImageUrl ? (
                                  <img 
                                    src={formatImageUrl(item.productImageUrl)} 
                                    alt={item.productName} 
                                    style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-light)' }} 
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div style={{ width: '38px', height: '38px', borderRadius: '6px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Package size={18} style={{ color: 'var(--text-muted)' }} />
                                  </div>
                                )}
                                <div>
                                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{item.productName}</strong>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    Category: <span className="badge badge-customer" style={{ fontSize: '10px', padding: '1px 5px' }}>{item.productCategory}</span> • SKU: PROD-{item.productId}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <strong>{item.warehouseName}</strong>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Bin: {item.warehouseCode}</div>
                            </td>
                            <td style={{ fontWeight: '600' }}>₹{(item.productPrice || 0).toLocaleString('en-IN')}</td>
                            <td>
                              <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', padding: '4px 8px' }}>
                                <ShieldAlert size={12} /> {item.damagedQuantity} units quarantined
                              </span>
                            </td>
                            <td style={{ fontWeight: '700', color: 'var(--accent-rose, #ef4444)' }}>
                              ₹{val.toLocaleString('en-IN')}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenDamagedActionModal(item)}
                                className="btn btn-secondary"
                                style={{ fontSize: '11px', padding: '5px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                              >
                                <Edit size={12} /> Manage Disposition
                              </button>
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

      {/* MODAL 4: MANUAL ALLOCATION FOR AN ORDER ITEM */}
      {showManualAllocModal && (
        <div className="modal-overlay">
          <div className="dialog-content" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Manual Warehouse Stock Allocation</h2>
              <button onClick={() => setShowManualAllocModal(false)} className="btn-icon-only"><X size={18} /></button>
            </div>
            <form onSubmit={handleManualAllocate}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px' }}>
                  <div><strong>Order:</strong> {manualAllocForm.orderId}</div>
                  <div style={{ marginTop: '4px' }}>
                    <strong>Product:</strong> {selectedProductForAlloc?.name} (ID: {selectedProductForAlloc?.id})
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <strong>Requested Quantity:</strong> <strong style={{ color: 'var(--accent-indigo)' }}>{manualAllocForm.maxQty} units</strong>
                  </div>
                </div>

                <div>
                  <label className="form-label">Choose Warehouse Bin with Stock</label>
                  <select 
                    required
                    value={manualAllocForm.warehouseId}
                    onChange={(e) => setManualAllocForm({...manualAllocForm, warehouseId: e.target.value})}
                    className="form-select"
                  >
                    <option value="">-- Choose Warehouse --</option>
                    {warehouses.filter(w => w.active).map(w => {
                      const warehouseStock = inventories.find(i => i.warehouseId === w.id && i.productId === selectedProductForAlloc?.id);
                      const available = warehouseStock ? warehouseStock.available : 0;
                      return (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.code}) -- Stock Available: {available} units
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="form-label">Quantity to Allocate</label>
                  <input 
                    type="number" 
                    required 
                    min="1"
                    max={manualAllocForm.maxQty}
                    value={manualAllocForm.quantity}
                    onChange={(e) => setManualAllocForm({...manualAllocForm, quantity: Math.min(manualAllocForm.maxQty, parseInt(e.target.value) || 0)})}
                    className="form-input" 
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Cannot exceed requested amount of {manualAllocForm.maxQty}.
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowManualAllocModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Allocate Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Return Inspection Modal */}
      {selectedReturnDetails && (
        <div className="modal-overlay" onClick={() => setSelectedReturnDetails(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Return Package Inspection Details</h2>
              <button onClick={() => setSelectedReturnDetails(null)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{selectedReturnDetails.orderId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Return Reason:</span>
                  <strong>{selectedReturnDetails.reason}</strong>
                </div>
                {selectedReturnDetails.customerNotes && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Customer Notes:</span>
                    <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)' }}>{selectedReturnDetails.customerNotes}</p>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Refund Amount:</span>
                  <strong style={{ color: 'var(--accent-emerald)' }}>₹{selectedReturnDetails.amount}</strong>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedReturnDetails(null)} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: WAREHOUSE QC & RESTOCK */}
      {showQcModal && (
        <div className="modal-overlay">
          <div className="dialog-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Warehouse Return QC & Inventory Restock</h2>
              <button onClick={() => setShowQcModal(false)} className="btn-icon-only"><X size={18} /></button>
            </div>
            <form onSubmit={handleQcSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ display: 'block', marginBottom: '6px' }}>QC Inspection Outcome</label>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <input 
                        type="radio" 
                        name="qcPassed" 
                        checked={qcForm.passed === true}
                        onChange={() => setQcForm({...qcForm, passed: true})}
                      />
                      Passed QC Verification
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                      <input 
                        type="radio" 
                        name="qcPassed" 
                        checked={qcForm.passed === false}
                        onChange={() => setQcForm({...qcForm, passed: false})}
                      />
                      Failed QC / Rejected
                    </label>
                  </div>
                </div>

                {qcForm.passed && (
                  <div>
                    <label className="form-label">Restocking Category Choice</label>
                    <select 
                      required
                      value={qcForm.restockOption}
                      onChange={(e) => setQcForm({...qcForm, restockOption: e.target.value})}
                      className="form-select"
                    >
                      <option value="RESELLABLE">Resellable Item (Restock to Active Main Bin)</option>
                      <option value="DAMAGED">Damaged / Defective (Route to Damaged Quarantine Section)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="form-label">
                    {qcForm.passed && qcForm.restockOption === 'RESELLABLE' 
                      ? "Restock Destination Warehouse Bin (Adds to Main Stock)" 
                      : "Quarantine Warehouse Section (Damaged Stock - Main Stock Unaffected)"}
                  </label>
                  <select 
                    required
                    value={qcForm.warehouseId}
                    onChange={(e) => setQcForm({...qcForm, warehouseId: e.target.value})}
                    className="form-select"
                  >
                    <option value="">-- Choose Warehouse Location --</option>
                    {warehouses.filter(w => w.active).map(w => (
                      <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                    ))}
                  </select>
                  {qcForm.orderId && (
                    <div style={{ fontSize: '11px', color: 'var(--accent-teal)', marginTop: '4px', fontWeight: '600' }}>
                      ✓ Pre-routed to originating dispatch facility for Order {qcForm.orderId}.
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label">QC Observations / Notes</label>
                  <textarea 
                    required 
                    placeholder="e.g. Item package unopened, original tags attached." 
                    value={qcForm.notes}
                    onChange={(e) => setQcForm({...qcForm, notes: e.target.value})}
                    className="form-input"
                    style={{ minHeight: '60px', fontSize: '12px' }}
                  />
                </div>

                <div>
                  <label className="form-label">QC Verification Photo URL (Optional)</label>
                  <input 
                    type="url"
                    placeholder="https://example.com/inspected-item.jpg"
                    value={qcForm.warehouseInspectionImage}
                    onChange={(e) => setQcForm({...qcForm, warehouseInspectionImage: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowQcModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit QC Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL 6: DAMAGED GOODS DISPOSITION ACTION */}
      {showDamagedActionModal && selectedDamagedItem && (
        <div className="modal-overlay">
          <div className="dialog-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={20} style={{ color: 'var(--accent-rose, #ef4444)' }} />
                <h2 className="modal-title">Damaged Stock Disposition</h2>
              </div>
              <button onClick={() => setShowDamagedActionModal(false)} className="btn-icon-only"><X size={18} /></button>
            </div>
            <form onSubmit={submitDamagedAction}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
                <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div>Product: <strong>{selectedDamagedItem.productName}</strong></div>
                  <div>Warehouse: <strong>{selectedDamagedItem.warehouseName} ({selectedDamagedItem.warehouseCode})</strong></div>
                  <div>Currently Quarantined: <strong style={{ color: '#ef4444' }}>{selectedDamagedItem.damagedQuantity} units</strong></div>
                  <div>Unit Price: <strong>₹{selectedDamagedItem.productPrice || 0}</strong></div>
                </div>

                <div>
                  <label className="form-label">Select Disposition Strategy *</label>
                  <select
                    value={damagedActionForm.action}
                    onChange={(e) => setDamagedActionForm({...damagedActionForm, action: e.target.value})}
                    className="form-select"
                  >
                    <option value="WRITE_OFF">Write-off / Scrap (Deduct from quarantine, destroy item)</option>
                    <option value="RETURN_TO_VENDOR">Return to Vendor / RTV (Deduct from quarantine, dispatch to supplier)</option>
                    <option value="REFURBISHED">Refurbished / Repaired (Move from quarantine to active main stock)</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">Units to Process (Max: {selectedDamagedItem.damagedQuantity}) *</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedDamagedItem.damagedQuantity}
                    required
                    value={damagedActionForm.quantity}
                    onChange={(e) => setDamagedActionForm({...damagedActionForm, quantity: Math.min(selectedDamagedItem.damagedQuantity, Math.max(1, parseInt(e.target.value) || 1))})}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">Inspection & Action Notes</label>
                  <textarea
                    placeholder="e.g. Scrapped item per vendor RMA warranty policy."
                    value={damagedActionForm.notes}
                    onChange={(e) => setDamagedActionForm({...damagedActionForm, notes: e.target.value})}
                    className="form-input"
                    style={{ minHeight: '60px', fontSize: '12px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" onClick={() => setShowDamagedActionModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Apply Action</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RETURN PACKAGE QC INSPECTION */}
      {showQcModal && (
        <div className="modal-overlay" onClick={() => setShowQcModal(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={20} style={{ color: 'var(--accent-indigo)' }} />
                Return Quality Control (QC) Inspection
              </h2>
              <button onClick={() => setShowQcModal(false)} className="btn-icon-only"><X size={18} /></button>
            </div>

            <form onSubmit={handleQcSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '8px 0' }}>
              <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '8px', fontSize: '12px' }}>
                <div><strong>Order Reference:</strong> <span style={{ fontFamily: 'monospace', color: 'var(--accent-indigo)' }}>{qcForm.orderId}</span></div>
                <div style={{ marginTop: '4px' }}>
                  <strong>Return Reason Category:</strong> <span className={`badge ${qcForm.isDamagedCategory ? 'badge-rejected' : 'badge-customer'}`}>{qcForm.category || 'DEFECTIVE_DAMAGED'}</span>
                </div>
                <div style={{ marginTop: '4px' }}><strong>Customer Reason:</strong> {qcForm.customerReason}</div>
              </div>

              {qcForm.isDamagedCategory ? (
                <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#ef4444' }}>
                  <strong>⚠️ Defective / Damaged Return:</strong> This item was returned due to defect or damage. It will be routed to <strong>Damaged & Quarantine Stock</strong> and will <strong>NOT</strong> be restored to main sellable retail inventory.
                </div>
              ) : (
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#10b981' }}>
                  <strong>✓ Resellable Return:</strong> This item was returned for non-defective reasons (e.g. wrong item / changed mind). Upon QC approval, it will be restored to <strong>Main Sellable Stock</strong> in the warehouse.
                </div>
              )}

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '700' }}>Inspection Outcome *</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="passed"
                      checked={qcForm.passed === true}
                      onChange={() => setQcForm({ ...qcForm, passed: true })}
                    />
                    <span>QC Inspection Passed</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="passed"
                      checked={qcForm.passed === false}
                      onChange={() => setQcForm({ ...qcForm, passed: false, restockOption: 'DAMAGED_QUARANTINE' })}
                    />
                    <span>QC Inspection Failed</span>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '700' }}>Inventory Routing *</label>
                <select
                  value={qcForm.restockOption}
                  onChange={(e) => setQcForm({ ...qcForm, restockOption: e.target.value })}
                  className="form-select"
                >
                  <option value="DAMAGED_QUARANTINE">Route to Damaged & Quarantine (Main Stock Remains Reduced)</option>
                  <option value="RESELLABLE">Restore to Main Sellable Stock (Available for Resale)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: '700' }}>Warehouse Facility *</label>
                <select
                  value={qcForm.warehouseId}
                  onChange={(e) => setQcForm({ ...qcForm, warehouseId: e.target.value })}
                  className="form-select"
                  required
                >
                  <option value="">Select Warehouse Hub...</option>
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Staff QC Verification Notes</label>
                <textarea
                  rows="2"
                  value={qcForm.notes}
                  onChange={(e) => setQcForm({ ...qcForm, notes: e.target.value })}
                  className="form-input"
                  placeholder="Enter condition notes or inspection findings..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowQcModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  Submit QC Inspection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
