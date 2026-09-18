import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Check, X, ShieldAlert, AlertCircle, Bell, Store, Mail, Phone, MapPin, User,
  Activity, Receipt, IndianRupee, RefreshCw, Search, RotateCcw, CheckCircle, CheckCircle2,
  Clock, AlertTriangle, Eye, DollarSign, Package, ShieldCheck, ArrowRight,
  Truck, CornerUpLeft, ThumbsUp, ThumbsDown, Users, BarChart3, Settings, 
  FileSpreadsheet, HardDrive, Database, TrendingUp, Ticket, ArrowRightLeft, Plus, FileText,
  Trash2, Layers, Tag, ExternalLink, Power, Ban, Sun, Moon, ArrowLeft, ChevronDown, LogOut,
  Star, MessageSquare
} from 'lucide-react';
import ProductIcon from './ProductIcon';
import NotificationCenter from './NotificationCenter';
import { extractErrorMessage } from '../utils/errorHandler';
import { formatImageUrl } from '../utils/imageHelper';
import { 
  generateAdminNotifications, 
  markNotifAsRead, 
  markAllNotifsAsRead, 
  clearAllNotifs, 
  dismissNotif 
} from '../utils/notificationService';

export default function AdminDashboard({ user, onGoToHome, onGoToProfile, theme, onToggleTheme, onLogout, initialTab = 'overview' }) {
  const getSanitizedTab = (tab) => {
    if (typeof tab === 'string' && tab) {
      return tab === 'orders' ? 'monitoring' : tab;
    }
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getSanitizedTab(initialTab)); // 'overview' | 'vendors' | 'products' | 'returns' | 'monitoring' | 'transactions' | 'settlements' | 'system' | 'reports'

  useEffect(() => {
    setActiveTab(getSanitizedTab(initialTab));
  }, [initialTab]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [flashMessage, setFlashMessage] = useState({ type: '', text: '' });
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

  // Promo Coupons States
  const [coupons, setCoupons] = useState([]);
  const [couponAnalytics, setCouponAnalytics] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [couponFormData, setCouponFormData] = useState({
    id: null,
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minOrderAmount: '',
    maxDiscount: '',
    startDate: '',
    startTime: '00:00',
    expiryDate: '',
    expiryTime: '23:59',
    usageLimit: '',
    active: true
  });
  const [isEditingCoupon, setIsEditingCoupon] = useState(false);
  
  // Notification states
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Product Modal states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Dashboard Summary / Overview States
  const [dashboardSummary, setDashboardSummary] = useState({
    totalSalesVolume: 0,
    totalCommission: 0,
    totalPayouts: 0,
    totalOrders: 0,
    totalProducts: 0,
    pendingProducts: 0,
    approvedProducts: 0,
    lowStockProducts: 0,
    totalVendors: 0,
    totalCustomers: 0,
    categoryDistribution: {},
    recentOrders: []
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);

  // Vendor Management States
  const [vendorsList, setVendorsList] = useState([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');
  const [selectedVendorDetail, setSelectedVendorDetail] = useState(null);
  const [tempCommissionRate, setTempCommissionRate] = useState('');
  const [vendorProducts, setVendorProducts] = useState([]);
  const [isLoadingVendorProducts, setIsLoadingVendorProducts] = useState(false);
  const [inspectingProductDetail, setInspectingProductDetail] = useState(null);
  const [vendorDetailTab, setVendorDetailTab] = useState('products'); // 'products' | 'overview'

  // Dynamic Admin Notifications State
  const [notificationList, setNotificationList] = useState([]);

  const refreshNotifications = () => {
    const list = generateAdminNotifications({
      user,
      pendingProductsCount: pendingProducts?.length || 0,
      ordersCount: dashboardSummary?.totalOrders || 0,
      vendorsCount: vendorsList?.length || 0,
      onGoToTab: (tab) => {
        const targetTab = (tab === 'orders' || tab === 'monitoring') ? 'monitoring' : tab;
        setActiveTab(targetTab);
        if (targetTab === 'monitoring') fetchMonitoring();
        else if (targetTab === 'vendors') fetchVendors();
        else if (targetTab === 'products') fetchPendingProducts();
        else if (targetTab === 'reviews') fetchAdminReviews();
        else if (targetTab === 'returns') fetchReturnRequests();
        else if (targetTab === 'warehouses') fetchWarehousesAndAllocations();
        else if (targetTab === 'transactions') fetchTransactions();
        else if (targetTab === 'settlements') fetchSettlements();
        else if (targetTab === 'coupons') { fetchCoupons(); fetchCouponAnalytics(); }
        else if (targetTab === 'system') fetchSystemStatus();
        else if (targetTab === 'reports') fetchReportData(reportType);
      }
    });
    setNotificationList(list);
  };

  useEffect(() => {
    refreshNotifications();
  }, [user, pendingProducts, dashboardSummary, vendorsList]);

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

  // System Diagnostics States
  const [systemStatus, setSystemStatus] = useState({
    apiStatus: 'OFFLINE',
    dbStatus: 'OFFLINE',
    razorpayStatus: 'UNKNOWN',
    uptime: '00:00:00',
    processors: 0,
    jvmMaxMemory: 0,
    jvmTotalMemory: 0,
    jvmUsedMemory: 0,
    jvmFreeMemory: 0,
    dbTotalUsers: 0,
    dbTotalProducts: 0,
    dbTotalOrders: 0,
    dbTotalSettlements: 0,
    dbTotalRefunds: 0,
    storageImagesCount: 0,
    storageTotalSizeMB: 0
  });
  const [isLoadingSystem, setIsLoadingSystem] = useState(false);

  // Reports States
  const [reportType, setReportType] = useState('SALES');
  const [reportRecords, setReportRecords] = useState([]);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportSearch, setReportSearch] = useState('');

  // Return & Refund Requests States
  const [returnRequests, setReturnRequests] = useState([]);
  const [isLoadingReturns, setIsLoadingReturns] = useState(false);
  const [returnFilter, setReturnFilter] = useState('PENDING'); // 'ALL' | 'PENDING' | 'PROCESSED' | 'REJECTED'
  const [returnSearch, setReturnSearch] = useState('');
  const [selectedReturnCase, setSelectedReturnCase] = useState(null);
  const [targetRejectRefund, setTargetRejectRefund] = useState(null);
  const [rejectReasonText, setRejectReasonText] = useState('');
  const [isProcessingReturnAction, setIsProcessingReturnAction] = useState(false);
  const [resolutionChoice, setResolutionChoice] = useState('REFUND');
  const [resolutionNotes, setResolutionNotes] = useState('Quality check approved.');

  // Payment Monitoring States
  const [monitoringMetrics, setMonitoringMetrics] = useState({
    totalOrders: 0,
    paidCount: 0,
    pendingCount: 0,
    failedCount: 0,
    refundedCount: 0,
    totalPaidVolume: 0
  });
  const [monitoringOrders, setMonitoringOrders] = useState([]);
  const [monitoringFilter, setMonitoringFilter] = useState('ALL');
  const [monitoringSearch, setMonitoringSearch] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [isLoadingMonitoring, setIsLoadingMonitoring] = useState(false);

  // Platform Transactions States
  const [transactions, setTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [txFilter, setTxFilter] = useState('ALL');
  const [txSearch, setTxSearch] = useState('');

  // Vendor Settlements States
  const [settlements, setSettlements] = useState([]);
  const [settlementsSummary, setSettlementsSummary] = useState({
    totalGross: 0,
    totalCommission: 0,
    totalNetPayout: 0,
    pendingPayout: 0,
    settledPayout: 0,
    totalSettlementRecords: 0
  });
  const [settlementFilter, setSettlementFilter] = useState('ALL');
  const [settlementSearch, setSettlementSearch] = useState('');
  const [isSettlingId, setIsSettlingId] = useState(null);
  const [isLoadingSettlements, setIsLoadingSettlements] = useState(false);

  // Direct Refund Modal States (Immediate Admin Override)
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundTargetOrder, setRefundTargetOrder] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [isProcessingRefund, setIsProcessingRefund] = useState(false);

  // Warehouse Logistics & Order Allocation States
  const [warehousesList, setWarehousesList] = useState([]);
  const [warehouseInventories, setWarehouseInventories] = useState([]);
  const [warehouseAllocations, setWarehouseAllocations] = useState([]);
  const [warehouseAnalytics, setWarehouseAnalytics] = useState({});
  const [adminOrders, setAdminOrders] = useState([]);
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  const [allocWhSelection, setAllocWhSelection] = useState({});
  const [allocSearchTerm, setAllocSearchTerm] = useState('');
  const [allocFilterStatus, setAllocFilterStatus] = useState('UNALLOCATED'); // 'ALL' | 'UNALLOCATED' | 'ALLOCATED' | 'DELIVERED'
  const [showAddWhAdminModal, setShowAddWhAdminModal] = useState(false);
  const [showEditWhAdminModal, setShowEditWhAdminModal] = useState(false);
  const [adminWhForm, setAdminWhForm] = useState({ id: null, name: '', code: '', address: '', city: '', active: true });
  const [selectedAdminWhId, setSelectedAdminWhId] = useState('ALL');

  // Multi-Warehouse Module Sub-Tabs ('allocation_desk' | 'facilities' | 'inventory' | 'transfers' | 'inbound_audit')
  const [adminWhModuleSubTab, setAdminWhModuleSubTab] = useState('allocation_desk');

  // Product Stock Distribution across Warehouses States
  const [showDistributeStockModal, setShowDistributeStockModal] = useState(false);
  const [distributeTargetProduct, setDistributeTargetProduct] = useState(null);
  const [distributeInputs, setDistributeInputs] = useState({}); // { [warehouseId]: quantity }
  const [isSubmittingDistribute, setIsSubmittingDistribute] = useState(false);

  // Stock Transfer & Distribution Control States
  const [adminStockTransfers, setAdminStockTransfers] = useState([]);
  const [isLoadingAdminTransfers, setIsLoadingAdminTransfers] = useState(false);
  const [showCreateTransferAdminModal, setShowCreateTransferAdminModal] = useState(false);
  const [adminTransferForm, setAdminTransferForm] = useState({
    sourceOrigin: 'VENDOR',
    sourceWarehouseId: 'VENDOR',
    destinationWarehouseId: 'ALL',
    productId: '',
    quantity: 10,
    distributions: {},
    transferReason: 'VENDOR_STOCK_DISTRIBUTION',
    notes: ''
  });
  const [isSubmittingTransfer, setIsSubmittingTransfer] = useState(false);
  const [allProductsList, setAllProductsList] = useState([]);

  // Customer Reviews & Ratings States
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    totalReviews: 0,
    averageRating: 0.0,
    breakdown: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
    positiveCount: 0,
    criticalCount: 0
  });
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewSearchTerm, setReviewSearchTerm] = useState('');
  const [reviewFilterRating, setReviewFilterRating] = useState('ALL');
  const [isDeletingReviewId, setIsDeletingReviewId] = useState(null);
  const [adminReviewLightboxImg, setAdminReviewLightboxImg] = useState(null);

  const fetchAdminReviews = async () => {
    setIsLoadingReviews(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin/reviews');
      setReviewsData(res.data || {
        reviews: [],
        totalReviews: 0,
        averageRating: 0.0,
        breakdown: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 },
        positiveCount: 0,
        criticalCount: 0
      });
    } catch (err) {
      console.error("Failed to load customer reviews", err);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const handleDeleteCustomerReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this customer review?")) return;
    setIsDeletingReviewId(reviewId);
    try {
      await axios.delete(`http://localhost:8080/api/admin/reviews/${reviewId}`);
      showFlash('success', 'Customer review removed successfully.');
      fetchAdminReviews();
    } catch (err) {
      showFlash('error', 'Failed to remove customer review.');
    } finally {
      setIsDeletingReviewId(null);
    }
  };

  const dropdownRef = useRef(null);

  const fetchAdminStockTransfers = async () => {
    setIsLoadingAdminTransfers(true);
    try {
      const res = await axios.get('http://localhost:8080/api/stock-transfers/all');
      setAdminStockTransfers(res.data || []);
    } catch (err) {
      console.error("Failed to fetch stock transfers", err);
    } finally {
      setIsLoadingAdminTransfers(false);
    }
  };

  const handleCreateAdminStockTransfer = async (e) => {
    e.preventDefault();
    if (!adminTransferForm.productId) {
      showFlash('error', 'Please select a product listed by the vendor.');
      return;
    }

    setIsSubmittingTransfer(true);
    try {
      if (adminTransferForm.destinationWarehouseId === 'ALL') {
        // Multi-warehouse distribution across all regional hubs
        const activeWhs = warehousesList.filter(w => w.active);
        const distList = activeWhs.map(w => ({
          warehouseId: w.id,
          quantity: parseInt(adminTransferForm.distributions[w.id]) || 0
        }));
        const totalUnits = distList.reduce((sum, d) => sum + d.quantity, 0);

        if (totalUnits <= 0) {
          showFlash('error', 'Please enter at least 1 unit to distribute across regional warehouses.');
          setIsSubmittingTransfer(false);
          return;
        }

        // 1. Distribute stock to warehouses inventory
        await axios.post('http://localhost:8080/api/warehouses/distribute-stock', {
          productId: parseInt(adminTransferForm.productId),
          distributions: distList
        });

        // 2. Create distribution records for tracking
        for (const dist of distList) {
          if (dist.quantity > 0) {
            try {
              await axios.post('http://localhost:8080/api/stock-transfers/create', {
                sourceWarehouseId: null,
                destinationWarehouseId: dist.warehouseId,
                productId: parseInt(adminTransferForm.productId),
                quantity: dist.quantity,
                transferReason: adminTransferForm.transferReason || 'VENDOR_STOCK_DISTRIBUTION',
                notes: adminTransferForm.notes || 'Vendor listed stock distributed across regional fulfillment hubs.'
              });
            } catch (ignore) {}
          }
        }
        showFlash('success', `Vendor stock (${totalUnits} units) distributed across regional warehouses successfully!`);
      } else {
        // Single warehouse allocation
        const targetWhId = parseInt(adminTransferForm.destinationWarehouseId);
        const qty = parseInt(adminTransferForm.quantity) || 1;
        const isFromVendor = adminTransferForm.sourceWarehouseId === 'VENDOR' || !adminTransferForm.sourceWarehouseId;

        await axios.post('http://localhost:8080/api/stock-transfers/create', {
          sourceWarehouseId: isFromVendor ? null : parseInt(adminTransferForm.sourceWarehouseId),
          destinationWarehouseId: targetWhId,
          productId: parseInt(adminTransferForm.productId),
          quantity: qty,
          transferReason: adminTransferForm.transferReason || 'VENDOR_STOCK_DISTRIBUTION',
          notes: adminTransferForm.notes || 'Stock allocated from vendor to warehouse.'
        });
        showFlash('success', `Stock (${qty} units) allocated to destination warehouse successfully.`);
      }

      setShowCreateTransferAdminModal(false);
      setAdminTransferForm({
        sourceOrigin: 'VENDOR',
        sourceWarehouseId: 'VENDOR',
        destinationWarehouseId: 'ALL',
        productId: '',
        quantity: 10,
        distributions: {},
        transferReason: 'VENDOR_STOCK_DISTRIBUTION',
        notes: ''
      });
      fetchAdminStockTransfers();
      fetchWarehousesAndAllocations();
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to distribute stock.');
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  const fetchDashboardSummary = async () => {
    setIsLoadingSummary(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin/dashboard-summary');
      if (res.data) setDashboardSummary(res.data);
    } catch (err) {
      console.error("Failed to load dashboard summary", err);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const fetchVendorsList = async () => {
    setIsLoadingVendors(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin/vendors');
      if (res.data) setVendorsList(res.data);
    } catch (err) {
      console.error("Failed to load vendors stats", err);
    } finally {
      setIsLoadingVendors(false);
    }
  };

  const handleInspectVendor = (vendor) => {
    setSelectedVendorDetail(vendor);
    setTempCommissionRate(vendor.commissionRate !== null && vendor.commissionRate !== undefined ? vendor.commissionRate.toString() : '');
    setVendorDetailTab('products');
    fetchVendorProducts(vendor.id);
  };

  const fetchVendorProducts = async (vendorId) => {
    setIsLoadingVendorProducts(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/admin/vendors/${vendorId}/products`);
      setVendorProducts(res.data || []);
    } catch (err) {
      console.error("Failed to load vendor products", err);
      try {
        const fallbackRes = await axios.get(`http://localhost:8080/api/products/vendor/${vendorId}`);
        setVendorProducts(fallbackRes.data || []);
      } catch (e) {
        setVendorProducts([]);
      }
    } finally {
      setIsLoadingVendorProducts(false);
    }
  };

  const handleAdminDeleteProduct = async (productId, productName = 'Product') => {
    if (!window.confirm(`⚠️ PERMANENT PRODUCT DELETION:\n\nAre you sure you want to permanently delete "${productName}" (Product #${productId})?\n\nThis will remove the product, all catalog media, reviews, and inventory allocations. This action cannot be undone.`)) {
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/admin/products/${productId}`);
      showFlash('success', `Product "${productName}" was permanently deleted by Admin.`);
      if (selectedVendorDetail) {
        fetchVendorProducts(selectedVendorDetail.id);
      }
      if (inspectingProductDetail && inspectingProductDetail.id === productId) {
        setInspectingProductDetail(null);
      }
      fetchVendorsList();
      fetchDashboardSummary();
      fetchPendingProducts();
    } catch (err) {
      console.error("Failed to delete product", err);
      showFlash('error', err.response?.data?.message || err.response?.data || 'Failed to delete product.');
    }
  };

  const handleUpdateCommissionRate = async (vendorId, rate) => {
    try {
      await axios.put(`http://localhost:8080/api/admin/vendors/${vendorId}/commission-rate`, {
        commissionRate: rate === '' ? null : parseFloat(rate)
      });
      showFlash('success', 'Vendor commission rate updated successfully.');
      fetchVendorsList();
      setSelectedVendorDetail(prev => ({
        ...prev,
        commissionRate: rate === '' ? null : parseFloat(rate)
      }));
    } catch (err) {
      console.error("Failed to update commission rate", err);
      showFlash('error', err.response?.data || 'Failed to update commission rate.');
    }
  };

  const fetchSystemStatus = async () => {
    setIsLoadingSystem(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin/system-status');
      if (res.data) setSystemStatus(res.data);
    } catch (err) {
      console.error("Failed to load system status", err);
    } finally {
      setIsLoadingSystem(false);
    }
  };

  const fetchReportData = async (type = reportType) => {
    setIsLoadingReport(true);
    try {
      const res = await axios.get(`http://localhost:8080/api/admin/reports/generate?type=${type}`);
      if (res.data) setReportRecords(res.data);
    } catch (err) {
      console.error("Failed to load report data", err);
      setReportRecords([]);
    } finally {
      setIsLoadingReport(false);
    }
  };

  const handleExportCSV = async (type = reportType) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/admin/reports/export?type=${type}`, {
        responseType: 'blob'
      });
      
      let filename = `report_${type.toLowerCase()}_${Date.now()}.csv`;
      const disposition = res.headers && (res.headers['content-disposition'] || res.headers['Content-Disposition']);
      if (disposition && disposition.indexOf('filename=') !== -1) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '').trim();
        }
      }

      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showFlash('success', `${type} Business Report CSV downloaded successfully!`);
    } catch (err) {
      console.error("Failed to export CSV report", err);
      showFlash('error', `Failed to export ${type} report CSV. Please try again.`);
    }
  };

  const fetchCoupons = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/coupons');
      setCoupons(res.data);
    } catch (err) {
      console.error("Failed to fetch coupons", err);
    }
  };

  const fetchCouponAnalytics = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/coupons/analytics');
      setCouponAnalytics(res.data);
    } catch (err) {
      console.error("Failed to fetch coupon analytics", err);
    }
  };

  const handleCreateOrCreateCoupon = async (e) => {
    e.preventDefault();
    if (!couponFormData.code.trim()) {
      alert("Coupon code is required");
      return;
    }
    
    const payload = {
      ...couponFormData,
      code: couponFormData.code.toUpperCase().trim(),
      minOrderAmount: couponFormData.minOrderAmount ? parseFloat(couponFormData.minOrderAmount) : null,
      maxDiscount: couponFormData.maxDiscount ? parseFloat(couponFormData.maxDiscount) : null,
      usageLimit: couponFormData.usageLimit ? parseInt(couponFormData.usageLimit) : null,
      startDate: couponFormData.startDate + 'T' + (couponFormData.startTime || '00:00') + ':00',
      expiryDate: couponFormData.expiryDate + 'T' + (couponFormData.expiryTime || '23:59') + ':00'
    };

    try {
      if (isEditingCoupon) {
        await axios.put(`http://localhost:8080/api/coupons/${couponFormData.id}`, payload);
      } else {
        await axios.post('http://localhost:8080/api/coupons', payload);
      }
      setShowCouponModal(false);
      fetchCoupons();
      fetchCouponAnalytics();
      showFlash('success', `Coupon campaign saved successfully!`);
    } catch (err) {
      alert(err.response?.data || "Failed to save coupon.");
    }
  };

  const handleToggleCoupon = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/coupons/${id}/toggle`);
      fetchCoupons();
      fetchCouponAnalytics();
      showFlash('success', `Coupon status updated.`);
    } catch (err) {
      console.error("Failed to toggle coupon status", err);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/coupons/${id}`);
      fetchCoupons();
      fetchCouponAnalytics();
      showFlash('success', `Coupon deleted.`);
    } catch (err) {
      console.error("Failed to delete coupon", err);
    }
  };

  const openAddCouponModal = () => {
    const tzOffset = new Date().getTimezoneOffset() * 60000;
    const nowLocalDate = new Date(Date.now() - tzOffset).toISOString();
    const futureLocalDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 - tzOffset).toISOString();
    
    setCouponFormData({
      id: null,
      code: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      minOrderAmount: '',
      maxDiscount: '',
      startDate: nowLocalDate.split('T')[0],
      startTime: nowLocalDate.split('T')[1].substring(0, 5),
      expiryDate: futureLocalDate.split('T')[0],
      expiryTime: '23:59',
      usageLimit: '',
      active: true
    });
    setIsEditingCoupon(false);
    setShowCouponModal(true);
  };

  const openEditCouponModal = (coupon) => {
    setCouponFormData({
      id: coupon.id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount || '',
      maxDiscount: coupon.maxDiscount || '',
      startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
      startTime: coupon.startDate && coupon.startDate.includes('T') ? coupon.startDate.split('T')[1].substring(0, 5) : '00:00',
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '',
      expiryTime: coupon.expiryDate && coupon.expiryDate.includes('T') ? coupon.expiryDate.split('T')[1].substring(0, 5) : '23:59',
      usageLimit: coupon.usageLimit || '',
      active: coupon.active
    });
    setIsEditingCoupon(true);
    setShowCouponModal(true);
  };

  const getReturnAnalytics = () => {
    const productStats = {};
    const vendorStats = {};
    let totalRatings = 0;
    let ratingCount = 0;

    // Calculate rating stats
    if (Array.isArray(monitoringOrders)) {
      monitoringOrders.forEach(o => {
        if (o.feedbackRating != null && o.feedbackRating > 0) {
          totalRatings += o.feedbackRating;
          ratingCount += 1;
        }
      });
    }

    const avgCsat = ratingCount > 0 ? (totalRatings / ratingCount).toFixed(1) : 'N/A';

    // Calculate return count per product and vendor
    if (Array.isArray(returnRequests) && Array.isArray(monitoringOrders)) {
      returnRequests.forEach(r => {
        const parentOrder = monitoringOrders.find(o => o.orderId === r.orderId);
        if (parentOrder && parentOrder.items) {
          parentOrder.items.forEach(item => {
            const pName = item.productName || item.name || `Product #${item.productId}`;
            if (!productStats[pName]) {
              productStats[pName] = { name: pName, returns: 0, sales: 0 };
            }
            productStats[pName].returns += item.quantity;
            
            const vKey = item.vendorId || 'SYSTEM';
            if (!vendorStats[vKey]) {
              vendorStats[vKey] = { vendorId: vKey, returns: 0, sales: 0 };
            }
            vendorStats[vKey].returns += item.quantity;
          });
        }
      });
    }

    // Calculate sales counts
    if (Array.isArray(monitoringOrders)) {
      monitoringOrders.forEach(o => {
        if (o.items) {
          o.items.forEach(item => {
            const pName = item.productName || item.name || `Product #${item.productId}`;
            if (!productStats[pName]) {
              productStats[pName] = { name: pName, returns: 0, sales: 0 };
            }
            productStats[pName].sales += item.quantity;

            const vKey = item.vendorId || 'SYSTEM';
            if (!vendorStats[vKey]) {
              vendorStats[vKey] = { vendorId: vKey, returns: 0, sales: 0 };
            }
            vendorStats[vKey].sales += item.quantity;
          });
        }
      });
    }

    // Convert to arrays
    const productList = Object.values(productStats).map(p => {
      const rate = p.sales > 0 ? ((p.returns / p.sales) * 100).toFixed(1) : '0.0';
      return { ...p, rate };
    }).filter(p => p.returns > 0).sort((a, b) => b.returns - a.returns).slice(0, 5);

    const vendorList = Object.values(vendorStats).map(v => {
      const rate = v.sales > 0 ? ((v.returns / v.sales) * 100).toFixed(1) : '0.0';
      return { ...v, rate };
    }).filter(v => v.returns > 0).sort((a, b) => b.returns - a.returns).slice(0, 5);

    return { avgCsat, ratingCount, productList, vendorList };
  };

  useEffect(() => {
    fetchDashboardSummary();
    fetchPendingProducts();
    fetchVendorsList();
    fetchReturnRequests();
  }, []);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const showFlash = (type, text) => {
    let msg = text;
    if (typeof text === 'object' && text !== null) {
      msg = extractErrorMessage(text);
    }
    setFlashMessage({ type, text: msg });
    setTimeout(() => setFlashMessage({ type: '', text: '' }), 3500);
  };

  const fetchPendingProducts = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/products/pending');
      setPendingProducts(res.data || []);
    } catch (err) {
      console.error("Failed to load pending products", err);
    }
  };

  const fetchReturnRequests = async () => {
    setIsLoadingReturns(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin/refunds');
      setReturnRequests(res.data || []);
    } catch (err) {
      console.error("Failed to load return requests", err);
    } finally {
      setIsLoadingReturns(false);
    }
  };

  const fetchMonitoring = async () => {
    setIsLoadingMonitoring(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin/payment-monitoring');
      if (res.data?.metrics) {
        setMonitoringMetrics(res.data.metrics);
      }
      const ordersRes = await axios.get('http://localhost:8080/api/customer/orders/all');
      const cleanOrders = (ordersRes.data || []).filter(o => o && !o.orderId?.startsWith('ORD-FAIL-') && o.paymentStatus !== 'FAILED');
      setMonitoringOrders(cleanOrders);
    } catch (err) {
      console.error("Failed to load payment monitoring overview", err);
    } finally {
      setIsLoadingMonitoring(false);
    }
  };

  const fetchTransactions = async () => {
    setIsLoadingTransactions(true);
    try {
      const res = await axios.get('http://localhost:8080/api/payment/transactions');
      setTransactions(res.data || []);
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const fetchSettlements = async () => {
    setIsLoadingSettlements(true);
    try {
      const res = await axios.get('http://localhost:8080/api/admin/settlements');
      if (res.data) {
        setSettlements(res.data.settlements || []);
        setSettlementsSummary(res.data.summary || {});
      }
    } catch (err) {
      console.error("Failed to load settlements", err);
    } finally {
      setIsLoadingSettlements(false);
    }
  };

  const handleApprove = async (id, name = 'Product') => {
    try {
      await axios.put(`http://localhost:8080/api/products/${id}/approve`);
      showFlash('success', `Product "${name}" has been APPROVED and is now active.`);
      fetchPendingProducts();
    } catch (err) {
      showFlash('error', 'Failed to approve product.');
    }
  };

  const approveSelectedProduct = async () => {
    if (!selectedProduct) return;
    await handleApprove(selectedProduct.id, selectedProduct.name);
    setShowReviewModal(false);
    setSelectedProduct(null);
  };

  const submitRejection = async () => {
    if (!selectedProduct || !rejectionReason.trim()) {
      showFlash('error', 'Rejection reason is required.');
      return;
    }
    try {
      await axios.put(`http://localhost:8080/api/products/${selectedProduct.id}/reject`, {
        rejectionReason: rejectionReason.trim()
      });
      showFlash('success', `Product "${selectedProduct.name}" has been REJECTED.`);
      setShowReviewModal(false);
      setSelectedProduct(null);
      setShowRejectionInput(false);
      setRejectionReason('');
      fetchPendingProducts();
    } catch (err) {
      showFlash('error', 'Failed to reject product.');
    }
  };

  // Return Lifecycle Decisions
  const handleAcceptReturnRequest = async (refundId) => {
    setIsProcessingReturnAction(true);
    try {
      await axios.post(`http://localhost:8080/api/admin/refunds/${refundId}/accept`, {
        adminNotes: 'Return accepted by admin. Awaiting customer pickup and warehouse QC inspection.'
      });
      showFlash('success', 'Return request accepted. Sent to warehouse dashboard for pickup and QC.');
      fetchReturnRequests();
      fetchMonitoring();
      fetchTransactions();
      if (selectedReturnCase && selectedReturnCase.id === refundId) {
        setSelectedReturnCase(null);
      }
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to accept return request.');
    } finally {
      setIsProcessingReturnAction(false);
    }
  };

  const handleApproveReturn = async (refundId, orderId, amount) => {
    setIsProcessingReturnAction(true);
    try {
      const res = await axios.post(`http://localhost:8080/api/admin/refunds/${refundId}/approve`, {
        adminNotes: 'Quality inspection passed. Item returned in resellable/acceptable condition.'
      });
      showFlash('success', `Return APPROVED & Refund of ₹${amount} Disbursed for Order ${orderId}! (Razorpay Refund ID: ${res.data.razorpayRefundId || res.data.id})`);
      fetchReturnRequests();
      fetchMonitoring();
      fetchTransactions();
      if (selectedReturnCase && selectedReturnCase.id === refundId) {
        setSelectedReturnCase(null);
      }
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to approve return and execute refund.');
    } finally {
      setIsProcessingReturnAction(false);
    }
  };

  const handleOpenRejectReturnModal = (ret) => {
    setTargetRejectRefund(ret);
    setRejectReasonText('Item failed quality check / Damaged by customer / Past return window');
  };

  const submitRejectReturn = async (e) => {
    if (e) e.preventDefault();
    if (!targetRejectRefund) return;
    setIsProcessingReturnAction(true);
    try {
      await axios.post(`http://localhost:8080/api/admin/refunds/${targetRejectRefund.id}/reject`, {
        rejectionReason: rejectReasonText.trim() || 'Return rejected after warehouse quality check.'
      });
      showFlash('success', `Return Request for Order ${targetRejectRefund.orderId} has been REJECTED.`);
      setTargetRejectRefund(null);
      fetchReturnRequests();
      fetchMonitoring();
      fetchTransactions();
      if (selectedReturnCase && selectedReturnCase.id === targetRejectRefund.id) {
        setSelectedReturnCase(null);
      }
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to reject return request.');
    } finally {
      setIsProcessingReturnAction(false);
    }
  };

  const handleMarkSettled = async (settlementId) => {
    setIsSettlingId(settlementId);
    try {
      await axios.put(`http://localhost:8080/api/admin/settlements/${settlementId}/mark-settled`);
      showFlash('success', `Settlement payout #${settlementId} marked as SETTLED.`);
      fetchSettlements();
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to mark settlement as settled.');
    } finally {
      setIsSettlingId(null);
    }
  };

  const handleOpenRefundModal = (order) => {
    setRefundTargetOrder(order);
    const remaining = order.refundableBalance !== undefined ? order.refundableBalance : order.totalAmount;
    setRefundAmount(remaining.toString());
    setRefundReason('Direct administrative override refund');
    setShowRefundModal(true);
  };

  const handleProcessRefund = async (e) => {
    if (e) e.preventDefault();
    if (!refundTargetOrder) return;
    const amt = parseFloat(refundAmount);
    if (isNaN(amt) || amt <= 0) {
      showFlash('error', 'Please enter a valid refund amount.');
      return;
    }
    setIsProcessingRefund(true);
    try {
      const res = await axios.post('http://localhost:8080/api/payment/refund', {
        orderId: refundTargetOrder.orderId,
        amount: amt,
        reason: refundReason.trim() || 'Admin-initiated direct refund'
      });
      showFlash('success', `Direct refund of ₹${amt} processed. (Refund ID: ${res.data.razorpayRefundId || res.data.id})`);
      setShowRefundModal(false);
      setRefundTargetOrder(null);
      fetchMonitoring();
      fetchTransactions();
      fetchReturnRequests();
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to process refund.');
    } finally {
      setIsProcessingRefund(false);
    }
  };

  const handleInspectOrderStatus = async (orderId) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/payment/status/${orderId}`);
      setSelectedOrderDetails(res.data);
    } catch (err) {
      showFlash('error', 'Could not fetch status details for ' + orderId);
    }
  };

  // Warehouse Logistics API Handlers
  const fetchWarehousesAndAllocations = async () => {
    setIsLoadingWarehouses(true);
    try {
      const [whRes, invRes, allocRes, analRes, ordRes, prodRes] = await Promise.allSettled([
        axios.get('http://localhost:8080/api/warehouses'),
        axios.get('http://localhost:8080/api/warehouses/inventory/all'),
        axios.get('http://localhost:8080/api/warehouses/allocations'),
        axios.get('http://localhost:8080/api/warehouses/analytics'),
        axios.get('http://localhost:8080/api/customer/orders/all'),
        axios.get('http://localhost:8080/api/products')
      ]);

      if (whRes.status === 'fulfilled') setWarehousesList(whRes.value.data || []);
      if (invRes.status === 'fulfilled') setWarehouseInventories(invRes.value.data || []);
      if (allocRes.status === 'fulfilled') setWarehouseAllocations(allocRes.value.data || []);
      if (analRes.status === 'fulfilled') setWarehouseAnalytics(analRes.value.data || {});
      if (ordRes.status === 'fulfilled') setAdminOrders(ordRes.value.data || []);
      if (prodRes.status === 'fulfilled') setAllProductsList(prodRes.value.data || []);
    } catch (err) {
      console.error("Failed to load warehouse logistics data", err);
    } finally {
      setIsLoadingWarehouses(false);
    }
  };

  const handleOpenDistributeModal = (productId, productName) => {
    const activeWhs = warehousesList.filter(w => w.active);
    const initialDist = {};
    activeWhs.forEach(w => {
      const existingInv = warehouseInventories.find(i => String(i.productId) === String(productId) && (String(i.warehouseId) === String(w.id) || (i.warehouse && String(i.warehouse.id) === String(w.id))));
      initialDist[w.id] = existingInv ? existingInv.quantity : 0;
    });

    setAdminTransferForm({
      sourceOrigin: 'VENDOR',
      sourceWarehouseId: 'VENDOR',
      destinationWarehouseId: 'ALL',
      productId: String(productId),
      quantity: 10,
      distributions: initialDist,
      transferReason: 'VENDOR_STOCK_DISTRIBUTION',
      notes: `Distribution of ${productName} stock from vendor to regional fulfillment hubs.`
    });
    setShowCreateTransferAdminModal(true);
  };

  const handleAdminAllocateOrder = async (orderId, targetWarehouseId) => {
    if (!targetWarehouseId) {
      showFlash('error', 'Please select a warehouse facility from the dropdown first.');
      return;
    }
    try {
      await axios.post(`http://localhost:8080/api/warehouses/orders/${orderId}/allocate-warehouse`, {
        warehouseId: parseInt(targetWarehouseId)
      });
      showFlash('success', `Order ${orderId} successfully allocated to warehouse.`);
      fetchWarehousesAndAllocations();
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to allocate warehouse for order.');
    }
  };

  const handleAdminAutoAllocateOrder = async (orderId) => {
    try {
      await axios.post(`http://localhost:8080/api/warehouses/allocations/allocate/${orderId}`);
      showFlash('success', `Order ${orderId} auto-allocated to warehouse with highest available stock.`);
      fetchWarehousesAndAllocations();
    } catch (err) {
      showFlash('error', err.response?.data || 'Auto-allocation failed.');
    }
  };

  const handleSaveAdminWarehouse = async (e) => {
    e.preventDefault();
    try {
      if (adminWhForm.id) {
        await axios.put(`http://localhost:8080/api/warehouses/${adminWhForm.id}`, adminWhForm);
        showFlash('success', `Warehouse ${adminWhForm.code} updated successfully.`);
      } else {
        await axios.post('http://localhost:8080/api/warehouses', adminWhForm);
        showFlash('success', `New warehouse ${adminWhForm.name} registered.`);
      }
      setShowAddWhAdminModal(false);
      setShowEditWhAdminModal(false);
      fetchWarehousesAndAllocations();
    } catch (err) {
      showFlash('error', err.response?.data || 'Failed to save warehouse information.');
    }
  };

  const handleToggleAdminWhStatus = async (wh) => {
    try {
      await axios.put(`http://localhost:8080/api/warehouses/${wh.id}`, {
        name: wh.name,
        code: wh.code,
        address: wh.address,
        city: wh.city,
        active: !wh.active
      });
      showFlash('success', `Warehouse ${wh.code} is now ${!wh.active ? 'Active' : 'Inactive'}.`);
      fetchWarehousesAndAllocations();
    } catch (err) {
      showFlash('error', 'Failed to toggle warehouse status.');
    }
  };



  const pendingReturnsCount = returnRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="dashboard-container">
      {/* Toast Flash Alert */}
      {flashMessage.text && (
        <div className={`toast-notification ${flashMessage.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          <div className="toast-icon-container">
            {flashMessage.type === 'success' ? <Check size={18} /> : <X size={18} />}
          </div>
          <div>
            <strong className="toast-message-title">{flashMessage.type === 'success' ? 'Success' : 'Notice'}</strong>
            <div className="toast-message-desc">{flashMessage.text}</div>
          </div>
        </div>
      )}

      {/* Header Navbar */}
      <div className="navbar">
        <div className="nav-left">
          <h1 className="nav-logo" onClick={onGoToHome} style={{ cursor: 'pointer', margin: 0, fontSize: '20px' }}>
            ShopStack <span className="hide-on-mobile badge badge-rejected" style={{ fontSize: '9px', padding: '1px 5px', verticalAlign: 'middle', marginLeft: '4px' }}>ADMIN</span>
          </h1>
        </div>

        <div className="nav-right">
          <button 
            type="button"
            onClick={onGoToHome} 
            className="btn-store-nav"
            title="Browse Catalog & Inspect Products"
          >
            <Eye size={15} style={{ flexShrink: 0 }} />
            <span className="hide-on-mobile">Browse Catalog</span>
            <span className="show-on-mobile">Catalog</span>
          </button>

          {/* Admin Notifications Center */}
          <NotificationCenter
            notifications={notificationList}
            onMarkAsRead={handleMarkNotifAsRead}
            onMarkAllAsRead={handleMarkAllNotifsAsRead}
            onClearAll={handleClearAllNotifs}
            onDismiss={handleDismissNotif}
            role="ADMINISTRATOR"
            panelTitle="Admin System Alerts"
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
                <User size={14} style={{ color: 'var(--accent-rose)', flexShrink: 0 }} />
              </div>
              <strong className="nav-user-name">{user?.fullName || 'Admin'}</strong>
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
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>Admin Console</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {user?.fullName || 'Admin'}
                    </strong>
                    <span className="badge badge-rejected" style={{ fontSize: '9px', padding: '1px 6px' }}>
                      ADMIN
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
        </div>
      </div>

      {/* Admin Module Navigation Tabs Bar */}
      <div className="admin-tabs-bar">
        {/* Marketplace Overview tab */}
        <button
          type="button"
          onClick={() => { setActiveTab('overview'); fetchDashboardSummary(); }}
          className={`sidebar-item ${activeTab === 'overview' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'overview' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <BarChart3 size={17} style={{ color: activeTab === 'overview' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Marketplace Analytics</span>
        </button>

        {/* Vendor Management tab */}
        <button
          type="button"
          onClick={() => { setActiveTab('vendors'); fetchVendorsList(); }}
          className={`sidebar-item ${activeTab === 'vendors' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'vendors' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <Users size={17} style={{ color: activeTab === 'vendors' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Vendor Management ({vendorsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`sidebar-item ${activeTab === 'products' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'products' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <ShieldAlert size={17} style={{ color: activeTab === 'products' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Product Approvals ({pendingProducts.length})</span>
        </button>

        {/* Customer Reviews & Ratings tab */}
        <button
          type="button"
          onClick={() => { setActiveTab('reviews'); fetchAdminReviews(); }}
          className={`sidebar-item ${activeTab === 'reviews' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'reviews' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <Star size={17} style={{ color: activeTab === 'reviews' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Customer Reviews ({reviewsData.totalReviews || reviewsData.reviews?.length || 0})</span>
        </button>

        {/* Dedicated Returns & Refunds Tab */}
        <button
          type="button"
          onClick={() => { setActiveTab('returns'); fetchReturnRequests(); }}
          className={`sidebar-item ${activeTab === 'returns' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'returns' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <RotateCcw size={17} style={{ color: activeTab === 'returns' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Returns & Refunds</span>
          {pendingReturnsCount > 0 ? (
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', fontSize: '10px', padding: '2px 6px', fontWeight: '800' }}>
              {pendingReturnsCount} Pending QC
            </span>
          ) : (
            <span className="badge badge-customer" style={{ fontSize: '10px', padding: '1px 5px' }}>
              {returnRequests.length}
            </span>
          )}
        </button>

        {/* Warehouse Logistics & Allocations Tab */}
        <button
          type="button"
          onClick={() => { setActiveTab('warehouses'); fetchWarehousesAndAllocations(); }}
          className={`sidebar-item ${activeTab === 'warehouses' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'warehouses' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <Truck size={17} style={{ color: activeTab === 'warehouses' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Warehouses & Allocation</span>
          {adminOrders.filter(o => o.status === 'CONFIRMED' || o.status === 'PAID').length > 0 && (
            <span className="badge" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', fontSize: '10px', padding: '2px 6px', fontWeight: '800' }}>
              {adminOrders.filter(o => o.status === 'CONFIRMED' || o.status === 'PAID').length} Awaiting Alloc
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('monitoring'); fetchMonitoring(); }}
          className={`sidebar-item ${(activeTab === 'monitoring' || activeTab === 'orders') ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: (activeTab === 'monitoring' || activeTab === 'orders') ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <Activity size={17} style={{ color: (activeTab === 'monitoring' || activeTab === 'orders') ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Order Monitoring</span>
          {monitoringMetrics.failedCount > 0 && (
            <span className="badge badge-rejected" style={{ fontSize: '10px', padding: '1px 5px' }}>
              {monitoringMetrics.failedCount} Failed
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('transactions'); fetchTransactions(); }}
          className={`sidebar-item ${activeTab === 'transactions' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'transactions' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <Receipt size={17} style={{ color: activeTab === 'transactions' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Transactions ({transactions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveTab('settlements'); fetchSettlements(); }}
          className={`sidebar-item ${activeTab === 'settlements' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'settlements' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <IndianRupee size={17} style={{ color: activeTab === 'settlements' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Commission Management ({settlements.length})</span>
          {settlements.filter(s => s.status === 'PENDING').length > 0 && (
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontSize: '10px', padding: '1px 5px' }}>
              {settlements.filter(s => s.status === 'PENDING').length} Pending
            </span>
          )}
        </button>

        {/* Promo Coupons tab */}
        <button
          type="button"
          onClick={() => { setActiveTab('coupons'); fetchCoupons(); fetchCouponAnalytics(); }}
          className={`sidebar-item ${activeTab === 'coupons' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'coupons' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <Ticket size={17} style={{ color: activeTab === 'coupons' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Promo Coupons</span>
        </button>

        {/* System Monitoring tab */}
        <button
          type="button"
          onClick={() => { setActiveTab('system'); fetchSystemStatus(); }}
          className={`sidebar-item ${activeTab === 'system' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'system' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <Settings size={17} style={{ color: activeTab === 'system' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>System Monitoring</span>
        </button>

        {/* Business Reports tab */}
        <button
          type="button"
          onClick={() => { setActiveTab('reports'); fetchReportData(reportType); }}
          className={`sidebar-item ${activeTab === 'reports' ? 'sidebar-item-active' : ''}`}
          style={{ padding: '12px 18px', borderRadius: '8px 8px 0 0', borderBottom: activeTab === 'reports' ? '2px solid var(--accent-teal)' : 'none', background: 'transparent' }}
        >
          <FileSpreadsheet size={17} style={{ color: activeTab === 'reports' ? 'var(--accent-teal)' : 'var(--text-muted)' }} />
          <span>Business Reports</span>
        </button>
      </div>

      <div className="dashboard-layout" style={{ flexDirection: 'column' }}>
        <div className="main-content" style={{ width: '100%' }}>

          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BarChart3 size={24} style={{ color: 'var(--accent-teal)' }} /> Marketplace Summary & Analytics
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Real-time performance ledger, revenue growth metrics, and catalog statistics.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchDashboardSummary} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 16px' }}
                >
                  <RefreshCw size={13} className={isLoadingSummary ? "spin-animation" : ""} /> Refresh Analytics
                </button>
              </div>

              {/* KPI Cards Grid */}
              <div className="analytics-grid" style={{ marginBottom: '30px' }}>
                <div className="analytics-card" style={{ borderLeft: '4px solid var(--accent-teal)', background: 'linear-gradient(to right, rgba(16, 185, 129, 0.03), transparent)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Gross Sales Volume</span>
                    <TrendingUp size={18} style={{ color: 'var(--accent-teal)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ color: 'var(--text-primary)' }}>
                    ₹{dashboardSummary.totalSalesVolume?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="analytics-card-desc">
                    {dashboardSummary.totalRefunded > 0 
                      ? `Verified volume (₹${dashboardSummary.totalRefunded?.toLocaleString('en-IN')} refunded)` 
                      : 'Verified transaction volume'}
                  </div>
                </div>

                <div className="analytics-card" style={{ borderLeft: '4px solid var(--accent-rose)', background: 'linear-gradient(to right, rgba(239, 68, 68, 0.03), transparent)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Platform Revenue (10%)</span>
                    <DollarSign size={18} style={{ color: 'var(--accent-rose)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ color: 'var(--accent-rose)' }}>
                    ₹{dashboardSummary.totalCommission?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="analytics-card-desc">
                    {dashboardSummary.totalRefunded > 0 
                      ? `Net fees (₹${(dashboardSummary.totalRefunded * 0.1).toFixed(2)} reversed)` 
                      : 'Commission fee collected'}
                  </div>
                </div>

                <div className="analytics-card" style={{ borderLeft: '4px solid var(--accent-indigo)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Net Vendor Payouts</span>
                    <IndianRupee size={18} style={{ color: 'var(--accent-indigo)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ color: 'var(--text-primary)' }}>
                    ₹{dashboardSummary.totalPayouts?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className="analytics-card-desc">
                    {dashboardSummary.totalRefunded > 0 
                      ? `Net transfers (deducted ₹${dashboardSummary.totalRefunded?.toLocaleString('en-IN')})` 
                      : 'Disbursed & pending transfers'}
                  </div>
                </div>

                <div className="analytics-card" style={{ borderLeft: '4px solid var(--accent-blue)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Total Orders Count</span>
                    <Package size={18} style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ color: 'var(--text-primary)' }}>
                    {dashboardSummary.totalOrders}
                  </div>
                  <div className="analytics-card-desc">All registered checkouts</div>
                </div>
              </div>

              {/* Secondary KPIs */}
              <div className="responsive-kpi-grid">
                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Active Vendors</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px' }}>{dashboardSummary.totalVendors}</div>
                  </div>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-blue)', padding: '8px', borderRadius: '6px' }}>
                    <Users size={16} />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Total Products</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px' }}>{dashboardSummary.totalProducts}</div>
                  </div>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-teal)', padding: '8px', borderRadius: '6px' }}>
                    <Package size={16} />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: dashboardSummary.pendingProducts > 0 ? '3px solid #f59e0b' : '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Awaiting Approval</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px', color: dashboardSummary.pendingProducts > 0 ? '#f59e0b' : 'inherit' }}>{dashboardSummary.pendingProducts}</div>
                  </div>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '8px', borderRadius: '6px' }}>
                    <ShieldAlert size={16} />
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: dashboardSummary.lowStockProducts > 0 ? '3px solid var(--accent-rose)' : '1px solid var(--border-light)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Low Stock Alert</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', marginTop: '4px', color: dashboardSummary.lowStockProducts > 0 ? 'var(--accent-rose)' : 'inherit' }}>{dashboardSummary.lowStockProducts}</div>
                  </div>
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-rose)', padding: '8px', borderRadius: '6px' }}>
                    <AlertCircle size={16} />
                  </div>
                </div>
              </div>

              {/* Charts & Distribution Section */}
              <div className="responsive-split-grid">
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>Product Category Share</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {Object.keys(dashboardSummary.categoryDistribution).length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No categories registered</p>
                    ) : (
                      Object.entries(dashboardSummary.categoryDistribution).map(([category, count]) => {
                        const total = Math.max(1, dashboardSummary.totalProducts);
                        const pct = Math.round((count / total) * 100);
                        return (
                          <div key={category}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                              <span style={{ fontWeight: '600' }}>{category}</span>
                              <span style={{ color: 'var(--text-muted)' }}>{count} items ({pct}%)</span>
                            </div>
                            <div style={{ height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(to right, var(--accent-teal), var(--accent-blue))', borderRadius: '4px' }} />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>System Quick Actions</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>Frequent administrative workflows console</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button onClick={() => setActiveTab('products')} className="btn btn-primary" style={{ justifyContent: 'flex-start', padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <ShieldAlert size={15} /> Review Product Approvals ({pendingProducts.length})
                    </button>
                    <button onClick={() => { setActiveTab('returns'); fetchReturnRequests(); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <RotateCcw size={15} /> Returns & Refund Queue ({pendingReturnsCount} pending)
                    </button>
                    <button onClick={() => { setActiveTab('vendors'); fetchVendorsList(); }} className="btn btn-secondary" style={{ justifyContent: 'flex-start', padding: '10px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={15} /> View Vendors Performance
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Orders List */}
              <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', color: 'var(--text-primary)' }}>Recent Marketplace Activity</h3>
                <div className="table-container">
                  <table className="custom-table" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Order ID</th>
                        <th>Recipient</th>
                        <th>Payment Method</th>
                        <th>Status</th>
                        <th>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardSummary.recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No orders registered yet</td>
                        </tr>
                      ) : (
                        dashboardSummary.recentOrders.map(ord => (
                          <tr key={ord.orderId}>
                            <td>{ord.date}</td>
                            <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--accent-blue)' }}>{ord.orderId}</td>
                            <td>{ord.recipientName || 'Customer'}</td>
                            <td>
                              <span style={{ 
                                fontSize: '11px', 
                                fontWeight: '700', 
                                padding: '3px 8px', 
                                borderRadius: '4px',
                                background: 'var(--bg-input)', 
                                color: 'var(--text-secondary)',
                                border: '1px solid var(--border-light)' 
                              }}>
                                {ord.paymentMethod || 'RAZORPAY'}
                              </span>
                            </td>
                            <td>
                              <span className={`badge ${
                                ord.status === 'REFUNDED' ? 'badge-rejected' : 
                                ord.status === 'DELIVERED' ? 'badge-approved' : 
                                ord.status === 'SHIPPED' ? 'badge-customer' : 'badge-pending'
                              }`} style={{ 
                                fontWeight: '700',
                                ...(ord.status === 'REFUNDED' ? { background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' } : {})
                              }}>
                                {ord.status}
                              </span>
                            </td>
                            <td style={{ fontWeight: '800', color: 'var(--text-primary)' }}>₹{Number(ord.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VENDOR MANAGEMENT */}
          {activeTab === 'vendors' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={22} style={{ color: 'var(--accent-teal)' }} /> Vendor Performance & Status Console
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Monitor merchant operations, listed items, cumulative platform sales, and commission contributions.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchVendorsList} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingVendors ? "spin-animation" : ""} /> Refresh Vendors
                </button>
              </div>

              {/* Vendor Search */}
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Search vendors by name, email, address, or vendor code..." 
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                />
              </div>

              {vendorsList.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <Users className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No vendors registered on the marketplace yet.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr>
                        <th>Vendor ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Vendor Code</th>
                        <th>Listed Items</th>
                        <th>Gross Sales</th>
                        <th>Commission Paid</th>
                        <th>Net Payout</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorsList
                        .filter(v => {
                          if (!vendorSearch.trim()) return true;
                          const q = vendorSearch.toLowerCase();
                          return (v.fullName?.toLowerCase().includes(q) || 
                                  v.email?.toLowerCase().includes(q) || 
                                  v.address?.toLowerCase().includes(q) || 
                                  v.vendorCode?.toLowerCase().includes(q));
                        })
                        .map(v => (
                          <tr key={v.id}>
                            <td><strong>#{v.id}</strong></td>
                            <td style={{ fontWeight: '600' }}>{v.fullName}</td>
                            <td>{v.email}</td>
                            <td><span className="badge badge-vendor">{v.vendorCode || 'N/A'}</span></td>
                            <td>{v.totalProducts} products</td>
                            <td style={{ fontWeight: '700' }}>₹{v.grossSales?.toLocaleString('en-IN')}</td>
                            <td style={{ color: 'var(--accent-rose)' }}>
                              ₹{v.commissionPaid?.toLocaleString('en-IN')}
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>
                                (10%)
                              </span>
                            </td>
                            <td style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>₹{v.netPayout?.toLocaleString('en-IN')}</td>
                            <td>
                              <button 
                                onClick={() => handleInspectVendor(v)}
                                className="btn btn-secondary" 
                                style={{ padding: '4px 10px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                              >
                                <Eye size={12} /> Inspect Details
                              </button>
                            </td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB: SYSTEM DIAGNOSTICS */}
          {activeTab === 'system' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={22} style={{ color: 'var(--accent-indigo)' }} /> System Infrastructure & Telemetry Diagnostics
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Live tracking of API server JVM status, relational database rows, uploads storage capacity, and payment gateway ping metrics.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchSystemStatus} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingSystem ? "spin-animation" : ""} /> Refresh System Stats
                </button>
              </div>

              {/* Status Indicators Grid */}
              <div className="analytics-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Spring Boot Server Status</span>
                    <span className="badge badge-approved" style={{ fontSize: '10px' }}>ONLINE</span>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>API Server Uptime</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-blue)', fontFamily: 'monospace', marginTop: '2px' }}>{systemStatus.uptime}</div>
                  </div>
                </div>

                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>PostgreSQL Connection</span>
                    <span className="badge badge-approved" style={{ fontSize: '10px' }}>UP</span>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Database Host</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '8px', color: 'var(--text-primary)' }}>localhost:5432 / shopstack_db</div>
                  </div>
                </div>

                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Razorpay Payment API</span>
                    <span className="badge badge-approved" style={{ fontSize: '10px' }}>CONFIGURED</span>
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>API Environment Mode</div>
                    <div style={{ fontSize: '14px', fontWeight: '700', marginTop: '8px', color: 'var(--text-primary)' }}>Test Mode (rzp_test_...)</div>
                  </div>
                </div>

                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '600' }}>Available Processor Cores</span>
                    <HardDrive size={16} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div style={{ marginTop: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Available JVM CPUs</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: 'var(--accent-teal)', marginTop: '2px' }}>{systemStatus.processors} cores</div>
                  </div>
                </div>
              </div>

              {/* Memory Diagnostics & Storage size */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                {/* Memory allocation */}
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HardDrive size={18} style={{ color: 'var(--accent-indigo)' }} /> JVM Memory Allocation Diagnostics
                  </h3>
                  
                  {(() => {
                    const total = systemStatus.jvmMaxMemory || 100;
                    const used = systemStatus.jvmUsedMemory || 0;
                    const pct = Math.round((used / total) * 100);
                    return (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                          <span>JVM Memory Used</span>
                          <strong>{used} MB of {total} MB ({pct}%)</strong>
                        </div>
                        <div style={{ height: '14px', background: 'var(--bg-input)', borderRadius: '7px', overflow: 'hidden', marginBottom: '16px', display: 'flex' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pct > 80 ? 'var(--accent-rose)' : 'linear-gradient(to right, var(--accent-indigo), var(--accent-blue))', borderRadius: '7px', transition: 'width 0.4s ease' }} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          <div>JVM Total Allocated: <strong>{systemStatus.jvmTotalMemory} MB</strong></div>
                          <div>JVM Free Available: <strong>{systemStatus.jvmFreeMemory} MB</strong></div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Local Disk Storage diagnostics */}
                <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HardDrive size={18} style={{ color: 'var(--accent-teal)' }} /> Uploads storage capacity status
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Local Storage Folder:</span>
                      <strong>uploads/products/</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total Saved Image Files:</span>
                      <strong>{systemStatus.storageImagesCount} files</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total Space Consumed:</span>
                      <strong style={{ color: 'var(--accent-teal)', fontSize: '15px' }}>{systemStatus.storageTotalSizeMB} MB</strong>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: '8px', marginTop: '4px' }}>
                      * Mitigation system converts Base64 inputs to binary files written directly to disk.
                    </div>
                  </div>
                </div>
              </div>

              {/* Database Telemetry (Row Counts) */}
              <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Database size={18} style={{ color: 'var(--accent-blue)' }} /> Database Tables Row Telemetry
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>users</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>{systemStatus.dbTotalUsers}</div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>products</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>{systemStatus.dbTotalProducts}</div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>orders</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>{systemStatus.dbTotalOrders}</div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>settlements</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>{systemStatus.dbTotalSettlements}</div>
                  </div>
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: '700' }}>refunds</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', marginTop: '4px', color: 'var(--text-primary)' }}>{systemStatus.dbTotalRefunds}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BUSINESS REPORTS */}
          {activeTab === 'reports' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileSpreadsheet size={22} style={{ color: 'var(--accent-teal)' }} /> Business Intelligence Reports Console
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Select a report category, preview records on screen, and export cumulative logs as structured CSV files.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => fetchReportData(reportType)} 
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                  >
                    <RefreshCw size={13} className={isLoadingReport ? "spin-animation" : ""} /> Refresh Data
                  </button>
                  <button 
                    type="button" 
                    onClick={() => handleExportCSV(reportType)} 
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#fff', borderColor: '#10b981' }}
                  >
                    <FileSpreadsheet size={13} /> Export to CSV
                  </button>
                </div>
              </div>

              {/* Selector Bar */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                <div className="form-group" style={{ flex: '1', minWidth: '220px', marginBottom: 0 }}>
                  <label className="form-label">Select Report Category</label>
                  <select 
                    value={reportType}
                    onChange={(e) => { setReportType(e.target.value); fetchReportData(e.target.value); }}
                    className="form-input"
                  >
                    <option value="SALES">Sales & Checkouts Report</option>
                    <option value="VENDORS">Merchants Performance Report</option>
                    <option value="INVENTORY">Inventory Valuation Report</option>
                    <option value="REFUNDS">Returns & Refund QC Report</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: '2', minWidth: '300px', marginBottom: 0 }}>
                  <label className="form-label">Quick Search / Filter Results</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="Filter records showing in report..." 
                      value={reportSearch}
                      onChange={(e) => setReportSearch(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '36px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Reports Preview Table */}
              {reportRecords.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <FileSpreadsheet className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No records found matching the report parameters.</p>
                </div>
              ) : (
                <div className="table-container">
                  {reportType === 'SALES' && (
                    <table className="custom-table" style={{ fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Order ID</th>
                          <th>Recipient</th>
                          <th>Method</th>
                          <th>Payment Status</th>
                          <th>Fulfillment</th>
                          <th>Total Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportRecords
                          .filter(r => {
                            if (!reportSearch.trim()) return true;
                            const q = reportSearch.toLowerCase();
                            return (r.orderId?.toLowerCase().includes(q) || r.recipientName?.toLowerCase().includes(q) || r.paymentStatus?.toLowerCase().includes(q));
                          })
                          .map(r => (
                            <tr key={r.orderId}>
                              <td>{r.date}</td>
                              <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--accent-blue)' }}>{r.orderId}</td>
                              <td>{r.recipientName}</td>
                              <td>{r.paymentMethod}</td>
                              <td><span className={`badge ${r.paymentStatus === 'PAID' ? 'badge-approved' : 'badge-pending'}`}>{r.paymentStatus}</span></td>
                              <td><span className="order-status-badge">{r.status}</span></td>
                              <td style={{ fontWeight: '800' }}>₹{r.totalAmount}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  )}

                  {reportType === 'VENDORS' && (
                    <table className="custom-table" style={{ fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th>Vendor ID</th>
                          <th>Merchant Name</th>
                          <th>Email Address</th>
                          <th>Vendor Code</th>
                          <th>Listed Products</th>
                          <th>Cumulative Gross</th>
                          <th>Commission Contributed</th>
                          <th>Net Vendor Payout</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportRecords
                          .filter(r => {
                            if (!reportSearch.trim()) return true;
                            const q = reportSearch.toLowerCase();
                            return (r.fullName?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.vendorCode?.toLowerCase().includes(q));
                          })
                          .map(r => (
                            <tr key={r.id}>
                              <td><strong>#{r.id}</strong></td>
                              <td style={{ fontWeight: '600' }}>{r.fullName}</td>
                              <td>{r.email}</td>
                              <td><span className="badge badge-vendor">{r.vendorCode}</span></td>
                              <td>{r.totalProducts} items</td>
                              <td style={{ fontWeight: '700' }}>₹{r.grossSales?.toLocaleString('en-IN')}</td>
                              <td style={{ color: 'var(--accent-rose)' }}>-₹{r.commissionPaid?.toLocaleString('en-IN')}</td>
                              <td style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>₹{r.netPayout?.toLocaleString('en-IN')}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  )}

                  {reportType === 'INVENTORY' && (
                    <table className="custom-table" style={{ fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th>Product ID</th>
                          <th>Name</th>
                          <th>Category</th>
                          <th>Brand</th>
                          <th>Fulfillment stock</th>
                          <th>Base Price</th>
                          <th>Final Price</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportRecords
                          .filter(r => {
                            if (!reportSearch.trim()) return true;
                            const q = reportSearch.toLowerCase();
                            return (r.name?.toLowerCase().includes(q) || r.category?.toLowerCase().includes(q) || r.brand?.toLowerCase().includes(q));
                          })
                          .map(r => (
                            <tr key={r.id}>
                              <td><strong>#{r.id}</strong></td>
                              <td style={{ fontWeight: '600', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.name}>{r.name}</td>
                              <td><span className="badge badge-customer">{r.category}</span></td>
                              <td>{r.brand || 'N/A'}</td>
                              <td style={{ fontWeight: 'bold', color: r.stock <= 5 ? 'var(--accent-rose)' : 'inherit' }}>{r.stock} units</td>
                              <td>₹{r.price}</td>
                              <td style={{ fontWeight: '700', color: 'var(--accent-teal)' }}>₹{r.finalPrice}</td>
                              <td><span className={`badge ${r.status === 'APPROVED' ? 'badge-approved' : 'badge-pending'}`}>{r.status}</span></td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  )}

                  {reportType === 'REFUNDS' && (
                    <table className="custom-table" style={{ fontSize: '13px' }}>
                      <thead>
                        <tr>
                          <th>Refund ID</th>
                          <th>Order ID</th>
                          <th>Date Requested</th>
                          <th>Return Reason</th>
                          <th>Resolution</th>
                          <th>Stage</th>
                          <th>Refund status</th>
                          <th>Refund Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportRecords
                          .filter(r => {
                            if (!reportSearch.trim()) return true;
                            const q = reportSearch.toLowerCase();
                            return (r.orderId?.toLowerCase().includes(q) || r.returnReasonCategory?.toLowerCase().includes(q) || r.status?.toLowerCase().includes(q));
                          })
                          .map(r => (
                            <tr key={r.id}>
                              <td><strong>#{r.id}</strong></td>
                              <td style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--accent-blue)' }}>{r.orderId}</td>
                              <td>{r.requestedAt}</td>
                              <td><span className="badge badge-customer">{r.returnReasonCategory}</span></td>
                              <td>{r.resolutionType}</td>
                              <td><span className="badge badge-vendor">{r.returnStage}</span></td>
                              <td><span className={`badge ${r.status === 'PROCESSED' ? 'badge-approved' : 'badge-pending'}`}>{r.status}</span></td>
                              <td style={{ fontWeight: '800', color: 'var(--accent-emerald)' }}>₹{r.amount}</td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: PRODUCT APPROVALS */}
          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <ShieldAlert size={24} style={{ color: 'var(--accent-rose)' }} />
                <h2 style={{ fontSize: '20px', fontWeight: '700' }}>Product Approval Workflow Console</h2>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
                The following product listings have been submitted by merchants and require administrative approval before they go live on the ShopStack Marketplace catalog.
              </p>

              {pendingProducts.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '12px' }}>
                  <ShieldAlert className="cart-empty-icon" style={{ opacity: 0.2, color: 'var(--accent-emerald)' }} />
                  <p>Great job! There are no pending product listings awaiting approval.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ minWidth: '1280px' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '60px', textAlign: 'center' }}>Icon</th>
                        <th style={{ minWidth: '200px' }}>Product Name</th>
                        <th style={{ minWidth: '130px' }}>Category</th>
                        <th style={{ minWidth: '120px' }}>Regular Price</th>
                        <th style={{ minWidth: '110px' }}>Discount</th>
                        <th style={{ minWidth: '130px' }}>Final Price</th>
                        <th style={{ minWidth: '110px', textAlign: 'center' }}>Stock</th>
                        <th style={{ minWidth: '180px' }}>Merchant Details</th>
                        <th style={{ textAlign: 'center', minWidth: '240px', width: '240px' }}>Approval Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingProducts.map((prod) => {
                        const disc = Number(prod.discountPercentage) || 0;
                        const finalP = prod.finalPrice != null ? prod.finalPrice : (disc > 0 ? Math.round(prod.price * (1 - disc / 100) * 100) / 100 : prod.price);
                        return (
                          <tr key={prod.id}>
                            <td style={{ fontSize: '20px' }}>
                              <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', overflow: 'hidden' }}>
                                {prod.imageUrl && formatImageUrl(prod.imageUrl).length > 4 ? (
                                  <img src={formatImageUrl(prod.imageUrl)} alt={prod.name} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                  <ProductIcon name={prod.name} category={prod.category} size={16} />
                                )}
                              </div>
                            </td>
                            <td 
                              className="clickable-product-name"
                              style={{ fontWeight: '600' }}
                              onClick={() => {
                                setSelectedProduct(prod);
                                setShowRejectionInput(false);
                                setRejectionReason('');
                                setShowReviewModal(true);
                              }}
                            >
                              {prod.name}
                            </td>
                            <td>
                              <span className="badge badge-customer">{prod.category}</span>
                            </td>
                            <td style={{ color: disc > 0 ? '#94a3b8' : 'inherit', textDecoration: disc > 0 ? 'line-through' : 'none' }}>
                              ₹{Number(prod.price).toLocaleString('en-IN')}
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
                                  display: 'inline-block'
                                }}>
                                  {disc}% OFF
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>None</span>
                              )}
                            </td>
                            <td style={{ fontWeight: '800', color: 'var(--accent-teal)' }}>
                              ₹{Number(finalP).toLocaleString('en-IN')}
                            </td>
                            <td>{prod.stock} units</td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                <div style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <Store size={14} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
                                  <span>{prod.vendorName || `Vendor #${prod.vendorId || 'SYSTEM'}`}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                  <span>ID: #{prod.vendorId || 'N/A'}</span>
                                  {prod.vendorCode && (
                                    <span className="badge badge-vendor" style={{ fontSize: '9px', padding: '1px 5px' }}>
                                      Code: {prod.vendorCode}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button 
                                  onClick={() => handleApprove(prod.id, prod.name)} 
                                  className="btn btn-success" 
                                  style={{ padding: '6px 14px', fontSize: '12px' }}
                                >
                                  <Check size={14} /> Approve
                                </button>
                                <button 
                                  onClick={() => {
                                    setSelectedProduct(prod);
                                    setRejectionReason('');
                                    setShowRejectionInput(true);
                                    setShowReviewModal(true);
                                  }} 
                                  className="btn btn-danger" 
                                  style={{ padding: '6px 14px', fontSize: '12px' }}
                                >
                                  <X size={14} /> Reject
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

          {/* TAB 2: RETURNS & REFUNDS GOVERNANCE (BUY → RETURN → REFUND LIFECYCLE) */}
          {activeTab === 'returns' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RotateCcw size={22} style={{ color: 'var(--accent-teal)' }} /> Customer Returns & Quality Check Governance
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Customer Lifecycle: BUY → RETURN → QUALITY INSPECTION → REFUND DISBURSAL. Admin verifies returned item condition before executing Razorpay payment reversal.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchReturnRequests} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingReturns ? "spin-animation" : ""} /> Refresh Returns
                </button>
              </div>

              {/* Return Metrics Cards */}
              <div className="analytics-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b', background: pendingReturnsCount > 0 ? 'rgba(245, 158, 11, 0.04)' : 'var(--bg-card)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Pending QC & Decision</span>
                    <Clock size={16} style={{ color: '#f59e0b' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#f59e0b' }}>
                    {pendingReturnsCount}
                  </div>
                  <div className="analytics-card-desc">Awaiting warehouse verification</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Approved & Disbursed</span>
                    <CheckCircle size={16} style={{ color: '#10b981' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#10b981' }}>
                    {returnRequests.filter(r => r.status === 'PROCESSED').length}
                  </div>
                  <div className="analytics-card-desc">QC passed & refunded via Razorpay</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid #ef4444' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Rejected Returns</span>
                    <X size={16} style={{ color: '#ef4444' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#ef4444' }}>
                    {returnRequests.filter(r => r.status === 'REJECTED').length}
                  </div>
                  <div className="analytics-card-desc">Failed quality check / Ineligible</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-indigo)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Total Refund Volume</span>
                    <IndianRupee size={16} style={{ color: 'var(--accent-indigo)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: 'var(--accent-indigo)' }}>
                    ₹{returnRequests.filter(r => r.status === 'PROCESSED').reduce((sum, r) => sum + (Number(r.amount) || 0), 0).toLocaleString('en-IN')}
                  </div>
                  <div className="analytics-card-desc">Reversed back to customers</div>
                </div>
              </div>

              {/* Closed-loop Return Rate Analysis */}
              {(() => {
                const { avgCsat, ratingCount, productList, vendorList } = getReturnAnalytics();
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                    
                    {/* CSAT Card */}
                    <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-teal)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div className="analytics-card-header">
                        <span className="analytics-card-title" style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)' }}>Customer Satisfaction Score</span>
                        <CheckCircle size={16} style={{ color: 'var(--accent-teal)' }} />
                      </div>
                      <div className="analytics-card-value" style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '10px 0 6px 0' }}>
                        <span style={{ fontSize: '24px', fontWeight: '800' }}>{avgCsat}</span>
                        <span style={{ color: '#f59e0b', fontSize: '18px' }}>★</span>
                      </div>
                      <div className="analytics-card-desc">Average rating from {ratingCount} satisfaction surveys</div>
                    </div>

                    {/* Return Rate by Product */}
                    <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-indigo)' }}>
                      <div className="analytics-card-header" style={{ marginBottom: '8px' }}>
                        <span className="analytics-card-title" style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)' }}>Return Analysis by Product</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                        {productList.length === 0 ? (
                          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>No returned product trends found</div>
                        ) : (
                          productList.map((p, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' }}>
                              <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '500' }}>{p.name}</span>
                              <strong style={{ color: 'var(--accent-rose)' }}>{p.rate}% ({p.returns}/{p.sales} units)</strong>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Return Rate by Vendor */}
                    <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-rose)' }}>
                      <div className="analytics-card-header" style={{ marginBottom: '8px' }}>
                        <span className="analytics-card-title" style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-secondary)' }}>Return Analysis by Vendor</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                        {vendorList.length === 0 ? (
                          <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px 0' }}>No returned vendor trends found</div>
                        ) : (
                          vendorList.map((v, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '4px' }}>
                              <span style={{ fontWeight: '500' }}>Merchant #{v.vendorId}</span>
                              <strong style={{ color: 'var(--accent-rose)' }}>{v.rate}% ({v.returns}/{v.sales} units)</strong>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                  </div>
                );
              })()}

              {/* Filters & Search Bar */}
              <div className="dashboard-filter-bar">
                <div className="dashboard-filter-search">
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search by Order ID, Reason, or Customer Name..." 
                    value={returnSearch}
                    onChange={(e) => setReturnSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                  />
                </div>

                <div className="dashboard-filter-chips">
                  {['PENDING', 'ALL', 'PROCESSED', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setReturnFilter(st)}
                      className={`btn ${returnFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {st === 'PENDING' ? `Pending QC (${pendingReturnsCount})` : 
                       st === 'ALL' ? `All Requests (${returnRequests.length})` :
                       st === 'PROCESSED' ? `Approved & Refunded (${returnRequests.filter(r => r.status === 'PROCESSED').length})` :
                       `Rejected (${returnRequests.filter(r => r.status === 'REJECTED').length})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Return Requests Table */}
              {returnRequests.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <RotateCcw className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No customer return requests submitted yet.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ minWidth: '1300px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '130px' }}>Date Requested</th>
                        <th style={{ minWidth: '140px' }}>Order ID</th>
                        <th style={{ minWidth: '180px' }}>Customer Details</th>
                        <th style={{ minWidth: '160px' }}>Reason Category</th>
                        <th style={{ minWidth: '130px' }}>Resolution</th>
                        <th style={{ minWidth: '130px' }}>Refund Amount</th>
                        <th style={{ minWidth: '140px', textAlign: 'center' }}>Status</th>
                        <th style={{ textAlign: 'center', minWidth: '250px', width: '250px' }}>Inspection & Decision</th>
                      </tr>
                    </thead>
                    <tbody>
                      {returnRequests
                        .filter(r => {
                          if (returnFilter !== 'ALL' && r.status !== returnFilter) return false;
                          if (returnSearch.trim()) {
                            const q = returnSearch.toLowerCase();
                            const matchId = r.orderId?.toLowerCase().includes(q);
                            const matchReason = r.reason?.toLowerCase().includes(q);
                            const matchName = r.recipientName?.toLowerCase().includes(q);
                            return matchId || matchReason || matchName;
                          }
                          return true;
                        })
                        .map((r) => {
                          const isPending = r.status === 'PENDING';
                          const isProcessed = r.status === 'PROCESSED';
                          const isRejected = r.status === 'REJECTED';

                          return (
                            <tr key={r.id} style={{ background: isPending ? 'rgba(245, 158, 11, 0.03)' : 'transparent' }}>
                              <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                                {r.requestedAt}
                              </td>
                              <td>
                                <strong style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{r.orderId}</strong>
                              </td>
                              <td>
                                <div style={{ fontWeight: '600', fontSize: '13px' }}>{r.recipientName || `User #${r.userId || 'GUEST'}`}</div>
                                {r.recipientPhone && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.recipientPhone}</div>}
                              </td>
                              <td>
                                <span className={`badge ${
                                  r.returnReasonCategory === 'DEFECTIVE_DAMAGED' ? 'badge-rejected' :
                                  r.returnReasonCategory === 'WRONG_ITEM' ? 'badge-vendor' :
                                  r.returnReasonCategory === 'SIZE_FIT_ISSUE' ? 'badge-customer' : 'badge-pending'
                                }`} style={{ fontSize: '10px' }}>
                                  {r.returnReasonCategory || 'DEFECTIVE'}
                                </span>
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.reason}>
                                  {r.reason}
                                </div>
                              </td>
                              <td>
                                <span className="badge" style={{ background: 'var(--bg-input)', fontSize: '11px' }}>
                                  {r.resolutionType || 'REFUND'}
                                </span>
                              </td>
                              <td>
                                <strong style={{ color: 'var(--accent-emerald)', fontSize: '14px' }}>₹{r.amount}</strong>
                              </td>
                              <td>
                                {isPending && (
                                  r.returnStage === 'QC_PASSED' ? (
                                    <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <Check size={11} /> QC PASSED (AWAITING REFUND)
                                    </span>
                                  ) : r.returnStage === 'QC_FAILED' ? (
                                    <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <X size={11} /> QC FAILED
                                    </span>
                                  ) : r.returnStage === 'ITEM_RETURNED' ? (
                                    <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                      <Clock size={11} /> QC PENDING IN WAREHOUSE
                                    </span>
                                  ) : r.returnStage === 'ADMIN_APPROVED' ? (
                                    <span className="badge badge-customer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-blue)', borderColor: 'rgba(56, 189, 248, 0.3)' }}>
                                      <Clock size={11} /> APPROVED, AWAITING PICKUP
                                    </span>
                                  ) : (
                                    <span className="badge badge-customer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-rose)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                                      <Clock size={11} /> PENDING ADMIN REVIEW
                                    </span>
                                  )
                                )}
                                {isProcessed && (
                                  <span className="badge badge-approved" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Check size={11} /> APPROVED & REFUNDED
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="badge badge-rejected" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <X size={11} /> REJECTED
                                  </span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedReturnCase(r)}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '11px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}
                                  >
                                    <Eye size={12} /> Inspect
                                  </button>
                                  {isPending && (
                                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', width: '100%' }}>
                                      {r.returnStage === 'REQUESTED' && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => handleAcceptReturnRequest(r.id)}
                                            disabled={isProcessingReturnAction}
                                            className="btn btn-success"
                                            style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', flex: 1 }}
                                            title="Accept return request and route to warehouse"
                                          >
                                            <Check size={12} /> Accept Return
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleOpenRejectReturnModal(r)}
                                            disabled={isProcessingReturnAction}
                                            className="btn btn-danger"
                                            style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', flex: 1 }}
                                            title="Reject customer return request"
                                          >
                                            <X size={12} /> Reject
                                          </button>
                                        </>
                                      )}
                                      {r.returnStage === 'QC_PASSED' && (
                                        <button
                                          type="button"
                                          onClick={() => handleApproveReturn(r.id, r.orderId, r.amount)}
                                          disabled={isProcessingReturnAction}
                                          className="btn btn-success"
                                          style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}
                                          title="Disburse payment refund (Razorpay Test Mode)"
                                        >
                                          <Check size={12} /> Disburse Refund
                                        </button>
                                      )}
                                      {r.returnStage === 'QC_FAILED' && (
                                        <button
                                          type="button"
                                          onClick={() => handleOpenRejectReturnModal(r)}
                                          disabled={isProcessingReturnAction}
                                          className="btn btn-danger"
                                          style={{ fontSize: '11px', padding: '4px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}
                                          title="Reject return request after failed QC"
                                        >
                                          <X size={12} /> Reject Return
                                        </button>
                                      )}
                                      {(r.returnStage === 'ADMIN_APPROVED' || r.returnStage === 'ITEM_RETURNED') && (
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                          {r.returnStage === 'ADMIN_APPROVED' ? "Awaiting pickup..." : "Awaiting QC check..."}
                                        </span>
                                      )}
                                    </div>
                                  )}
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

          {/* TAB: WAREHOUSE LOGISTICS & ORDER ALLOCATIONS - SEPARATED BY FACILITY */}
          {activeTab === 'warehouses' && (
            <div>
              {/* Header */}
              <div className="flex-between" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Truck size={22} style={{ color: 'var(--accent-teal)' }} /> Warehouse Logistics & Multi-Facility Console
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Manage separated fulfillment facilities, audit isolated inventory bins, and route customer orders.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => {
                      setAdminWhForm({ id: null, name: '', code: '', address: '', city: '', active: true });
                      setShowAddWhAdminModal(true);
                    }} 
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                  >
                    + Register New Facility
                  </button>
                  <button 
                    type="button" 
                    onClick={fetchWarehousesAndAllocations} 
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                  >
                    <RefreshCw size={13} className={isLoadingWarehouses ? "spin-animation" : ""} /> Refresh Data
                  </button>
                </div>
              </div>

              {/* SUB-MODULE SELECTOR: Order Allocation Desk | Facilities | Multi-Warehouse Stock Ledger | Stock Transfers | Inbound & Ownership Audit */}
              {(() => {
                const isOrderFulfilledOrFinal = (order) => {
                  const s = (order.status || '').toUpperCase();
                  return s === 'DELIVERED' || s === 'SHIPPED' || s === 'PACKED' || s === 'PICKED' || 
                         s === 'OUT_FOR_DELIVERY' || s === 'COMPLETED' || 
                         s === 'RETURN_REQUESTED' || s === 'RETURN_APPROVED' || s === 'REFUNDED' || 
                         s === 'PARTIALLY_REFUNDED' || s === 'CANCELLED';
                };

                const isOrderAllocatedCheck = (order) => {
                  if (isOrderFulfilledOrFinal(order)) return true;
                  const orderAllocs = warehouseAllocations.filter(a => a.orderId === order.orderId);
                  return orderAllocs.some(a => a.warehouseId !== null && a.status === 'ALLOCATED');
                };

                const unallocCount = adminOrders.filter(order => {
                  const s = (order.status || '').toUpperCase();
                  if (s === 'CANCELLED' || s === 'REFUNDED' || isOrderFulfilledOrFinal(order)) return false;
                  return !isOrderAllocatedCheck(order);
                }).length;

                return (
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', overflowX: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => setAdminWhModuleSubTab('allocation_desk')}
                      className={`btn ${adminWhModuleSubTab === 'allocation_desk' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '12px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Truck size={14} /> 1. Order Allocation Desk
                      {unallocCount > 0 ? (
                        <span className="badge" style={{ background: '#f59e0b', color: '#fff', fontSize: '10px', padding: '2px 6px', fontWeight: '800' }}>
                          {unallocCount} Awaiting Routing
                        </span>
                      ) : (
                        <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', fontSize: '10px', padding: '2px 6px' }}>
                          ✓ Up to Date
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdminWhModuleSubTab('facilities')}
                      className={`btn ${adminWhModuleSubTab === 'facilities' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '12px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <MapPin size={14} /> 2. Facility Network & Consoles ({warehousesList.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setAdminWhModuleSubTab('inventory')}
                      className={`btn ${adminWhModuleSubTab === 'inventory' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '12px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Package size={14} /> 3. Multi-Hub Stock Ledger ({warehouseInventories.length} SKUs)
                    </button>

                    <button
                      type="button"
                      onClick={() => { setAdminWhModuleSubTab('transfers'); fetchAdminStockTransfers(); }}
                      className={`btn ${adminWhModuleSubTab === 'transfers' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: '12px', padding: '7px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <ArrowRightLeft size={14} /> 4. Regional Transfers ({adminStockTransfers.length})
                    </button>
                  </div>
                );
              })()}

              {/* VIEW 1: ORDER ALLOCATION DESK (PRIMARY ACTION CONSOLE FOR ADMIN) */}
              {adminWhModuleSubTab === 'allocation_desk' && (() => {
                const isOrderFulfilledOrFinal = (order) => {
                  const s = (order.status || '').toUpperCase();
                  return s === 'DELIVERED' || s === 'SHIPPED' || s === 'PACKED' || s === 'PICKED' || 
                         s === 'OUT_FOR_DELIVERY' || s === 'COMPLETED' || 
                         s === 'RETURN_REQUESTED' || s === 'RETURN_APPROVED' || s === 'REFUNDED' || 
                         s === 'PARTIALLY_REFUNDED' || s === 'CANCELLED';
                };

                const isOrderAllocated = (order) => {
                  if (isOrderFulfilledOrFinal(order)) return true;
                  const orderAllocs = warehouseAllocations.filter(a => a.orderId === order.orderId);
                  return orderAllocs.some(a => a.warehouseId !== null && a.status === 'ALLOCATED');
                };

                const unallocatedOrders = adminOrders.filter(order => {
                  const s = (order.status || '').toUpperCase();
                  if (s === 'CANCELLED' || s === 'REFUNDED' || isOrderFulfilledOrFinal(order)) return false;
                  const orderAllocs = warehouseAllocations.filter(a => a.orderId === order.orderId);
                  return !orderAllocs.some(a => a.warehouseId !== null && a.status === 'ALLOCATED');
                });

                const inProgressOrders = adminOrders.filter(order => {
                  const s = (order.status || '').toUpperCase();
                  if (s === 'DELIVERED' || s === 'CANCELLED' || s === 'REFUNDED' || s === 'COMPLETED') return false;
                  return isOrderAllocated(order);
                });
                const totalAvailRetail = warehouseInventories.reduce((sum, i) => sum + Math.max(0, (i.quantity || 0) - (i.allocated || 0)), 0);

                const displayedOrders = adminOrders
                  .filter(order => {
                    const isAlloc = isOrderAllocated(order);
                    const isDelivered = (order.status || '').toUpperCase() === 'DELIVERED';
                    const isCancelled = (order.status || '').toUpperCase() === 'CANCELLED';
                    if (allocFilterStatus === 'UNALLOCATED') return !isAlloc && !isDelivered && !isCancelled;
                    if (allocFilterStatus === 'ALLOCATED') return isAlloc && !isDelivered && !isCancelled;
                    if (allocFilterStatus === 'DELIVERED') return isDelivered;
                    return true;
                  })
                  .filter(order => {
                    if (!allocSearchTerm.trim()) return true;
                    const q = allocSearchTerm.toLowerCase();
                    return order.orderId?.toLowerCase().includes(q) || order.customerName?.toLowerCase().includes(q) || order.shippingCity?.toLowerCase().includes(q);
                  });

                return (
                  <div>
                    {/* Metric Cards Header */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                      <div className="metric-card" style={{ border: unallocatedOrders.length > 0 ? '1px solid #f59e0b' : '1px solid var(--border-light)', background: unallocatedOrders.length > 0 ? 'rgba(245, 158, 11, 0.04)' : 'var(--bg-card)' }}>
                        <div className="flex-between">
                          <span className="metric-label">Awaiting Admin Allocation</span>
                          <Clock size={18} style={{ color: '#f59e0b' }} />
                        </div>
                        <div className="metric-value" style={{ color: unallocatedOrders.length > 0 ? '#f59e0b' : 'inherit' }}>
                          {unallocatedOrders.length} Orders
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Require warehouse assignment</span>
                      </div>

                      <div className="metric-card">
                        <div className="flex-between">
                          <span className="metric-label">In-Fulfillment Pipeline</span>
                          <Truck size={18} style={{ color: 'var(--accent-indigo)' }} />
                        </div>
                        <div className="metric-value">
                          {inProgressOrders.length} Orders
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Active in picking / packing / dispatch</span>
                      </div>

                      <div className="metric-card">
                        <div className="flex-between">
                          <span className="metric-label">Active Facilities</span>
                          <Store size={18} style={{ color: 'var(--accent-teal)' }} />
                        </div>
                        <div className="metric-value">
                          {warehousesList.filter(w => w.active).length} Hubs
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Operational warehouse network</span>
                      </div>

                      <div className="metric-card">
                        <div className="flex-between">
                          <span className="metric-label">Available Retail Stock</span>
                          <CheckCircle size={18} style={{ color: 'var(--accent-emerald)' }} />
                        </div>
                        <div className="metric-value" style={{ color: 'var(--accent-emerald)' }}>
                          {totalAvailRetail} Units
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Unreserved across all hubs</span>
                      </div>
                    </div>

                    {/* Order Allocation Table Console */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                      <div style={{ marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Truck size={18} style={{ color: 'var(--accent-teal)' }} />
                          Customer Order Warehouse Routing Desk
                        </h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                          Allocate incoming orders to optimal fulfillment facilities. Assigned staff will instantly receive dispatch alerts.
                        </p>
                      </div>

                      {/* Filters and Search Toolbar */}
                      <div className="dashboard-filter-bar">
                        <div className="dashboard-filter-search">
                          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                          <input
                            type="text"
                            placeholder="Search by Order ID, Customer Name, or City..."
                            value={allocSearchTerm}
                            onChange={(e) => setAllocSearchTerm(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                          />
                        </div>

                        <div className="dashboard-filter-chips">
                          <button
                            type="button"
                            onClick={() => setAllocFilterStatus('UNALLOCATED')}
                            className={`btn ${allocFilterStatus === 'UNALLOCATED' ? 'btn-primary' : 'btn-secondary'}`}
                          >
                            ⏳ Awaiting Allocation ({unallocatedOrders.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setAllocFilterStatus('ALLOCATED')}
                            className={`btn ${allocFilterStatus === 'ALLOCATED' ? 'btn-primary' : 'btn-secondary'}`}
                          >
                            📦 In-Fulfillment ({inProgressOrders.length})
                          </button>
                          <button
                            type="button"
                            onClick={() => setAllocFilterStatus('ALL')}
                            className={`btn ${allocFilterStatus === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                          >
                            🌐 All Orders ({adminOrders.length})
                          </button>
                        </div>
                      </div>

                      {displayedOrders.length === 0 ? (
                        <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-input)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                          <CheckCircle2 size={36} style={{ opacity: 0.3, marginBottom: '8px', color: 'var(--accent-emerald)' }} />
                          <p style={{ margin: 0, fontSize: '14px' }}>
                            {allocFilterStatus === 'UNALLOCATED' 
                              ? 'All customer orders have been routed to fulfillment facilities! No pending allocations.'
                              : 'No matching orders found.'}
                          </p>
                        </div>
                      ) : (
                        <div className="table-container">
                          <table className="data-table" style={{ width: '100%', minWidth: '1250px', fontSize: '12.5px' }}>
                            <thead>
                              <tr>
                                <th style={{ minWidth: '180px' }}>Order Details</th>
                                <th style={{ minWidth: '200px' }}>Items Ordered</th>
                                <th style={{ minWidth: '220px' }}>Hub Stock Availability Check</th>
                                <th style={{ minWidth: '160px' }}>Routing Status</th>
                                <th style={{ textAlign: 'center', minWidth: '280px', width: '280px' }}>Allocate to Warehouse</th>
                              </tr>
                            </thead>
                            <tbody>
                              {displayedOrders.map(order => {
                                const orderAllocs = warehouseAllocations.filter(a => a.orderId === order.orderId);
                                const assignedWarehouseNames = [...new Set(orderAllocs.map(a => a.warehouseName || (a.warehouse && a.warehouse.name)).filter(Boolean))];
                                const isAlloc = isOrderAllocated(order);
                                const s = (order.status || '').toUpperCase();
                                const isRefunded = s === 'REFUNDED';
                                const isCancelled = s === 'CANCELLED';
                                const isDelivered = s === 'DELIVERED' || s === 'COMPLETED';
                                const isShipped = s === 'SHIPPED' || s === 'OUT_FOR_DELIVERY';
                                const currentSelectedWh = allocWhSelection[order.orderId] || '';

                                return (
                                  <tr key={order.id || order.orderId}>
                                    <td>
                                      <strong>{order.orderId}</strong>
                                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{order.customerName} • {order.shippingCity}</div>
                                      <div style={{ fontSize: '11px', color: 'var(--accent-teal)', fontWeight: '700', marginTop: '2px' }}>
                                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                                      </div>
                                    </td>
                                    <td>
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                        {order.items && order.items.map((it, idx) => (
                                          <div key={idx} style={{ fontSize: '11px' }}>
                                            <span className="badge" style={{ background: 'var(--bg-input)', fontSize: '10px', padding: '1px 5px' }}>{it.quantity}x</span> {it.productName}
                                          </div>
                                        ))}
                                      </div>
                                    </td>
                                    <td>
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {warehousesList.filter(w => w.active).map(wh => {
                                          let hasStock = true;
                                          let minAvail = 999999;
                                          if (order.items && order.items.length > 0) {
                                            order.items.forEach(it => {
                                              const match = warehouseInventories.find(i => (i.warehouseId === wh.id || (i.warehouse && i.warehouse.id === wh.id)) && i.productId === it.productId);
                                              const avail = match ? Math.max(0, (match.quantity || 0) - (match.allocated || 0)) : 0;
                                              if (avail < it.quantity) hasStock = false;
                                              if (avail < minAvail) minAvail = avail;
                                            });
                                          }
                                          return (
                                            <span
                                              key={wh.id}
                                              style={{
                                                fontSize: '10px',
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                background: hasStock ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.1)',
                                                color: hasStock ? '#10b981' : '#ef4444',
                                                fontWeight: '700',
                                                border: `1px solid ${hasStock ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`
                                              }}
                                              title={`${wh.name}: ${hasStock ? 'Sufficient stock to fulfill order' : 'Insufficient stock'}`}
                                            >
                                              {wh.code}: {hasStock ? `Ready (${minAvail})` : 'Low Stock'}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    </td>
                                    <td>
                                      {isRefunded ? (
                                        <span className="badge badge-rejected" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontWeight: '700' }}>
                                          <RotateCcw size={11} /> REFUNDED
                                        </span>
                                      ) : isCancelled ? (
                                        <span className="badge badge-rejected" style={{ fontSize: '10px' }}>
                                          ❌ Cancelled Order
                                        </span>
                                      ) : isDelivered ? (
                                        <div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <CheckCircle size={14} style={{ color: 'var(--accent-emerald)' }} />
                                            <strong style={{ color: 'var(--accent-emerald)' }}>Delivered & Complete</strong>
                                          </div>
                                          <span className="badge badge-approved" style={{ fontSize: '9px', marginTop: '3px' }}>
                                            {assignedWarehouseNames.join(', ') || 'Delivered'}
                                          </span>
                                        </div>
                                      ) : isShipped ? (
                                        <div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Truck size={14} style={{ color: 'var(--accent-teal)' }} />
                                            <strong style={{ color: 'var(--accent-teal)' }}>In Transit / Shipped</strong>
                                          </div>
                                          <span className="badge badge-customer" style={{ fontSize: '9px', marginTop: '3px' }}>
                                            {assignedWarehouseNames.join(', ') || order.status}
                                          </span>
                                        </div>
                                      ) : isAlloc ? (
                                        <div>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <CheckCircle size={14} style={{ color: 'var(--accent-emerald)' }} />
                                            <strong style={{ color: 'var(--accent-indigo)' }}>
                                              {assignedWarehouseNames.join(', ') || order.status || 'Allocated'}
                                            </strong>
                                          </div>
                                          <span className="badge badge-customer" style={{ fontSize: '9px', marginTop: '3px' }}>
                                            Stage: {order.status || 'ALLOCATED'}
                                          </span>
                                        </div>
                                      ) : (
                                        <span className="badge badge-pending" style={{ fontSize: '10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                          <Clock size={11} /> ⏳ Awaiting Allocation
                                        </span>
                                      )}
                                    </td>
                                    <td style={{ textAlign: 'center' }}>
                                      {isRefunded ? (
                                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                          <Ban size={12} /> Non-Allocatable (Refunded)
                                        </span>
                                      ) : isCancelled ? (
                                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                          <Ban size={12} /> Non-Allocatable (Cancelled)
                                        </span>
                                      ) : isAlloc ? (
                                        <span className="badge badge-approved" style={{ fontSize: '11px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                          <Check size={12} /> {isDelivered ? 'Delivered & Complete' : isShipped ? 'Dispatched' : `Allocated (${assignedWarehouseNames.join(', ') || 'Facility'})`}
                                        </span>
                                      ) : (
                                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                                          <select
                                            value={currentSelectedWh}
                                            onChange={(e) => setAllocWhSelection({ ...allocWhSelection, [order.orderId]: e.target.value })}
                                            className="form-input"
                                            style={{ fontSize: '11px', padding: '4px 6px', width: '150px' }}
                                          >
                                            <option value="">Select Facility...</option>
                                            {warehousesList.filter(w => w.active).map(w => (
                                              <option key={w.id} value={w.id}>
                                                {w.name} ({w.code})
                                              </option>
                                            ))}
                                          </select>

                                          <button
                                            type="button"
                                            onClick={() => {
                                              if (!currentSelectedWh) {
                                                showFlash('error', 'Please select a facility from the dropdown first.');
                                                return;
                                              }
                                              handleAdminAllocateOrder(order.orderId, currentSelectedWh);
                                            }}
                                            className="btn btn-primary"
                                            style={{ fontSize: '11px', padding: '4px 10px', whiteSpace: 'nowrap' }}
                                          >
                                            Submit
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => handleAdminAutoAllocateOrder(order.orderId)}
                                            className="btn btn-secondary"
                                            style={{ fontSize: '11px', padding: '4px 8px', whiteSpace: 'nowrap' }}
                                            title="Auto-route to facility with highest available stock"
                                          >
                                            ⚡ Auto
                                          </button>
                                        </div>
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
                  </div>
                );
              })()}

              {/* VIEW 2: SEPARATED FACILITIES & CONSOLES */}
              {adminWhModuleSubTab === 'facilities' && (
                <div>
                  {/* SEPARATED FACILITY SWITCHER TAB STRIP */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginBottom: '22px', 
                    overflowX: 'auto', 
                    padding: '6px', 
                    background: 'var(--bg-card)', 
                    borderRadius: '10px', 
                    border: '1px solid var(--border-light)' 
                  }}>
                    <button
                      type="button"
                      onClick={() => setSelectedAdminWhId('ALL')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        background: selectedAdminWhId === 'ALL' ? 'var(--accent-teal)' : 'transparent',
                        color: selectedAdminWhId === 'ALL' ? '#fff' : 'var(--text-secondary)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      🌐 All Facilities Hubs ({warehousesList.length})
                    </button>

                    {warehousesList.map(wh => {
                      const whInvs = warehouseInventories.filter(inv => inv.warehouseId === wh.id || (inv.warehouse && inv.warehouse.id === wh.id));
                      const whPhys = whInvs.reduce((sum, i) => sum + (i.quantity || 0), 0);
                      const whAlloc = whInvs.reduce((sum, i) => sum + (i.allocated || 0), 0);
                      const whAvail = Math.max(0, whPhys - whAlloc);
                      const isSelected = String(selectedAdminWhId) === String(wh.id);

                      return (
                        <button
                          key={wh.id}
                          type="button"
                          onClick={() => setSelectedAdminWhId(String(wh.id))}
                          style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: isSelected ? 'none' : '1px solid var(--border-light)',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            background: isSelected ? 'var(--accent-indigo, #6366f1)' : 'var(--bg-input)',
                            color: isSelected ? '#fff' : 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <span>🏢 {wh.name} ({wh.code})</span>
                          <span style={{
                            fontSize: '10px',
                            padding: '1px 6px',
                            borderRadius: '10px',
                            background: isSelected ? 'rgba(255,255,255,0.25)' : 'rgba(16,185,129,0.15)',
                            color: isSelected ? '#fff' : '#10b981',
                            fontWeight: '800'
                          }}>
                            {whAvail} Avail
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* If an Individual Facility is Selected: Dedicated Command Console */}
                  {selectedAdminWhId !== 'ALL' && (() => {
                    const currentWh = warehousesList.find(w => String(w.id) === String(selectedAdminWhId));
                    if (!currentWh) return null;

                    const whInvs = warehouseInventories.filter(inv => inv.warehouseId === currentWh.id || (inv.warehouse && inv.warehouse.id === currentWh.id));
                    const totalPhys = whInvs.reduce((sum, i) => sum + (i.quantity || 0), 0);
                    const totalAlloc = whInvs.reduce((sum, i) => sum + (i.allocated || 0), 0);
                    const totalAvail = Math.max(0, totalPhys - totalAlloc);
                    const totalDamaged = whInvs.reduce((sum, i) => sum + (i.damagedQuantity || 0), 0);

                    const whAllocs = warehouseAllocations.filter(a => String(a.warehouseId) === String(currentWh.id) || (a.warehouse && String(a.warehouse.id) === String(currentWh.id)));
                    const whOrderIds = [...new Set(whAllocs.map(a => a.orderId))];
                    const whOrders = adminOrders.filter(o => whOrderIds.includes(o.orderId));

                    return (
                      <div>
                        {/* Facility Command Header */}
                        <div style={{
                          background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(99, 102, 241, 0.05) 100%)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '12px',
                          padding: '20px',
                          marginBottom: '20px'
                        }}>
                          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                <span className="badge badge-vendor" style={{ fontSize: '12px', fontWeight: '800' }}>{currentWh.code}</span>
                                <span className={`badge ${currentWh.active ? 'badge-approved' : 'badge-rejected'}`}>
                                  {currentWh.active ? 'OPERATIONAL ACTIVE' : 'INACTIVE'}
                                </span>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 {currentWh.city}</span>
                              </div>
                              <h3 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                                {currentWh.name}
                              </h3>
                              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                                {currentWh.address}
                              </p>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setAdminWhForm(currentWh);
                                  setShowEditWhAdminModal(true);
                                }}
                                className="btn btn-secondary"
                                style={{ fontSize: '12px', padding: '6px 12px' }}
                              >
                                Edit Facility
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleAdminWhStatus(currentWh)}
                                className={`btn ${currentWh.active ? 'btn-secondary' : 'btn-primary'}`}
                                style={{ fontSize: '12px', padding: '6px 12px' }}
                              >
                                {currentWh.active ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedAdminWhId('ALL')}
                                className="btn btn-secondary"
                                style={{ fontSize: '12px', padding: '6px 12px' }}
                              >
                                ← Network View
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Facility Dedicated KPI Cards */}
                        <div className="dashboard-metrics" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                          <div className="metric-card" style={{ padding: '16px' }}>
                            <div className="flex-between">
                              <span className="metric-label">Physical Stock</span>
                              <Package size={16} style={{ color: 'var(--accent-teal)' }} />
                            </div>
                            <div className="metric-value" style={{ fontSize: '22px' }}>{totalPhys} units</div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>In {currentWh.code} storage</span>
                          </div>

                          <div className="metric-card" style={{ padding: '16px' }}>
                            <div className="flex-between">
                              <span className="metric-label">Available to Sell</span>
                              <CheckCircle size={16} style={{ color: 'var(--accent-emerald)' }} />
                            </div>
                            <div className="metric-value" style={{ fontSize: '22px', color: 'var(--accent-emerald)' }}>{totalAvail} units</div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Unreserved stock</span>
                          </div>

                          <div className="metric-card" style={{ padding: '16px' }}>
                            <div className="flex-between">
                              <span className="metric-label">Allocated In-Flight</span>
                              <Clock size={16} style={{ color: 'var(--accent-amber)' }} />
                            </div>
                            <div className="metric-value" style={{ fontSize: '22px', color: 'var(--accent-amber)' }}>{totalAlloc} units</div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Reserved in packaging</span>
                          </div>

                          <div className="metric-card" style={{ padding: '16px' }}>
                            <div className="flex-between">
                              <span className="metric-label">Quarantined Damaged</span>
                              <ShieldAlert size={16} style={{ color: '#ef4444' }} />
                            </div>
                            <div className="metric-value" style={{ fontSize: '22px', color: '#ef4444' }}>{totalDamaged} units</div>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Isolated from catalog</span>
                          </div>
                        </div>

                        {/* Section: Fulfillment Queue for THIS Facility */}
                        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                          <div className="flex-between" style={{ marginBottom: '16px' }}>
                            <div>
                              <h4 style={{ fontSize: '15px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Truck size={17} style={{ color: 'var(--accent-indigo)' }} />
                                Fulfillment Orders Assigned to {currentWh.name} ({whOrders.length})
                              </h4>
                              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                                Customer orders routed to this physical location for picking, packing, and dispatch.
                              </p>
                            </div>
                          </div>

                          {whOrders.length === 0 ? (
                            <div style={{ padding: '24px', textAlign: 'center', background: 'var(--bg-input)', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                              No orders currently assigned to {currentWh.name}.
                            </div>
                          ) : (
                            <div className="table-container">
                              <table className="data-table" style={{ width: '100%', minWidth: '1100px', fontSize: '12.5px' }}>
                                <thead>
                                  <tr>
                                    <th style={{ minWidth: '180px' }}>Order Details</th>
                                    <th style={{ minWidth: '220px' }}>Items Ordered</th>
                                    <th style={{ minWidth: '130px' }}>Total Amount</th>
                                    <th style={{ minWidth: '160px' }}>Fulfillment Stage</th>
                                    <th style={{ minWidth: '220px' }}>Re-route Facility</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {whOrders.map(ord => {
                                    return (
                                      <tr key={ord.id || ord.orderId}>
                                        <td>
                                          <strong>{ord.orderId}</strong>
                                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ord.customerName} • {ord.shippingCity}</div>
                                        </td>
                                        <td>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            {ord.items && ord.items.map((it, idx) => (
                                              <div key={idx} style={{ fontSize: '11px' }}>
                                                <span className="badge" style={{ background: 'var(--bg-input)', fontSize: '10px', padding: '1px 5px' }}>{it.quantity}x</span> {it.productName}
                                              </div>
                                            ))}
                                          </div>
                                        </td>
                                        <td><strong>₹{ord.totalAmount?.toLocaleString('en-IN')}</strong></td>
                                        <td>
                                          <span className={`badge ${
                                            ord.status === 'DELIVERED' ? 'badge-approved' :
                                            ord.status === 'SHIPPED' ? 'badge-vendor' :
                                            ord.status === 'PACKED' ? 'badge-customer' :
                                            ord.status === 'PICKED' ? 'badge-customer' : 'badge-pending'
                                          }`} style={{ fontSize: '10px', padding: '2px 8px', fontWeight: '700' }}>
                                            {ord.status || 'ALLOCATED'}
                                          </span>
                                        </td>
                                        <td>
                                          <select
                                            onChange={(e) => {
                                              if (e.target.value) {
                                                handleAdminAllocateOrder(ord.orderId, e.target.value);
                                              }
                                            }}
                                            defaultValue=""
                                            className="form-input"
                                            style={{ fontSize: '11px', padding: '3px 6px' }}
                                          >
                                            <option value="">Re-route to another facility...</option>
                                            {warehousesList.filter(w => w.id !== currentWh.id && w.active).map(w => (
                                              <option key={w.id} value={w.id}>
                                                {w.name} ({w.code})
                                              </option>
                                            ))}
                                          </select>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* If NETWORK OVERVIEW is selected: All Facilities Hub Cards Grid */}
                  {selectedAdminWhId === 'ALL' && (
                    <div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                        {warehousesList.map(wh => {
                          const whInvs = warehouseInventories.filter(inv => inv.warehouseId === wh.id || (inv.warehouse && inv.warehouse.id === wh.id));
                          const totalPhys = whInvs.reduce((sum, i) => sum + (i.quantity || 0), 0);
                          const totalAlloc = whInvs.reduce((sum, i) => sum + (i.allocated || 0), 0);
                          const totalAvail = Math.max(0, totalPhys - totalAlloc);
                          const whAllocs = warehouseAllocations.filter(a => String(a.warehouseId) === String(wh.id) || (a.warehouse && String(a.warehouse.id) === String(wh.id)));

                          return (
                            <div
                              key={wh.id}
                              style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-light)',
                                borderRadius: '12px',
                                padding: '18px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                gap: '14px'
                              }}
                            >
                              <div>
                                <div className="flex-between" style={{ marginBottom: '8px' }}>
                                  <span className="badge badge-vendor" style={{ fontWeight: '800' }}>{wh.code}</span>
                                  <span className={`badge ${wh.active ? 'badge-approved' : 'badge-rejected'}`}>
                                    {wh.active ? 'OPERATIONAL' : 'INACTIVE'}
                                  </span>
                                </div>
                                <h4 style={{ fontSize: '16px', fontWeight: '800', margin: '0 0 4px 0' }}>{wh.name}</h4>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>📍 {wh.city} — {wh.address}</div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '14px', textAlign: 'center' }}>
                                  <div style={{ background: 'var(--bg-input)', padding: '8px', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>PHYSICAL</div>
                                    <strong style={{ fontSize: '15px' }}>{totalPhys}</strong>
                                  </div>
                                  <div style={{ background: 'var(--bg-input)', padding: '8px', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>AVAILABLE</div>
                                    <strong style={{ fontSize: '15px', color: '#10b981' }}>{totalAvail}</strong>
                                  </div>
                                  <div style={{ background: 'var(--bg-input)', padding: '8px', borderRadius: '6px' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>IN-FLIGHT</div>
                                    <strong style={{ fontSize: '15px', color: '#3b82f6' }}>{whAllocs.filter(a => a.status !== 'DELIVERED').length}</strong>
                                  </div>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedAdminWhId(String(wh.id))}
                                className="btn btn-primary"
                                style={{ width: '100%', fontSize: '12px', padding: '8px' }}
                              >
                                Open {wh.code} Facility Console →
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 3: MULTI-HUB INVENTORY LEDGER */}
              {adminWhModuleSubTab === 'inventory' && (() => {
                // Group warehouse inventories by product
                const productsMap = {};
                warehouseInventories.forEach(inv => {
                  if (!productsMap[inv.productId]) {
                    productsMap[inv.productId] = {
                      id: inv.productId,
                      name: inv.productName,
                      category: inv.productCategory,
                      price: inv.productPrice,
                      imageUrl: inv.productImageUrl,
                      hubStocks: {},
                      totalPhysical: 0,
                      totalAllocated: 0,
                      totalAvailable: 0
                    };
                  }
                  productsMap[inv.productId].hubStocks[inv.warehouseId] = inv.quantity || 0;
                  productsMap[inv.productId].totalPhysical += (inv.quantity || 0);
                  productsMap[inv.productId].totalAllocated += (inv.allocated || 0);
                  productsMap[inv.productId].totalAvailable += Math.max(0, (inv.quantity || 0) - (inv.allocated || 0));
                });
                const groupedProducts = Object.values(productsMap);

                return (
                  <div>
                    {/* Stock Distribution per Product Card */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
                      <div className="flex-between" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Layers size={18} style={{ color: 'var(--accent-indigo)' }} />
                            Vendor Product Stock Distribution Across Warehouses
                          </h3>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                            Admin manages how vendor product quantities are distributed across Kolkata, Mumbai, Delhi, and Bangalore hubs.
                          </p>
                        </div>
                      </div>

                      <div className="table-container">
                        <table className="data-table" style={{ width: '100%', minWidth: '1200px', fontSize: '12.5px' }}>
                          <thead>
                            <tr>
                              <th style={{ minWidth: '220px' }}>Product</th>
                              <th style={{ minWidth: '140px' }}>Total Physical Stock</th>
                              <th style={{ minWidth: '130px' }}>Available to Sell</th>
                              {warehousesList.map(w => (
                                <th key={w.id} style={{ textAlign: 'center', minWidth: '110px' }}>
                                  {w.name?.replace('Warehouse', '').replace('Fulfillment Center', '').replace('Logistics Hub', '').trim() || w.city}
                                  <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>({w.code})</div>
                                </th>
                              ))}
                              <th style={{ textAlign: 'center', minWidth: '140px' }}>Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {groupedProducts.map(p => (
                              <tr key={p.id}>
                                <td>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', background: 'var(--bg-input)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      {p.imageUrl ? (
                                        <img src={formatImageUrl(p.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                      ) : (
                                        <ProductIcon name={p.name} category={p.category} size={16} />
                                      )}
                                    </div>
                                    <div>
                                      <strong>{p.name}</strong>
                                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>SKU #{p.id} • ₹{p.price}</div>
                                    </div>
                                  </div>
                                </td>
                                <td><strong>{p.totalPhysical}</strong> units</td>
                                <td><strong style={{ color: p.totalAvailable < 5 ? '#ef4444' : '#10b981' }}>{p.totalAvailable}</strong> units</td>
                                {warehousesList.map(w => {
                                  const qty = p.hubStocks[w.id] || 0;
                                  return (
                                    <td key={w.id} style={{ textAlign: 'center' }}>
                                      <span className="badge" style={{ background: qty > 0 ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-input)', color: qty > 0 ? 'var(--accent-indigo)' : 'var(--text-muted)', fontWeight: '700' }}>
                                        {qty}
                                      </span>
                                    </td>
                                  );
                                })}
                                <td style={{ textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDistributeModal(p.id, p.name)}
                                    className="btn btn-primary"
                                    style={{ fontSize: '11px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    ⚡ Distribute Stock
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Detailed Hub Stock Ledger */}
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
                      <div className="flex-between" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                        <div>
                          <h3 style={{ fontSize: '16px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Package size={18} style={{ color: 'var(--accent-teal)' }} />
                            Centralized Multi-Warehouse Stock Ledger ({warehouseInventories.length} SKU Entries)
                          </h3>
                          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                            Physical inventory breakdown per warehouse facility with real-time allocated reservations.
                          </p>
                        </div>
                      </div>

                      {warehouseInventories.length === 0 ? (
                        <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-input)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                          No inventory records mapped across facilities.
                        </div>
                      ) : (
                        <div className="table-container">
                          <table className="data-table" style={{ width: '100%', minWidth: '1150px', fontSize: '12.5px' }}>
                            <thead>
                              <tr>
                                <th style={{ minWidth: '220px' }}>Product Name</th>
                                <th style={{ minWidth: '130px' }}>Category</th>
                                <th style={{ minWidth: '180px' }}>Warehouse Hub</th>
                                <th style={{ minWidth: '130px' }}>Physical Units</th>
                                <th style={{ minWidth: '140px' }}>Allocated / Reserved</th>
                                <th style={{ minWidth: '140px' }}>Available to Sell</th>
                                <th style={{ minWidth: '160px' }}>Quarantined Damaged</th>
                              </tr>
                            </thead>
                            <tbody>
                              {warehouseInventories.map(inv => (
                                <tr key={inv.id}>
                                  <td><strong>{inv.productName}</strong></td>
                                  <td><span className="badge badge-customer">{inv.productCategory}</span></td>
                                  <td>
                                    <strong>{inv.warehouseName}</strong>
                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Code: {inv.warehouseCode}</div>
                                  </td>
                                  <td><strong>{inv.quantity}</strong> units</td>
                                  <td style={{ color: 'var(--accent-blue)' }}>{inv.allocated || 0}</td>
                                  <td>
                                    <strong style={{ color: (inv.available || 0) < 5 ? '#ef4444' : '#10b981' }}>
                                      {inv.available || 0} units
                                    </strong>
                                  </td>
                                  <td>
                                    {(inv.damagedQuantity || 0) > 0 ? (
                                      <span style={{ color: '#ef4444', fontWeight: '700' }}>{inv.damagedQuantity} units</span>
                                    ) : (
                                      <span style={{ color: 'var(--text-muted)' }}>0</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* VIEW 2: VENDOR STOCK DISTRIBUTION & TRANSFERS CONTROLLER */}
              {adminWhModuleSubTab === 'transfers' && (
                <div>
                  <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ArrowRightLeft size={20} style={{ color: 'var(--accent-indigo)' }} />
                        Vendor Stock Distribution & Multi-Warehouse Allocation
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                        All stock listed by vendors in the catalog is distributed and allocated by Admin across regional warehouses (Kolkata, Mumbai, Delhi, Bangalore).
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const activeWhs = warehousesList.filter(w => w.active);
                          const initialDist = {};
                          activeWhs.forEach(w => { initialDist[w.id] = 10; });

                          setAdminTransferForm({
                            sourceOrigin: 'VENDOR',
                            sourceWarehouseId: 'VENDOR',
                            destinationWarehouseId: 'ALL',
                            productId: allProductsList[0]?.id ? String(allProductsList[0].id) : '',
                            quantity: 10,
                            distributions: initialDist,
                            transferReason: 'VENDOR_STOCK_DISTRIBUTION',
                            notes: 'Admin distributes vendor listed catalog stock across regional fulfillment centers.'
                          });
                          setShowCreateTransferAdminModal(true);
                        }}
                        className="btn btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '7px 14px' }}
                      >
                        <Plus size={14} /> + Distribute Vendor Stock to Warehouses
                      </button>
                      <button
                        type="button"
                        onClick={fetchAdminStockTransfers}
                        className="btn btn-secondary"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '7px 14px' }}
                      >
                        <RefreshCw size={13} className={isLoadingAdminTransfers ? "spin-animation" : ""} /> Refresh Ledger
                      </button>
                    </div>
                  </div>

                  {/* Explanatory Banner on Control vs Ownership */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(20, 184, 166, 0.08) 100%)',
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    marginBottom: '20px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.5'
                  }}>
                    • <strong>Source Origin (Vendor):</strong> The Vendor owns and lists the product stock in the catalog. Vendors do not dispatch shipments directly to warehouses.<br />
                    • <strong>Admin Distribution Authority:</strong> Administrator allocates and balances physical inventory across <strong>Kolkata, Mumbai, Delhi, and Bangalore</strong> fulfillment hubs to ensure fast regional order processing.
                  </div>

                  {/* Stock Transfers Table */}
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '12px', padding: '20px' }}>
                    {adminStockTransfers.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        <ArrowRightLeft size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                        <p style={{ margin: 0, fontSize: '14px' }}>No stock distributions or transfers recorded yet.</p>
                      </div>
                    ) : (
                      <div className="table-container">
                        <table className="data-table" style={{ width: '100%', minWidth: '1200px', fontSize: '12.5px' }}>
                          <thead>
                            <tr>
                              <th style={{ minWidth: '180px' }}>Distribution Ref / Date</th>
                              <th style={{ minWidth: '200px' }}>Product SKU</th>
                              <th style={{ minWidth: '120px' }}>Units</th>
                              <th style={{ minWidth: '160px' }}>Source Origin</th>
                              <th style={{ minWidth: '180px' }}>Destination Warehouse Hub</th>
                              <th style={{ minWidth: '150px' }}>Fulfillment Status</th>
                              <th style={{ minWidth: '220px' }}>Reason / Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            {adminStockTransfers.map(t => (
                              <tr key={t.id}>
                                <td>
                                  <strong style={{ fontFamily: 'monospace', color: 'var(--accent-indigo)' }}>{t.transferNumber}</strong>
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                    {t.createdAt ? new Date(t.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                                  </div>
                                </td>
                                <td>
                                  <strong>{t.product?.name}</strong>
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>₹{t.product?.price} • SKU #{t.product?.id}</div>
                                </td>
                                <td><strong style={{ color: 'var(--accent-indigo)', fontSize: '13px' }}>{t.quantity} units</strong></td>
                                <td>
                                  {t.sourceWarehouse ? (
                                    <div>
                                      <div>{t.sourceWarehouse.name}</div>
                                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.sourceWarehouse.code}</div>
                                    </div>
                                  ) : (
                                    <div>
                                      <span className="badge badge-vendor" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                        🏷️ {t.sourceVendorName || t.product?.vendorName || 'Vendor Listed Stock'}
                                      </span>
                                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Origin: Vendor Catalog</div>
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <div><strong>{t.destinationWarehouse?.name}</strong></div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Facility Code: {t.destinationWarehouse?.code}</div>
                                </td>
                                <td>
                                  <span className={`badge ${
                                    t.status === 'RECEIVED_AND_SHELVED' ? 'badge-approved' :
                                    t.status === 'DISPATCHED' ? 'badge-customer' : 'badge-pending'
                                  }`} style={{ fontSize: '10px', padding: '2px 8px', fontWeight: '700' }}>
                                    {t.status === 'RECEIVED_AND_SHELVED' ? '✓ DISTRIBUTED & SHELVED' :
                                     t.status === 'DISPATCHED' ? 'IN TRANSIT BETWEEN HUBS' :
                                     t.status === 'APPROVED_BY_ADMIN' ? 'APPROVED BY ADMIN' : t.status}
                                  </span>
                                </td>
                                <td>
                                  <div>{t.transferReason || 'Vendor Stock Distribution'}</div>
                                  {t.notes && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{t.notes}</div>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: PAYMENT STATUS MONITORING */}
          {(activeTab === 'monitoring' || activeTab === 'orders') && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={22} style={{ color: 'var(--accent-teal)' }} /> Live Payment Status Monitoring
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Real-time transaction health console with Razorpay verification tracking and failed attempt detection.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchMonitoring} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingMonitoring ? "spin-animation" : ""} /> Refresh Status
                </button>
              </div>

              {/* Status Overview Metric Cards */}
              <div className="analytics-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Total Orders</span>
                    <Package size={16} style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px' }}>
                    {monitoringMetrics.totalOrders}
                  </div>
                  <div className="analytics-card-desc">All platform checkouts</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Paid Volume</span>
                    <DollarSign size={16} style={{ color: '#10b981' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#10b981' }}>
                    ₹{monitoringMetrics.totalPaidVolume?.toLocaleString('en-IN') || '0'}
                  </div>
                  <div className="analytics-card-desc">{monitoringMetrics.paidCount} verified orders</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Pending / Return QC</span>
                    <Clock size={16} style={{ color: '#f59e0b' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#f59e0b' }}>
                    {monitoringMetrics.pendingCount}
                  </div>
                  <div className="analytics-card-desc">COD / Return requests</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid #ef4444', background: monitoringMetrics.failedCount > 0 ? 'rgba(239, 68, 68, 0.05)' : 'var(--bg-card)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title" style={{ color: monitoringMetrics.failedCount > 0 ? '#ef4444' : 'inherit' }}>Failed / Cancelled</span>
                    <AlertTriangle size={16} style={{ color: '#ef4444' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#ef4444' }}>
                    {monitoringMetrics.failedCount}
                  </div>
                  <div className="analytics-card-desc">Detected payment failures</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid #8b5cf6' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Refunded Orders</span>
                    <RotateCcw size={16} style={{ color: '#8b5cf6' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#8b5cf6' }}>
                    {monitoringMetrics.refundedCount}
                  </div>
                  <div className="analytics-card-desc">Full / partial refunds</div>
                </div>
              </div>

              {/* Filters and Search Bar */}
              <div className="dashboard-filter-bar">
                <div className="dashboard-filter-search">
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search by Order ID, Recipient Name, or Phone..." 
                    value={monitoringSearch}
                    onChange={(e) => setMonitoringSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                  />
                </div>

                <div className="dashboard-filter-chips">
                  {['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setMonitoringFilter(st)}
                      className={`btn ${monitoringFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Monitoring Table */}
              {monitoringOrders.filter(o => o && !o.orderId?.startsWith('ORD-FAIL-') && o.paymentStatus !== 'FAILED').length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <Activity className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No orders registered on the platform yet.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ minWidth: '1200px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '120px' }}>Date</th>
                        <th style={{ minWidth: '140px' }}>Order ID</th>
                        <th style={{ minWidth: '180px' }}>Customer / Recipient</th>
                        <th style={{ minWidth: '130px' }}>Payment Method</th>
                        <th style={{ minWidth: '160px' }}>Payment ID</th>
                        <th style={{ minWidth: '130px' }}>Total Amount</th>
                        <th style={{ minWidth: '130px', textAlign: 'center' }}>Payment Status</th>
                        <th style={{ minWidth: '140px', textAlign: 'center' }}>Fulfillment</th>
                        <th style={{ textAlign: 'center', minWidth: '160px' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monitoringOrders
                        .filter(ord => ord && !ord.orderId?.startsWith('ORD-FAIL-') && ord.paymentStatus !== 'FAILED')
                        .filter(ord => {
                          const pStat = ord.paymentStatus || 'PENDING';
                          if (monitoringFilter !== 'ALL') {
                            if (monitoringFilter === 'REFUNDED') {
                              if (pStat !== 'REFUNDED' && pStat !== 'PARTIALLY_REFUNDED') return false;
                            } else if (pStat !== monitoringFilter) {
                              return false;
                            }
                          }
                          if (monitoringSearch.trim()) {
                            const q = monitoringSearch.toLowerCase();
                            const matchId = ord.orderId?.toLowerCase().includes(q);
                            const matchName = ord.recipientName?.toLowerCase().includes(q);
                            const matchPhone = ord.recipientPhone?.toLowerCase().includes(q);
                            return matchId || matchName || matchPhone;
                          }
                          return true;
                        })
                        .map((ord) => {
                          const pStat = ord.paymentStatus || 'PENDING';
                          const isPaid = pStat === 'PAID';
                          const isFailed = pStat === 'FAILED';
                          const isRefundPending = pStat === 'REFUND_PENDING';
                          const isRefunded = pStat === 'REFUNDED' || pStat === 'PARTIALLY_REFUNDED';

                          return (
                            <tr key={ord.id || ord.orderId} style={{ background: isFailed ? 'rgba(239, 68, 68, 0.04)' : isRefundPending ? 'rgba(245, 158, 11, 0.03)' : 'transparent' }}>
                              <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{ord.date}</td>
                              <td>
                                <strong style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{ord.orderId}</strong>
                              </td>
                              <td>
                                <div style={{ fontWeight: '600', fontSize: '13px' }}>{ord.recipientName || `User #${ord.userId || 'GUEST'}`}</div>
                                {ord.recipientPhone && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{ord.recipientPhone}</div>}
                              </td>
                              <td>
                                <span className="badge badge-customer" style={{ fontSize: '11px' }}>
                                  {ord.paymentMethod || 'RAZORPAY'}
                                </span>
                              </td>
                              <td>
                                {ord.razorpayPaymentId ? (
                                  <code style={{ fontSize: '11px', color: 'var(--accent-teal)', background: 'var(--bg-input)', padding: '2px 6px', borderRadius: '4px' }}>
                                    {ord.razorpayPaymentId}
                                  </code>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                                )}
                              </td>
                              <td>
                                <strong style={{ color: 'var(--accent-emerald)', fontSize: '14px' }}>₹{ord.totalAmount}</strong>
                              </td>
                              <td>
                                {isPaid && (
                                  <span className="badge badge-approved" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Check size={11} strokeWidth={3} /> PAID
                                  </span>
                                )}
                                {isRefundPending && (
                                  <span className="badge" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                                    <Clock size={11} /> RETURN PENDING
                                  </span>
                                )}
                                {isFailed && (
                                  <span className="badge badge-rejected" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <X size={11} strokeWidth={3} /> FAILED
                                  </span>
                                )}
                                {isRefunded && (
                                  <span className="badge" style={{ fontSize: '11px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <RotateCcw size={11} /> {pStat}
                                  </span>
                                )}
                                {!isPaid && !isRefundPending && !isFailed && !isRefunded && (
                                  <span className="badge" style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                                    {pStat}
                                  </span>
                                )}
                              </td>
                              <td>
                                <span className="order-status-badge" style={{ fontSize: '11px' }}>
                                  {ord.status}
                                </span>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleInspectOrderStatus(ord.orderId)}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '11px', padding: '4px 8px' }}
                                    title="View Live Status Details"
                                  >
                                    <Eye size={13} />
                                  </button>
                                  {(isPaid || pStat === 'PARTIALLY_REFUNDED') && (
                                    <button
                                      type="button"
                                      onClick={() => handleOpenRefundModal(ord)}
                                      className="btn btn-secondary"
                                      style={{ fontSize: '11px', padding: '4px 8px', color: '#a78bfa', borderColor: 'rgba(139, 92, 246, 0.3)' }}
                                      title="Issue Direct Refund"
                                    >
                                      <RotateCcw size={13} />
                                    </button>
                                  )}
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

          {/* TAB 4: PLATFORM TRANSACTIONS */}
          {activeTab === 'transactions' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Receipt size={22} style={{ color: 'var(--accent-teal)' }} /> Platform-Wide Transactions Audit
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Unified ledger of all checkouts, Razorpay signatures, payment IDs, and refund logs.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchTransactions} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingTransactions ? "spin-animation" : ""} /> Refresh Ledger
                </button>
              </div>

              {/* Filters and Search Bar */}
              <div className="dashboard-filter-bar">
                <div className="dashboard-filter-search">
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search by Order ID, Razorpay Payment ID, or User ID..." 
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                  />
                </div>

                <div className="dashboard-filter-chips">
                  {['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setTxFilter(st)}
                      className={`btn ${txFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transactions Table */}
              {transactions.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <Receipt className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No transaction records found on the platform.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ minWidth: '1250px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '120px' }}>Date</th>
                        <th style={{ minWidth: '140px' }}>Order ID</th>
                        <th style={{ minWidth: '110px' }}>User ID</th>
                        <th style={{ minWidth: '120px' }}>Method</th>
                        <th style={{ minWidth: '180px' }}>Razorpay Payment ID</th>
                        <th style={{ minWidth: '130px' }}>Total Amount</th>
                        <th style={{ minWidth: '130px', textAlign: 'center' }}>Payment Status</th>
                        <th style={{ minWidth: '120px', textAlign: 'center' }}>Refunds</th>
                        <th style={{ textAlign: 'center', minWidth: '140px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions
                        .filter(tx => {
                          if (txFilter !== 'ALL') {
                            if (txFilter === 'REFUNDED') {
                              if (tx.paymentStatus !== 'REFUNDED' && tx.paymentStatus !== 'PARTIALLY_REFUNDED') return false;
                            } else if (tx.paymentStatus !== txFilter) {
                              return false;
                            }
                          }
                          if (txSearch.trim()) {
                            const q = txSearch.toLowerCase();
                            const matchOrderId = tx.orderId?.toLowerCase().includes(q);
                            const matchPaymentId = tx.razorpayPaymentId?.toLowerCase().includes(q);
                            const matchUserId = tx.userId ? tx.userId.toString().includes(q) : false;
                            return matchOrderId || matchPaymentId || matchUserId;
                          }
                          return true;
                        })
                        .map((tx) => {
                          const isPaid = tx.paymentStatus === 'PAID';
                          const isRefunded = tx.paymentStatus === 'REFUNDED';
                          const isPartiallyRefunded = tx.paymentStatus === 'PARTIALLY_REFUNDED';
                          const isFailed = tx.paymentStatus === 'FAILED';

                          return (
                            <tr key={tx.id}>
                              <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{tx.date}</td>
                              <td>
                                <strong style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{tx.orderId}</strong>
                              </td>
                              <td>
                                <span className="badge badge-customer" style={{ fontSize: '11px' }}>
                                  User #{tx.userId || 'N/A'}
                                </span>
                              </td>
                              <td>
                                <span className="badge" style={{ background: 'var(--bg-input)', fontSize: '11px' }}>
                                  {tx.paymentMethod || 'RAZORPAY'}
                                </span>
                              </td>
                              <td>
                                {tx.razorpayPaymentId ? (
                                  <code style={{ fontSize: '11px', color: 'var(--accent-teal)', background: 'var(--bg-input)', padding: '2px 6px', borderRadius: '4px' }}>
                                    {tx.razorpayPaymentId}
                                  </code>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>—</span>
                                )}
                              </td>
                              <td>
                                <strong style={{ color: 'var(--accent-emerald)', fontSize: '14px' }}>₹{tx.totalAmount}</strong>
                              </td>
                              <td>
                                {isPaid && (
                                  <span className="badge badge-approved" style={{ fontSize: '11px' }}>PAID</span>
                                )}
                                {isRefunded && (
                                  <span className="badge" style={{ fontSize: '11px', background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa' }}>REFUNDED</span>
                                )}
                                {isPartiallyRefunded && (
                                  <span className="badge" style={{ fontSize: '11px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc' }}>PARTIAL REFUND</span>
                                )}
                                {isFailed && (
                                  <span className="badge badge-rejected" style={{ fontSize: '11px' }}>FAILED</span>
                                )}
                                {!isPaid && !isRefunded && !isPartiallyRefunded && !isFailed && (
                                  <span className="badge" style={{ fontSize: '11px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>{tx.paymentStatus}</span>
                                )}
                              </td>
                              <td>
                                {tx.totalRefunded > 0 ? (
                                  <div style={{ fontSize: '12px', color: '#c084fc' }}>
                                    <strong>₹{tx.totalRefunded}</strong> ({tx.refunds?.length} log{tx.refunds?.length === 1 ? '' : 's'})
                                  </div>
                                ) : (
                                  <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>None</span>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {(isPaid || isPartiallyRefunded) ? (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenRefundModal(tx)}
                                    className="btn btn-secondary"
                                    style={{ fontSize: '11px', padding: '4px 10px', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.3)' }}
                                  >
                                    <RotateCcw size={12} /> Refund
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>—</span>
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

          {/* TAB 5: VENDOR SETTLEMENTS */}
          {activeTab === 'settlements' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <IndianRupee size={22} style={{ color: 'var(--accent-teal)' }} /> Vendor Settlement & Payout Ledger
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Automatic 10% platform commission ledger with manual test-mode settlement reconciliation.
                  </p>
                </div>
                <button 
                  type="button" 
                  onClick={fetchSettlements} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                >
                  <RefreshCw size={13} className={isLoadingSettlements ? "spin-animation" : ""} /> Refresh Settlements
                </button>
              </div>

              {/* Settlement Summary Cards */}
              <div className="analytics-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="analytics-card" style={{ padding: '16px' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Gross Volume</span>
                    <DollarSign size={16} style={{ color: 'var(--accent-blue)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px' }}>
                    ₹{settlementsSummary.totalGross?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <div className="analytics-card-desc">All vendor item sales</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-rose)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Platform Revenue (10%)</span>
                    <ShieldCheck size={16} style={{ color: 'var(--accent-rose)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: 'var(--accent-rose)' }}>
                    ₹{settlementsSummary.totalCommission?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <div className="analytics-card-desc">Platform fee collected</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid #f59e0b' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Pending Payouts</span>
                    <Clock size={16} style={{ color: '#f59e0b' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: '#f59e0b' }}>
                    ₹{settlementsSummary.pendingPayout?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <div className="analytics-card-desc">Awaiting payout approval</div>
                </div>

                <div className="analytics-card" style={{ padding: '16px', borderLeft: '4px solid var(--accent-emerald)' }}>
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Settled Payouts</span>
                    <CheckCircle size={16} style={{ color: 'var(--accent-emerald)' }} />
                  </div>
                  <div className="analytics-card-value" style={{ fontSize: '22px', color: 'var(--accent-emerald)' }}>
                    ₹{settlementsSummary.settledPayout?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <div className="analytics-card-desc">Transferred to vendors</div>
                </div>
              </div>

              {/* Filters and Search Bar */}
              <div className="dashboard-filter-bar">
                <div className="dashboard-filter-search">
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="Search by Vendor ID or Order ID..." 
                    value={settlementSearch}
                    onChange={(e) => setSettlementSearch(e.target.value)}
                    className="form-input"
                    style={{ paddingLeft: '36px', height: '38px', fontSize: '13px' }}
                  />
                </div>

                <div className="dashboard-filter-chips">
                  {['ALL', 'PENDING', 'SETTLED', 'REFUNDED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSettlementFilter(st)}
                      className={`btn ${settlementFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      {st === 'ALL' ? `All (${settlements.length})` : 
                       st === 'PENDING' ? `Pending (${settlements.filter(s => s.status === 'PENDING').length})` : 
                       st === 'SETTLED' ? `Settled (${settlements.filter(s => s.status === 'SETTLED').length})` : 
                       `Refunded (${settlements.filter(s => s.status === 'REFUNDED').length})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Settlements Table */}
              {settlements.length === 0 ? (
                <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '10px' }}>
                  <IndianRupee className="cart-empty-icon" style={{ opacity: 0.2 }} />
                  <p>No vendor settlement records found. Settlements are created when paid orders are placed.</p>
                </div>
              ) : (
                <div className="table-container">
                  <table className="custom-table" style={{ minWidth: '1250px' }}>
                    <thead>
                      <tr>
                        <th style={{ minWidth: '120px' }}>Date</th>
                        <th style={{ minWidth: '120px' }}>Vendor</th>
                        <th style={{ minWidth: '140px' }}>Order ID</th>
                        <th style={{ minWidth: '180px' }}>Product Name</th>
                        <th style={{ minWidth: '120px' }}>Gross Sale</th>
                        <th style={{ minWidth: '130px' }}>Commission</th>
                        <th style={{ minWidth: '140px' }}>Net Vendor Payout</th>
                        <th style={{ minWidth: '120px', textAlign: 'center' }}>Status</th>
                        <th style={{ minWidth: '120px' }}>Settled At</th>
                        <th style={{ textAlign: 'center', minWidth: '140px' }}>Payout Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {settlements
                        .filter(s => {
                          if (settlementFilter !== 'ALL' && s.status !== settlementFilter) return false;
                          if (settlementSearch.trim()) {
                            const q = settlementSearch.toLowerCase();
                            const matchVendor = s.vendorId ? s.vendorId.toString().includes(q) : false;
                            const matchOrder = s.orderId?.toLowerCase().includes(q);
                            return matchVendor || matchOrder;
                          }
                          return true;
                        })
                        .map((s) => {
                          const isSettled = s.status === 'SETTLED';
                          const isRefunded = s.status === 'REFUNDED';

                          return (
                            <tr key={s.id}>
                              <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.createdAt || 'Recent'}</td>
                              <td>
                                <span className="badge badge-vendor" style={{ fontSize: '11px' }}>
                                  Vendor #{s.vendorId}
                                </span>
                              </td>
                              <td style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--accent-blue)' }}>
                                {s.orderId}
                              </td>
                              <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '13px', fontWeight: '500' }}>
                                {s.productName || `Item #${s.orderItemId}`}
                              </td>
                              <td style={{ fontWeight: '700' }}>₹{Number(s.grossAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
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
                                    <Check size={11} /> SETTLED
                                  </span>
                                ) : (
                                  <span className="badge" style={{ fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                    <Clock size={11} /> PENDING
                                  </span>
                                )}
                              </td>
                              <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {isRefunded ? 'Order Refunded' : isSettled ? (s.settledAt || s.createdAt || 'Settled') : 'Pending transfer'}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {isRefunded ? (
                                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <Ban size={12} /> Non-Payable (Refunded)
                                  </span>
                                ) : !isSettled ? (
                                  <button
                                    type="button"
                                    onClick={() => handleMarkSettled(s.id)}
                                    disabled={isSettlingId === s.id}
                                    className="btn btn-success"
                                    style={{ fontSize: '11px', padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                  >
                                    <Check size={12} /> {isSettlingId === s.id ? "Settling..." : "Mark Settled"}
                                  </button>
                                ) : (
                                  <span style={{ fontSize: '12px', color: 'var(--accent-emerald)', fontWeight: '600' }}>
                                    ✓ Disbursed
                                  </span>
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

          {/* TAB 6: PROMO COUPONS */}
          {activeTab === 'coupons' && (
            <div>
              <div className="flex-between" style={{ marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: '700', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Ticket size={22} style={{ color: 'var(--accent-teal)' }} /> Coupon & Promotion Manager
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Create and manage platform-wide promotional discounts.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    onClick={openAddCouponModal} 
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                  >
                    + Create Coupon
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { fetchCoupons(); fetchCouponAnalytics(); }} 
                    className="btn btn-secondary"
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 14px' }}
                  >
                    <RefreshCw size={13} /> Refresh List
                  </button>
                </div>
              </div>

              {/* Coupons List */}
              <div className="table-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                <table className="custom-table" style={{ fontSize: '13px' }}>
                  <thead>
                    <tr>
                      <th style={{ whiteSpace: 'nowrap' }}>Coupon Code</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Type</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Value</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Min Order</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Max Discount</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Campaign Dates</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Redemptions</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Total Discount</th>
                      <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                      <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.length === 0 ? (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                          No coupons found. Click "Create Coupon" to launch your first promotional campaign!
                        </td>
                      </tr>
                    ) : (
                      coupons.map((coupon) => {
                        const analytics = couponAnalytics.find(a => a.code === coupon.code) || { totalUses: 0, totalDiscount: 0, history: [] };
                        return (
                          <tr key={coupon.id}>
                            <td>
                              <strong style={{ color: 'var(--accent-teal)', fontSize: '14px', letterSpacing: '0.5px', fontFamily: 'var(--font-mono)' }}>
                                {coupon.code}
                              </strong>
                            </td>
                            <td>
                              <span className={`badge ${coupon.discountType === 'PERCENTAGE' ? 'badge-customer' : 'badge-vendor'}`} style={{ letterSpacing: '0.5px', fontSize: '10px' }}>
                                {coupon.discountType}
                              </span>
                            </td>
                            <td>
                              <strong style={{ fontSize: '14px' }}>
                                {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                              </strong>
                            </td>
                            <td>
                              {coupon.minOrderAmount ? `₹${coupon.minOrderAmount.toLocaleString('en-IN')}` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                            </td>
                            <td>
                              {coupon.maxDiscount ? `₹${coupon.maxDiscount.toLocaleString('en-IN')}` : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                            </td>
                            <td style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ color: 'var(--text-muted)', fontSize: '9px', fontWeight: 'bold', width: '36px' }}>START</span>
                                  <span>{coupon.startDate ? coupon.startDate.replace('T', ' ').substring(0, 16) : ''}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span style={{ color: 'var(--text-muted)', fontSize: '9px', fontWeight: 'bold', width: '36px' }}>EXPIRY</span>
                                  <span>{coupon.expiryDate ? coupon.expiryDate.replace('T', ' ').substring(0, 16) : ''}</span>
                                </div>
                              </div>
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>
                              <span style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{coupon.usageCount}</span>
                              {coupon.usageLimit ? (
                                <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}> / {coupon.usageLimit}</span>
                              ) : (
                                <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}> (No Limit)</span>
                              )}
                            </td>
                            <td style={{ color: 'var(--accent-emerald)', fontWeight: 'bold', fontSize: '14px', whiteSpace: 'nowrap' }}>
                              ₹{analytics.totalDiscount?.toLocaleString('en-IN') || '0'}
                            </td>
                            <td>
                              <button 
                                type="button"
                                onClick={() => handleToggleCoupon(coupon.id)}
                                className={`badge ${coupon.active ? 'badge-approved' : 'badge-rejected'}`}
                                style={{ border: 'none', cursor: 'pointer', transition: 'all 0.2s ease', outline: 'none' }}
                                title="Click to toggle status"
                              >
                                {coupon.active ? 'ACTIVE' : 'INACTIVE'}
                              </button>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                <button 
                                  type="button" 
                                  onClick={() => openEditCouponModal(coupon)} 
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '4px' }}
                                >
                                  Edit
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => handleDeleteCoupon(coupon.id)} 
                                  className="btn btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '11px', color: 'var(--accent-rose)', borderRadius: '4px' }}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Coupon Analytics & Performance Section */}
              <div style={{ marginTop: '30px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Campaign Performance & Redemption Ledger</h3>
                <div className="analytics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                  {couponAnalytics.filter(a => a.totalUses > 0).map((a) => (
                    <div key={a.code} className="analytics-card" style={{ padding: '16px' }}>
                      <div className="analytics-card-header" style={{ marginBottom: '10px' }}>
                        <span className="analytics-card-title" style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-teal)' }}>
                          {a.code} ({a.discountType})
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {a.totalUses} Uses
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Total Discount Granted:</span>
                        <strong style={{ color: 'var(--accent-emerald)' }}>₹{a.totalDiscount?.toLocaleString('en-IN')}</strong>
                      </div>
                      <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Recent Redemptions:</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                          {a.history.map((h, i) => (
                            <div key={i} style={{ fontSize: '10px', display: 'flex', justifyContent: 'space-between', background: 'var(--bg-input)', padding: '4px 6px', borderRadius: '4px' }}>
                              <span style={{ color: 'var(--text-muted)' }}>{h.userEmail || `User #${h.userId}`}</span>
                              <strong style={{ color: 'var(--text-primary)' }}>-₹{h.discountAmount}</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CUSTOMER REVIEWS & RATINGS */}
          {activeTab === 'reviews' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div className="flex-between" style={{ marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Star size={24} style={{ color: '#f59e0b' }} /> Customer Reviews & Ratings Hub
                  </h2>
                  <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
                    Comprehensive platform-wide audit of customer sentiment, post-fulfillment reviews, and dynamic product star ratings.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchAdminReviews}
                  disabled={isLoadingReviews}
                  className="btn btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <RefreshCw size={15} className={isLoadingReviews ? 'spin' : ''} />
                  <span>Refresh Reviews</span>
                </button>
              </div>

              {/* KPI Summary Cards */}
              <div className="metrics-grid" style={{ marginBottom: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                <div className="metric-card" style={{ borderLeft: '4px solid #f59e0b' }}>
                  <div className="metric-header">
                    <span className="metric-title">Average Platform Rating</span>
                    <Star size={18} style={{ color: '#f59e0b' }} />
                  </div>
                  <div className="metric-value" style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span>{reviewsData.averageRating?.toFixed(1) || '0.0'}</span>
                    <span style={{ fontSize: '14px', color: '#f59e0b', letterSpacing: '1px' }}>
                      {'★'.repeat(Math.round(reviewsData.averageRating || 0))}{'☆'.repeat(5 - Math.round(reviewsData.averageRating || 0))}
                    </span>
                  </div>
                  <span className="metric-trend" style={{ color: 'var(--text-muted)' }}>
                    Calculated across {reviewsData.totalReviews || 0} reviews
                  </span>
                </div>

                <div className="metric-card" style={{ borderLeft: '4px solid var(--accent-teal)' }}>
                  <div className="metric-header">
                    <span className="metric-title">Total Reviews Submitted</span>
                    <MessageSquare size={18} style={{ color: 'var(--accent-teal)' }} />
                  </div>
                  <div className="metric-value">{reviewsData.totalReviews || 0}</div>
                  <span className="metric-trend" style={{ color: 'var(--accent-teal)' }}>
                    Verified purchase feedback
                  </span>
                </div>

                <div className="metric-card" style={{ borderLeft: '4px solid var(--accent-emerald)' }}>
                  <div className="metric-header">
                    <span className="metric-title">Positive Sentiment (4★ & 5★)</span>
                    <ThumbsUp size={18} style={{ color: 'var(--accent-emerald)' }} />
                  </div>
                  <div className="metric-value" style={{ color: 'var(--accent-emerald)' }}>
                    {reviewsData.positiveCount || 0}
                    <span style={{ fontSize: '14px', marginLeft: '6px', fontWeight: '500', color: 'var(--text-muted)' }}>
                      ({reviewsData.totalReviews ? Math.round((reviewsData.positiveCount / reviewsData.totalReviews) * 100) : 0}%)
                    </span>
                  </div>
                  <span className="metric-trend" style={{ color: 'var(--accent-emerald)' }}>
                    Satisfied customer experiences
                  </span>
                </div>

                <div className="metric-card" style={{ borderLeft: '4px solid var(--accent-rose)' }}>
                  <div className="metric-header">
                    <span className="metric-title">Critical Attention (1★ & 2★)</span>
                    <AlertTriangle size={18} style={{ color: 'var(--accent-rose)' }} />
                  </div>
                  <div className="metric-value" style={{ color: 'var(--accent-rose)' }}>
                    {reviewsData.criticalCount || 0}
                  </div>
                  <span className="metric-trend" style={{ color: 'var(--text-muted)' }}>
                    Low rating escalation queue
                  </span>
                </div>
              </div>

              {/* Star Rating Distribution Progress Bars */}
              <div style={{
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid var(--border-color)',
                marginBottom: '24px'
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Rating Distribution Breakdown
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[5, 4, 3, 2, 1].map(stars => {
                    const count = reviewsData.breakdown ? (reviewsData.breakdown[stars.toString()] || 0) : 0;
                    const pct = reviewsData.totalReviews > 0 ? Math.round((count / reviewsData.totalReviews) * 100) : 0;
                    return (
                      <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px' }}>
                        <span style={{ width: '65px', color: 'var(--text-secondary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          {stars} Stars <span style={{ color: '#f59e0b' }}>★</span>
                        </span>
                        <div style={{ flex: 1, height: '8px', background: 'var(--bg-input)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${pct}%`,
                            height: '100%',
                            background: stars >= 4 ? 'var(--accent-emerald)' : stars === 3 ? '#f59e0b' : 'var(--accent-rose)',
                            borderRadius: '4px',
                            transition: 'width 0.4s ease'
                          }} />
                        </div>
                        <span style={{ width: '90px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '12px' }}>
                          {count} ({pct}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Toolbar: Search & Star Filters */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '18px',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--text-muted)', fontWeight: '600' }}>Filter Stars:</span>
                  {['ALL', '5', '4', '3', '2', '1'].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setReviewFilterRating(val)}
                      className={`btn ${reviewFilterRating === val ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        padding: '4px 12px',
                        fontSize: '12px',
                        borderRadius: '20px',
                        background: reviewFilterRating === val ? 'var(--accent-teal)' : 'var(--bg-secondary)',
                        color: reviewFilterRating === val ? '#fff' : 'var(--text-secondary)',
                        border: reviewFilterRating === val ? 'none' : '1px solid var(--border-color)'
                      }}
                    >
                      {val === 'ALL' ? 'All Ratings' : `${val} ★`}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative', width: '280px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search reviewer, product, comment..."
                    value={reviewSearchTerm}
                    onChange={(e) => setReviewSearchTerm(e.target.value)}
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '32px', height: '36px', fontSize: '12.5px', borderRadius: '8px' }}
                  />
                  {reviewSearchTerm && (
                    <button
                      type="button"
                      onClick={() => setReviewSearchTerm('')}
                      style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Reviews List */}
              {isLoadingReviews ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <RefreshCw size={24} className="spin" style={{ margin: '0 auto 12px auto' }} />
                  <p>Loading customer reviews...</p>
                </div>
              ) : (() => {
                const filteredReviews = (reviewsData.reviews || []).filter(r => {
                  if (reviewFilterRating !== 'ALL' && r.rating !== parseInt(reviewFilterRating)) {
                    return false;
                  }
                  if (reviewSearchTerm.trim()) {
                    const term = reviewSearchTerm.toLowerCase();
                    const rName = (r.reviewerName || '').toLowerCase();
                    const pName = (r.productName || '').toLowerCase();
                    const comment = (r.comment || '').toLowerCase();
                    if (!rName.includes(term) && !pName.includes(term) && !comment.includes(term)) {
                      return false;
                    }
                  }
                  return true;
                });

                if (filteredReviews.length === 0) {
                  return (
                    <div style={{
                      padding: '48px 20px',
                      textAlign: 'center',
                      background: 'var(--bg-secondary)',
                      borderRadius: '12px',
                      border: '1px dashed var(--border-color)'
                    }}>
                      <Star size={36} style={{ color: 'var(--text-muted)', margin: '0 auto 12px auto' }} />
                      <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: 'var(--text-primary)' }}>No Reviews Found</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                        {reviewSearchTerm || reviewFilterRating !== 'ALL' 
                          ? 'No customer reviews match your active filter criteria.' 
                          : 'No reviews have been submitted by customers yet.'}
                      </p>
                    </div>
                  );
                }

                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
                    {filteredReviews.map(r => (
                      <div
                        key={r.id}
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '12px',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                          position: 'relative'
                        }}
                      >
                        <div>
                          {/* Product Info Header */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>
                            {r.productImage ? (
                              <img
                                src={formatImageUrl(r.productImage)}
                                alt={r.productName}
                                style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                              />
                            ) : (
                              <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ProductIcon category={r.productCategory} size={20} />
                              </div>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {r.productName}
                              </h4>
                              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', display: 'flex', gap: '8px', marginTop: '2px' }}>
                                <span>Category: {r.productCategory || 'General'}</span>
                                {r.productPrice > 0 && <span>• ₹{Number(r.productPrice).toLocaleString('en-IN')}</span>}
                              </div>
                            </div>
                          </div>

                          {/* Reviewer & Rating */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div>
                              <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block' }}>
                                {r.reviewerName || 'Customer'}
                              </strong>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {r.date || 'Recent review'}
                              </span>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ color: '#f59e0b', fontSize: '15px', letterSpacing: '2px' }}>
                                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: '700', color: r.rating >= 4 ? 'var(--accent-emerald)' : r.rating === 3 ? '#f59e0b' : 'var(--accent-rose)' }}>
                                {r.rating}.0 / 5.0
                              </span>
                            </div>
                          </div>

                          {/* Comment Box */}
                          <div style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid var(--border-light)',
                            borderLeft: `3px solid ${r.rating >= 4 ? 'var(--accent-teal)' : r.rating === 3 ? '#f59e0b' : 'var(--accent-rose)'}`,
                            padding: '10px 12px',
                            borderRadius: '6px',
                            fontSize: '12.5px',
                            color: 'var(--text-secondary)',
                            fontStyle: 'italic',
                            lineHeight: '1.4',
                            marginTop: '8px',
                            wordBreak: 'break-word'
                          }}>
                            "{r.comment || 'No comment provided.'}"
                          </div>

                          {/* Customer Unboxing / Review Photo */}
                          {r.reviewImage && (
                            <div style={{ marginTop: '10px' }}>
                              <div 
                                onClick={() => setAdminReviewLightboxImg({ url: formatImageUrl(r.reviewImage), reviewer: r.reviewerName, product: r.productName })}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  background: 'var(--bg-input)',
                                  border: '1px solid var(--border-light)',
                                  borderRadius: '8px',
                                  padding: '6px 10px',
                                  cursor: 'pointer',
                                  transition: 'transform 0.15s ease'
                                }}
                                title="Click to view full customer unboxing photo"
                              >
                                <img 
                                  src={formatImageUrl(r.reviewImage)} 
                                  alt="Customer Review Photo" 
                                  style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }} 
                                />
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <Eye size={12} style={{ color: 'var(--accent-teal)' }} /> Customer Photo
                                  </span>
                                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Click to view</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Footer: Moderation Action */}
                        <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                            Review ID: #{r.id}
                          </span>
                          <button
                            type="button"
                            disabled={isDeletingReviewId === r.id}
                            onClick={() => handleDeleteCustomerReview(r.id)}
                            className="btn btn-secondary"
                            style={{
                              padding: '4px 10px',
                              fontSize: '11.5px',
                              color: 'var(--accent-rose)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              borderRadius: '6px'
                            }}
                          >
                            <Trash2 size={12} />
                            <span>{isDeletingReviewId === r.id ? 'Deleting...' : 'Moderate / Delete'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Admin Customer Review Photo Lightbox */}
          {adminReviewLightboxImg && (
            <div 
              className="image-lightbox-overlay" 
              style={{ zIndex: 99999 }}
              onClick={() => setAdminReviewLightboxImg(null)}
            >
              <div className="lightbox-header" onClick={(e) => e.stopPropagation()}>
                <div className="lightbox-title">
                  <Eye size={18} style={{ color: 'var(--accent-teal)' }} />
                  <span>Review Photo: {adminReviewLightboxImg.product}</span>
                  <span className="badge badge-customer" style={{ marginLeft: '6px', fontSize: '11px' }}>Uploaded by {adminReviewLightboxImg.reviewer || 'Customer'}</span>
                </div>
                <button 
                  type="button" 
                  className="lightbox-close-btn" 
                  onClick={() => setAdminReviewLightboxImg(null)}
                  title="Close Preview (Esc)"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="lightbox-main-stage" onClick={(e) => e.stopPropagation()}>
                <div className="lightbox-img-wrapper" style={{ maxHeight: '80vh', maxWidth: '85vw' }}>
                  <img 
                    src={adminReviewLightboxImg.url} 
                    alt="Customer Review Photo" 
                    style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* Coupon Create/Edit Modal */}
          {showCouponModal && (
            <div className="modal-overlay" onClick={() => setShowCouponModal(false)} style={{ zIndex: 3000 }}>
              <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div className="modal-header">
                  <h2 className="modal-title">{isEditingCoupon ? 'Edit Coupon Campaign' : 'Create Coupon Campaign'}</h2>
                  <button onClick={() => setShowCouponModal(false)} className="btn-icon-only">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleCreateOrCreateCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Coupon Code (e.g. SAVE20) *</label>
                    <input 
                      type="text" 
                      value={couponFormData.code}
                      onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                      className="form-input" 
                      placeholder="CODE" 
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Discount Type *</label>
                      <select 
                        value={couponFormData.discountType}
                        onChange={(e) => setCouponFormData({ ...couponFormData, discountType: e.target.value })}
                        className="form-input"
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Discount Value *</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={couponFormData.discountValue}
                        onChange={(e) => setCouponFormData({ ...couponFormData, discountValue: parseFloat(e.target.value) || 0 })}
                        className="form-input" 
                        min="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Min Order Amount (₹)</label>
                      <input 
                        type="number" 
                        value={couponFormData.minOrderAmount}
                        onChange={(e) => setCouponFormData({ ...couponFormData, minOrderAmount: e.target.value })}
                        className="form-input" 
                        placeholder="None"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Max Discount Cap (₹)</label>
                      <input 
                        type="number" 
                        value={couponFormData.maxDiscount}
                        onChange={(e) => setCouponFormData({ ...couponFormData, maxDiscount: e.target.value })}
                        className="form-input" 
                        placeholder="None"
                        disabled={couponFormData.discountType !== 'PERCENTAGE'}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Start Date *</label>
                      <input 
                        type="date" 
                        value={couponFormData.startDate}
                        onChange={(e) => setCouponFormData({ ...couponFormData, startDate: e.target.value })}
                        className="form-input" 
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Start Time *</label>
                      <input 
                        type="time" 
                        value={couponFormData.startTime}
                        onChange={(e) => setCouponFormData({ ...couponFormData, startTime: e.target.value })}
                        className="form-input" 
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '10px' }}>
                    <div className="form-group">
                      <label className="form-label">Expiry Date *</label>
                      <input 
                        type="date" 
                        value={couponFormData.expiryDate}
                        onChange={(e) => setCouponFormData({ ...couponFormData, expiryDate: e.target.value })}
                        className="form-input" 
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Expiry Time *</label>
                      <input 
                        type="time" 
                        value={couponFormData.expiryTime}
                        onChange={(e) => setCouponFormData({ ...couponFormData, expiryTime: e.target.value })}
                        className="form-input" 
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Usage Limit (Global Total Uses)</label>
                    <input 
                      type="number" 
                      value={couponFormData.usageLimit}
                      onChange={(e) => setCouponFormData({ ...couponFormData, usageLimit: e.target.value })}
                      className="form-input" 
                      placeholder="Unlimited"
                    />
                  </div>

                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <input 
                      type="checkbox" 
                      id="couponActive"
                      checked={couponFormData.active}
                      onChange={(e) => setCouponFormData({ ...couponFormData, active: e.target.checked })}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <label htmlFor="couponActive" style={{ fontSize: '13px', cursor: 'pointer', fontWeight: '500' }}>
                      Mark Campaign as Active
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button type="button" onClick={() => setShowCouponModal(false)} className="btn btn-secondary">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {isEditingCoupon ? 'Save Changes' : 'Launch Campaign'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Review Product Details Modal */}
      {showReviewModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <h2 className="modal-title">Review Product Submission</h2>
              <button onClick={() => setShowReviewModal(false)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1, paddingRight: '6px' }}>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div 
                  style={{ width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)', flexShrink: 0 }}
                >
                  {selectedProduct.imageUrl && formatImageUrl(selectedProduct.imageUrl).length > 4 ? (
                    <img src={formatImageUrl(selectedProduct.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <ProductIcon name={selectedProduct.name} category={selectedProduct.category} size={48} />
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>{selectedProduct.name}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Brand: <strong style={{ color: 'var(--text-primary)' }}>{selectedProduct.brand || 'N/A'}</strong></p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span className="badge badge-customer">{selectedProduct.category}</span>
                    <span className="badge badge-vendor" style={{ textTransform: 'none' }}>
                      Vendor #{selectedProduct.vendorId || 'SYSTEM'} {selectedProduct.vendorName ? `(${selectedProduct.vendorName})` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vendor Details */}
              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Store size={18} style={{ color: 'var(--accent-blue)' }} />
                  <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-primary)', margin: 0 }}>
                    Merchant / Vendor Details
                  </h4>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Vendor Name</span>
                    <div><strong style={{ color: 'var(--text-primary)' }}>{selectedProduct.vendorName || `Vendor #${selectedProduct.vendorId || 'SYSTEM'}`}</strong></div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600' }}>Vendor ID</span>
                    <div><strong style={{ color: 'var(--text-primary)' }}>#{selectedProduct.vendorId || 'N/A'}</strong></div>
                  </div>
                </div>
              </div>

              {/* Price, Discount and Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Regular Price</span>
                  <span style={{ fontSize: '16px', fontWeight: '700', color: selectedProduct.discountPercentage > 0 ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: selectedProduct.discountPercentage > 0 ? 'line-through' : 'none' }}>
                    ₹{Number(selectedProduct.price).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Final Price</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--accent-teal)' }}>
                    ₹{Number(selectedProduct.finalPrice || selectedProduct.price).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Initial Stock</span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>{selectedProduct.stock} units</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>Product Description</h4>
                <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '8px', fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.6', maxHeight: '150px', overflowY: 'auto' }}>
                  {selectedProduct.description || 'No description provided.'}
                </div>
              </div>

              {/* Reject Action Reason Input Section */}
              {showRejectionInput && (
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-rose)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Rejection Reason (Required)</label>
                  <textarea 
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide a clear reason for the vendor to correct..."
                    className="form-input"
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    required
                  />
                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowRejectionInput(false)} 
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Back
                    </button>
                    <button 
                      type="button" 
                      onClick={submitRejection} 
                      className="btn btn-danger"
                      style={{ padding: '6px 16px', fontSize: '12px' }}
                      disabled={!rejectionReason.trim()}
                    >
                      Confirm Rejection
                    </button>
                  </div>
                </div>
              )}
            </div>

            {!showRejectionInput && (
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowReviewModal(false)} className="btn btn-secondary">
                  Close
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowRejectionInput(true)} 
                    className="btn btn-danger"
                  >
                    <X size={16} /> Reject Listing
                  </button>
                  <button 
                    type="button" 
                    onClick={approveSelectedProduct} 
                    className="btn btn-success"
                  >
                    <Check size={16} /> Approve Listing
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Return Case Inspection Modal */}
      {selectedReturnCase && (
        <div className="modal-overlay" onClick={() => setSelectedReturnCase(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={20} style={{ color: 'var(--accent-teal)' }} />
                <h2 className="modal-title">Return Lifecycle Audit</h2>
              </div>
              <button onClick={() => setSelectedReturnCase(null)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                  <strong style={{ color: 'var(--accent-blue)', fontFamily: 'monospace' }}>{selectedReturnCase.orderId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Customer:</span>
                  <strong>{selectedReturnCase.recipientName || `User #${selectedReturnCase.userId || 'N/A'}`} ({selectedReturnCase.recipientPhone || 'No phone'})</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Return Reason Category:</span>
                  <span className="badge badge-customer">{selectedReturnCase.returnReasonCategory || 'DEFECTIVE'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Reason Stated:</span>
                  <strong>{selectedReturnCase.reason}</strong>
                </div>
                {selectedReturnCase.customerNotes && (
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '6px' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Customer Notes:</span>
                    <p style={{ margin: '2px 0 0 0', color: 'var(--text-secondary)' }}>{selectedReturnCase.customerNotes}</p>
                  </div>
                )}
                {selectedReturnCase.customerProofImage && (
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '6px' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', marginBottom: '4px' }}>Customer Proof Attachment:</span>
                    <img 
                      src={formatImageUrl(selectedReturnCase.customerProofImage)} 
                      alt="Customer Proof" 
                      style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '6px', border: '1px solid var(--border-light)', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
                {selectedReturnCase.adminNotes && (
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '6px' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Admin/QC Notes:</span>
                    <p style={{ margin: '2px 0 0 0', color: '#a78bfa' }}>{selectedReturnCase.adminNotes}</p>
                  </div>
                )}
                {selectedReturnCase.warehouseInspectionImage && (
                  <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '6px' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px', marginBottom: '4px' }}>Warehouse Inspection Image:</span>
                    <img 
                      src={formatImageUrl(selectedReturnCase.warehouseInspectionImage)} 
                      alt="Warehouse Inspection" 
                      style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '6px', border: '1px solid var(--border-light)', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '6px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Refund Amount:</span>
                  <strong style={{ color: 'var(--accent-emerald)', fontSize: '16px' }}>₹{selectedReturnCase.amount}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedReturnCase(null)} className="btn btn-secondary">
                  Close
                </button>
              </div>

              {selectedReturnCase.status === 'PENDING' && (
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)' }}>Return Request Action Console</h4>
                  
                  {selectedReturnCase.returnStage === 'REQUESTED' && (
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          handleAcceptReturnRequest(selectedReturnCase.id);
                          setSelectedReturnCase(null);
                        }}
                        disabled={isProcessingReturnAction}
                        className="btn btn-success"
                        style={{ fontSize: '12px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Check size={14} /> Accept Return
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleOpenRejectReturnModal(selectedReturnCase);
                          setSelectedReturnCase(null);
                        }}
                        disabled={isProcessingReturnAction}
                        className="btn btn-danger"
                        style={{ fontSize: '12px', padding: '6px 14px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                      >
                        <X size={14} /> Reject Return
                      </button>
                    </div>
                  )}

                  {selectedReturnCase.returnStage === 'QC_PASSED' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <p style={{ fontSize: '12px', color: 'var(--accent-emerald)', margin: 0, fontWeight: '600' }}>
                        ✓ Quality check has passed. You can now disburse the refund or choose other resolution strategy below:
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '11px', fontWeight: 'bold' }}>Resolution Strategy</label>
                          <select 
                            value={resolutionChoice}
                            onChange={(e) => setResolutionChoice(e.target.value)}
                            className="form-input"
                            style={{ height: '34px', fontSize: '12px' }}
                          >
                            <option value="REFUND">REFUND (Disburse money, void payout)</option>
                            <option value="REPLACEMENT">REPLACEMENT (Create zero-cost order)</option>
                            <option value="EXCHANGE">EXCHANGE (Create exchange order)</option>
                          </select>
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '11px', fontWeight: 'bold' }}>Observations / Notes</label>
                          <input 
                            type="text"
                            value={resolutionNotes}
                            onChange={(e) => setResolutionNotes(e.target.value)}
                            className="form-input"
                            style={{ height: '34px', fontSize: '12px' }}
                            placeholder="e.g. Approved after physical check."
                          />
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                        <button 
                          type="button" 
                          onClick={async () => {
                            setIsProcessingReturnAction(true);
                            try {
                              await axios.post(`http://localhost:8080/api/payment/refunds/${selectedReturnCase.id}/resolve`, {
                                resolution: resolutionChoice,
                                method: 'ORIGINAL_PAYMENT',
                                adminNotes: resolutionNotes
                              });
                              showFlash('success', `Return case resolved with strategy: ${resolutionChoice}!`);
                              setSelectedReturnCase(null);
                              fetchReturnRequests();
                            } catch (err) {
                              showFlash('error', err.response?.data || 'Failed to apply resolution.');
                            } finally {
                              setIsProcessingReturnAction(false);
                            }
                          }}
                          className="btn btn-success"
                          style={{ fontSize: '12px', padding: '6px 14px' }}
                        >
                          Apply Resolution
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedReturnCase.returnStage === 'QC_FAILED' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <p style={{ fontSize: '12px', color: 'var(--accent-rose)', margin: 0, fontWeight: '600' }}>
                        ⚠ Quality check has failed. Please reject the return request:
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            handleOpenRejectReturnModal(selectedReturnCase);
                            setSelectedReturnCase(null);
                          }}
                          disabled={isProcessingReturnAction}
                          className="btn btn-danger"
                          style={{ fontSize: '12px', padding: '6px 16px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <X size={14} /> Reject Return
                        </button>
                      </div>
                    </div>
                  )}

                  {(selectedReturnCase.returnStage === 'ADMIN_APPROVED' || selectedReturnCase.returnStage === 'ITEM_RETURNED') && (
                    <div style={{ padding: '8px 12px', background: 'var(--bg-input)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
                      {selectedReturnCase.returnStage === 'ADMIN_APPROVED' 
                        ? "Awaiting package pickup from customer address..." 
                        : "Return package received. Awaiting Quality Control (QC) inspection in warehouse..."}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Return Modal */}
      {targetRejectRefund && (
        <div className="modal-overlay" onClick={() => setTargetRejectRefund(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <X size={20} style={{ color: 'var(--accent-rose)' }} />
                <h2 className="modal-title">Reject Return Request</h2>
              </div>
              <button onClick={() => setTargetRejectRefund(null)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submitRejectReturn} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                <div>Order: <strong style={{ fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{targetRejectRefund.orderId}</strong></div>
                <div>Amount: <strong style={{ color: 'var(--accent-emerald)' }}>₹{targetRejectRefund.amount}</strong></div>
                <div>Customer Reason: <strong>{targetRejectRefund.reason}</strong></div>
              </div>

              <div className="form-group">
                <label className="form-label">Rejection Reason / Inspection Notes *</label>
                <textarea 
                  value={rejectReasonText}
                  onChange={(e) => setRejectReasonText(e.target.value)}
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="Explain why the return was rejected (e.g. Physical damage caused by customer, missing tags, return window expired)..."
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setTargetRejectRefund(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-danger" disabled={isProcessingReturnAction || !rejectReasonText.trim()}>
                  {isProcessingReturnAction ? "Processing..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Order Payment Inspection Modal */}
      {selectedOrderDetails && (
        <div className="modal-overlay" onClick={() => setSelectedOrderDetails(null)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={20} style={{ color: 'var(--accent-teal)' }} />
                <h2 className="modal-title">Live Payment & Order Status</h2>
              </div>
              <button onClick={() => setSelectedOrderDetails(null)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                  <strong style={{ fontFamily: 'monospace', color: 'var(--accent-blue)' }}>{selectedOrderDetails.orderId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                  <span className="badge badge-customer">{selectedOrderDetails.paymentMethod || 'RAZORPAY'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Status:</span>
                  <span className={`badge ${selectedOrderDetails.paymentStatus === 'PAID' ? 'badge-approved' : selectedOrderDetails.paymentStatus === 'FAILED' ? 'badge-rejected' : 'badge-pending'}`}>
                    {selectedOrderDetails.paymentStatus}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Fulfillment Status:</span>
                  <span className="order-status-badge">{selectedOrderDetails.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Razorpay Payment ID:</span>
                  <code style={{ color: 'var(--accent-teal)' }}>{selectedOrderDetails.razorpayPaymentId || 'N/A'}</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                  <strong style={{ color: 'var(--accent-emerald)', fontSize: '15px' }}>₹{selectedOrderDetails.totalAmount}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setSelectedOrderDetails(null)} className="btn btn-secondary">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Direct Refund Modal */}
      {showRefundModal && refundTargetOrder && (
        <div className="modal-overlay" onClick={() => setShowRefundModal(false)}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <RotateCcw size={20} style={{ color: '#a78bfa' }} />
                <h2 className="modal-title">Administrative Direct Refund</h2>
              </div>
              <button onClick={() => setShowRefundModal(false)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleProcessRefund} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ background: 'var(--bg-input)', padding: '14px', borderRadius: '8px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Order ID:</span>
                  <strong style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>{refundTargetOrder.orderId}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Original Amount:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>₹{refundTargetOrder.totalAmount}</strong>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Refund Amount (₹) *</label>
                <input 
                  type="number"
                  step="0.01"
                  min="1"
                  max={refundTargetOrder.refundableBalance !== undefined ? refundTargetOrder.refundableBalance : refundTargetOrder.totalAmount}
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="form-input"
                  placeholder="Enter amount to refund"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Administrative Reason *</label>
                <textarea 
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="form-input"
                  style={{ minHeight: '70px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowRefundModal(false)} 
                  className="btn btn-secondary"
                  disabled={isProcessingRefund}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#fff' }}
                  disabled={isProcessingRefund || !refundAmount}
                >
                  {isProcessingRefund ? "Executing Razorpay Refund..." : "Authorize Direct Refund"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Profile & Products Inspection Modal */}
      {selectedVendorDetail && (
        <div className="modal-overlay" onClick={() => { setSelectedVendorDetail(null); setInspectingProductDetail(null); }}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            {/* Modal Header */}
            <div className="modal-header" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ background: 'rgba(20, 184, 166, 0.1)', color: 'var(--accent-teal)', padding: '8px', borderRadius: '8px' }}>
                  <Store size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 className="modal-title" style={{ margin: 0 }}>{selectedVendorDetail.fullName}</h2>
                    <span className="badge badge-vendor" style={{ fontWeight: 'bold' }}>{selectedVendorDetail.vendorCode || `ID #${selectedVendorDetail.id}`}</span>
                    <span className="badge badge-approved" style={{ fontSize: '10px' }}>ACTIVE MERCHANT</span>
                  </div>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {selectedVendorDetail.email} • {selectedVendorDetail.phone || 'No phone'}
                  </p>
                </div>
              </div>
              <button onClick={() => { setSelectedVendorDetail(null); setInspectingProductDetail(null); }} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs inside Modal */}
            <div style={{ display: 'flex', gap: '8px', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
              <button
                type="button"
                onClick={() => setVendorDetailTab('products')}
                className={`btn ${vendorDetailTab === 'products' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Package size={14} /> Catalog Products ({vendorProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setVendorDetailTab('overview')}
                className={`btn ${vendorDetailTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '12px', padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Store size={14} /> Merchant Overview & Financials
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {vendorDetailTab === 'products' && (
                <div>
                  <div className="flex-between" style={{ marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                        Products Listed by {selectedVendorDetail.fullName}
                      </h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                        Inspect product specifications, stock levels, approval statuses, or delete inappropriate items as administrator.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchVendorProducts(selectedVendorDetail.id)}
                      className="btn btn-secondary"
                      style={{ fontSize: '11px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <RefreshCw size={12} className={isLoadingVendorProducts ? "spin-animation" : ""} /> Refresh Items
                    </button>
                  </div>

                  {isLoadingVendorProducts ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      <RefreshCw size={24} className="spin-animation" style={{ margin: '0 auto 8px auto' }} />
                      <p style={{ fontSize: '13px' }}>Loading vendor products...</p>
                    </div>
                  ) : vendorProducts.length === 0 ? (
                    <div className="cart-empty-state" style={{ background: 'var(--bg-input)', borderRadius: '8px', padding: '30px' }}>
                      <Package className="cart-empty-icon" style={{ opacity: 0.2, width: '40px', height: '40px' }} />
                      <p style={{ margin: 0, fontSize: '13px' }}>This vendor has not listed any catalog products yet.</p>
                    </div>
                  ) : (
                    <div className="table-container">
                      <table className="custom-table" style={{ fontSize: '12px' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '40px' }}>Icon</th>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Regular Price</th>
                            <th>Final Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th style={{ textAlign: 'center', width: '130px' }}>Admin Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendorProducts.map((prod) => {
                            const disc = Number(prod.discountPercentage) || 0;
                            const finalP = prod.finalPrice != null ? prod.finalPrice : (disc > 0 ? Math.round(prod.price * (1 - disc / 100) * 100) / 100 : prod.price);
                            return (
                              <tr key={prod.id}>
                                <td>
                                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)' }}>
                                    {prod.imageUrl && formatImageUrl(prod.imageUrl).length > 4 ? (
                                      <img src={formatImageUrl(prod.imageUrl)} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                      <ProductIcon name={prod.name} category={prod.category} size={16} />
                                    )}
                                  </div>
                                </td>
                                <td>
                                  <strong style={{ color: 'var(--text-primary)', display: 'block' }}>{prod.name}</strong>
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{prod.brand || 'No brand'}</span>
                                </td>
                                <td>
                                  <span className="badge badge-customer" style={{ fontSize: '10px', padding: '2px 6px' }}>{prod.category}</span>
                                </td>
                                <td>
                                  {disc > 0 ? (
                                    <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '11px' }}>
                                      ₹{Number(prod.price).toLocaleString('en-IN')}
                                    </span>
                                  ) : (
                                    <span>₹{Number(prod.price).toLocaleString('en-IN')}</span>
                                  )}
                                </td>
                                <td>
                                  <strong style={{ color: 'var(--accent-teal)', fontSize: '13px' }}>
                                    ₹{Number(finalP).toLocaleString('en-IN')}
                                  </strong>
                                  {disc > 0 && (
                                    <span className="badge badge-rejected" style={{ marginLeft: '4px', fontSize: '9px', padding: '1px 4px' }}>
                                      {disc}% OFF
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <span style={{ fontWeight: '700', color: prod.stock <= 0 ? '#ef4444' : prod.stock < 5 ? '#f59e0b' : '#10b981' }}>
                                    {prod.stock} units
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge ${
                                    prod.status === 'APPROVED' ? 'badge-approved' : 
                                    prod.status === 'REJECTED' ? 'badge-rejected' : 
                                    prod.status === 'DISABLED' ? 'badge-pending' : 'badge-pending'
                                  }`} style={{ 
                                    fontSize: '10px', 
                                    padding: '2px 6px', 
                                    fontWeight: '700',
                                    ...(prod.status === 'DISABLED' ? { background: 'rgba(148, 163, 184, 0.15)', color: '#64748b', border: '1px solid rgba(148, 163, 184, 0.3)' } : {})
                                  }}>
                                    {prod.status === 'APPROVED' ? 'APPROVED' : 
                                     prod.status === 'REJECTED' ? 'REJECTED' : 
                                     prod.status === 'DISABLED' ? 'DISABLED' : 'PENDING'}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', alignItems: 'center' }}>
                                    <button
                                      type="button"
                                      onClick={() => setInspectingProductDetail(prod)}
                                      className="btn btn-secondary"
                                      title="Inspect Product Details"
                                      style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px' }}
                                    >
                                      <Eye size={12} /> Inspect
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleAdminDeleteProduct(prod.id, prod.name)}
                                      className="btn btn-danger"
                                      title="Permanently Delete Product (Admin Override)"
                                      style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                                    >
                                      <Trash2 size={12} /> Delete
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

              {vendorDetailTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Vendor Legal Name:</span>
                      <strong>{selectedVendorDetail.fullName}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Email Address:</span>
                      <strong>{selectedVendorDetail.email}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Contact Phone:</span>
                      <strong>{selectedVendorDetail.phone || 'N/A'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Vendor System Code:</span>
                      <span className="badge badge-vendor" style={{ fontWeight: 'bold' }}>{selectedVendorDetail.vendorCode || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Merchant Status:</span>
                      <span className="badge badge-approved">ACTIVE MERCHANT</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Marketplace Platform Commission:</span>
                      <strong style={{ color: 'var(--text-primary)' }}>10.0% (Fixed)</strong>
                    </div>
                  </div>

                  <div style={{ background: 'var(--bg-input)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total Listed Products:</span>
                      <strong>{selectedVendorDetail.totalProducts} items</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '8px', marginTop: '4px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Cumulative Gross Sales:</span>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>₹{selectedVendorDetail.grossSales?.toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Platform Commission (10%):</span>
                      <strong style={{ color: 'var(--accent-rose)' }}>-₹{selectedVendorDetail.commissionPaid?.toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-light)', paddingTop: '8px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Vendor Net Earnings Payout:</span>
                      <strong style={{ color: 'var(--accent-emerald)', fontSize: '15px' }}>₹{selectedVendorDetail.netPayout?.toLocaleString('en-IN')}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Pending Settlement Records:</span>
                      <strong style={{ color: '#f59e0b' }}>{selectedVendorDetail.pendingPayoutsCount} records</strong>
                    </div>
                  </div>

                  {selectedVendorDetail.address && (
                    <div>
                      <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px', fontSize: '12px' }}>Registered Warehouse Facility Address:</span>
                      <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', color: 'var(--text-secondary)', lineHeight: '1.4', fontSize: '13px' }}>
                        {selectedVendorDetail.address}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
              <button type="button" onClick={() => { setSelectedVendorDetail(null); setInspectingProductDetail(null); }} className="btn btn-secondary">
                Close Console
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Inspect Specific Vendor Product Modal */}
      {inspectingProductDetail && (
        <div className="modal-overlay" onClick={() => setInspectingProductDetail(null)} style={{ zIndex: 3500 }}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={20} style={{ color: 'var(--accent-teal)' }} />
                <h2 className="modal-title">Product Inspection (Vendor #{inspectingProductDetail.vendorId})</h2>
              </div>
              <button onClick={() => setInspectingProductDetail(null)} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1, paddingRight: '4px' }}>
              {/* Product Header & Images */}
              <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start' }}>
                <div style={{ width: '130px', height: '130px', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)', flexShrink: 0 }}>
                  {inspectingProductDetail.imageUrl && formatImageUrl(inspectingProductDetail.imageUrl).length > 4 ? (
                    <img src={formatImageUrl(inspectingProductDetail.imageUrl)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <ProductIcon name={inspectingProductDetail.name} category={inspectingProductDetail.category} size={48} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '17px', fontWeight: '800', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>
                    {inspectingProductDetail.name}
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Brand: <strong style={{ color: 'var(--text-primary)' }}>{inspectingProductDetail.brand || 'Generic / Unbranded'}</strong>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="badge badge-customer">{inspectingProductDetail.category}</span>
                    <span className={`badge ${
                      inspectingProductDetail.status === 'APPROVED' ? 'badge-approved' : 
                      inspectingProductDetail.status === 'REJECTED' ? 'badge-rejected' : 
                      inspectingProductDetail.status === 'DISABLED' ? 'badge-pending' : 'badge-pending'
                    }`} style={{ 
                      fontWeight: '700',
                      ...(inspectingProductDetail.status === 'DISABLED' ? { background: 'rgba(148, 163, 184, 0.15)', color: '#64748b', border: '1px solid rgba(148, 163, 184, 0.3)' } : {})
                    }}>
                      Status: {inspectingProductDetail.status}
                    </span>
                    <span className="badge badge-vendor">
                      Vendor ID #{inspectingProductDetail.vendorId}
                    </span>
                  </div>
                </div>
              </div>

              {/* Gallery Images if multiple */}
              {inspectingProductDetail.images && inspectingProductDetail.images.length > 0 && (
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Product Gallery ({inspectingProductDetail.images.length})</span>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                    {inspectingProductDetail.images.map((img, idx) => (
                      <img 
                        key={idx} 
                        src={formatImageUrl(img)} 
                        alt={`Gallery ${idx}`} 
                        style={{ width: '60px', height: '60px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--border-light)' }} 
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing & Stock Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', background: 'var(--bg-input)', padding: '12px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Regular Price</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', textDecoration: inspectingProductDetail.discountPercentage > 0 ? 'line-through' : 'none', color: inspectingProductDetail.discountPercentage > 0 ? 'var(--text-muted)' : 'inherit' }}>
                    ₹{Number(inspectingProductDetail.price).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Discount</span>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#ef4444' }}>
                    {inspectingProductDetail.discountPercentage || 0}% OFF
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Customer Price</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: 'var(--accent-teal)' }}>
                    ₹{Number(inspectingProductDetail.finalPrice || inspectingProductDetail.price).toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Inventory Stock</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: inspectingProductDetail.stock <= 0 ? '#ef4444' : '#10b981' }}>
                    {inspectingProductDetail.stock} units
                  </span>
                </div>
              </div>

              {/* Return Policy & Coupons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px' }}>
                <div style={{ background: 'var(--bg-input)', padding: '10px 12px', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Return Policy:</span>
                  <strong>{inspectingProductDetail.returnPolicy || '7_DAYS'}</strong>
                </div>
                <div style={{ background: 'var(--bg-input)', padding: '10px 12px', borderRadius: '6px' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Platform Promo Coupons:</span>
                  <strong style={{ color: inspectingProductDetail.couponsEnabled !== false ? '#10b981' : '#ef4444' }}>
                    {inspectingProductDetail.couponsEnabled !== false ? 'Eligible' : 'Disabled'}
                  </strong>
                </div>
              </div>

              {/* Description */}
              <div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Description</span>
                <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', maxHeight: '100px', overflowY: 'auto' }}>
                  {inspectingProductDetail.description || 'No description provided by vendor.'}
                </div>
              </div>
            </div>

            {/* Modal Footer with Delete Permission */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', marginTop: '12px', borderTop: '1px solid var(--border-light)' }}>
              <button
                type="button"
                onClick={() => handleAdminDeleteProduct(inspectingProductDetail.id, inspectingProductDetail.name)}
                className="btn btn-danger"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: '#fff', padding: '8px 16px', fontSize: '12px', fontWeight: '700' }}
              >
                <Trash2 size={14} /> Delete Product Permanently
              </button>

              <button
                type="button"
                onClick={() => setInspectingProductDetail(null)}
                className="btn btn-secondary"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Warehouse Modal */}
      {(showAddWhAdminModal || showEditWhAdminModal) && (
        <div className="modal-overlay" onClick={() => { setShowAddWhAdminModal(false); setShowEditWhAdminModal(false); }}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Store size={20} style={{ color: 'var(--accent-teal)' }} />
                <h2 className="modal-title">{adminWhForm.id ? "Edit Warehouse Facility" : "Register New Warehouse"}</h2>
              </div>
              <button onClick={() => { setShowAddWhAdminModal(false); setShowEditWhAdminModal(false); }} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAdminWarehouse} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
              <div className="form-group">
                <label className="form-label">Warehouse Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai Central Fulfillment Center"
                  value={adminWhForm.name}
                  onChange={(e) => setAdminWhForm({ ...adminWhForm, name: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse Code *</label>
                <input
                  type="text"
                  placeholder="e.g. WH-MUM-01"
                  value={adminWhForm.code}
                  onChange={(e) => setAdminWhForm({ ...adminWhForm, code: e.target.value.toUpperCase() })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai"
                  value={adminWhForm.city}
                  onChange={(e) => setAdminWhForm({ ...adminWhForm, city: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Street Address *</label>
                <textarea
                  placeholder="e.g. Plot 45, Kurla Industrial Estate, Mumbai - 400070"
                  value={adminWhForm.address}
                  onChange={(e) => setAdminWhForm({ ...adminWhForm, address: e.target.value })}
                  className="form-input"
                  style={{ minHeight: '60px', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setShowAddWhAdminModal(false); setShowEditWhAdminModal(false); }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {adminWhForm.id ? "Update Facility" : "Register Facility"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: DISTRIBUTE VENDOR STOCK TO REGIONAL WAREHOUSES */}
      {showCreateTransferAdminModal && (() => {
        const selectedProd = allProductsList.find(p => String(p.id) === String(adminTransferForm.productId)) ||
          warehouseInventories.find(i => String(i.productId) === String(adminTransferForm.productId));
        const totalDistAcrossWhs = Object.values(adminTransferForm.distributions || {}).reduce((sum, v) => sum + (parseInt(v) || 0), 0);
        const listedStock = selectedProd ? (selectedProd.stock !== undefined ? selectedProd.stock : selectedProd.quantity) : 0;

        const applySplitPreset = (type) => {
          const activeWhs = warehousesList.filter(w => w.active);
          const newDists = {};
          const total = listedStock > 0 ? listedStock : 100;
          if (type === 'EQUAL') {
            const perWh = Math.floor(total / (activeWhs.length || 1));
            activeWhs.forEach((w, idx) => {
              newDists[w.id] = idx === 0 ? perWh + (total % (activeWhs.length || 1)) : perWh;
            });
          } else if (type === 'WEIGHTED') {
            // 40% Kolkata, 30% Mumbai, 20% Delhi, 10% Bangalore
            const weights = [0.40, 0.30, 0.20, 0.10];
            activeWhs.forEach((w, idx) => {
              const weight = weights[idx % weights.length];
              newDists[w.id] = Math.round(total * weight);
            });
          } else if (type === 'CLEAR') {
            activeWhs.forEach(w => { newDists[w.id] = 0; });
          }
          setAdminTransferForm(prev => ({ ...prev, distributions: newDists }));
        };

        return (
          <div className="modal-overlay" onClick={() => setShowCreateTransferAdminModal(false)}>
            <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px', display: 'flex', flexDirection: 'column', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="modal-header">
                <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px' }}>
                  <ArrowRightLeft size={20} style={{ color: 'var(--accent-indigo)' }} />
                  Distribute Vendor Stock to Warehouses
                </h2>
                <button onClick={() => setShowCreateTransferAdminModal(false)} className="btn-icon-only"><X size={18} /></button>
              </div>

              <form onSubmit={handleCreateAdminStockTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '8px 0' }}>
                <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(20, 184, 166, 0.08) 100%)', border: '1px solid rgba(99, 102, 241, 0.25)', padding: '12px 16px', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  ⚡ <strong>Vendor Ownership & Admin Distribution:</strong> All product stock listed by vendors in the catalog is distributed and allocated by Admin across regional fulfillment centers (Kolkata, Mumbai, Delhi, Bangalore).
                </div>

                {/* Source Origin Info Card */}
                <div style={{ background: 'var(--bg-input)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SOURCE ORIGIN</div>
                      <div style={{ fontWeight: '800', fontSize: '14px', color: 'var(--accent-indigo)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        🏷️ {selectedProd?.vendorName || 'Vendor Listed Stock'} (Vendor Origin)
                      </div>
                    </div>
                    <span className="badge badge-vendor" style={{ fontSize: '11px', padding: '3px 8px' }}>
                      Vendor Catalog Stock
                    </span>
                  </div>
                </div>

                {/* Select Product SKU */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: '700' }}>Select Product SKU Listed by Vendor *</label>
                  <select
                    value={adminTransferForm.productId}
                    onChange={(e) => {
                      const pId = e.target.value;
                      const activeWhs = warehousesList.filter(w => w.active);
                      const initialDist = {};
                      activeWhs.forEach(w => {
                        const existingInv = warehouseInventories.find(i => String(i.productId) === String(pId) && (String(i.warehouseId) === String(w.id) || (i.warehouse && String(i.warehouse.id) === String(w.id))));
                        initialDist[w.id] = existingInv ? existingInv.quantity : 10;
                      });
                      setAdminTransferForm(prev => ({
                        ...prev,
                        productId: pId,
                        distributions: initialDist
                      }));
                    }}
                    className="form-select"
                    required
                  >
                    <option value="">-- Select Product Listed by Vendor --</option>
                    {(allProductsList.length > 0 ? allProductsList : warehouseInventories).map(p => {
                      const pId = p.id || p.productId;
                      const pName = p.name || p.productName;
                      const pStock = p.stock !== undefined ? p.stock : (p.quantity || 0);
                      const vName = p.vendorName || 'Vendor';
                      return (
                        <option key={pId} value={pId}>
                          {pName} (SKU #{pId} • Listed Stock: {pStock} units • Vendor: {vName})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Product Summary Details */}
                {selectedProd && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '10px 14px', fontSize: '12px' }}>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Vendor Listed Stock</div>
                      <strong style={{ fontSize: '15px', color: 'var(--accent-teal)' }}>{listedStock} units</strong>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Unit Price</div>
                      <strong style={{ fontSize: '15px' }}>₹{selectedProd.price || 0}</strong>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Vendor Partner</div>
                      <strong style={{ fontSize: '13px', color: 'var(--accent-indigo)' }}>{selectedProd.vendorName || 'Vendor'}</strong>
                    </div>
                  </div>
                )}

                {/* Distribution Mode Switcher */}
                <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-input)', padding: '4px', borderRadius: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setAdminTransferForm(prev => ({ ...prev, destinationWarehouseId: 'ALL' }))}
                    className={`btn ${adminTransferForm.destinationWarehouseId === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, fontSize: '12px', padding: '6px 12px' }}
                  >
                    🏢 Distribute Across All Regional Hubs
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminTransferForm(prev => ({ ...prev, destinationWarehouseId: warehousesList[0]?.id ? String(warehousesList[0].id) : '' }))}
                    className={`btn ${adminTransferForm.destinationWarehouseId !== 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: 1, fontSize: '12px', padding: '6px 12px' }}
                  >
                    📍 Allocate to Single Warehouse
                  </button>
                </div>

                {/* MODE A: MULTI-WAREHOUSE REGIONAL DISTRIBUTION */}
                {adminTransferForm.destinationWarehouseId === 'ALL' ? (
                  <div>
                    <div className="flex-between" style={{ marginBottom: '8px', alignItems: 'center' }}>
                      <label className="form-label" style={{ fontWeight: '700', margin: 0 }}>
                        Allocate Units to Regional Warehouses:
                      </label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button type="button" onClick={() => applySplitPreset('WEIGHTED')} className="btn btn-secondary" style={{ fontSize: '10px', padding: '3px 8px' }}>
                          ⚡ 40/30/20/10 Split
                        </button>
                        <button type="button" onClick={() => applySplitPreset('EQUAL')} className="btn btn-secondary" style={{ fontSize: '10px', padding: '3px 8px' }}>
                          ⚡ Equal Split
                        </button>
                        <button type="button" onClick={() => applySplitPreset('CLEAR')} className="btn btn-secondary" style={{ fontSize: '10px', padding: '3px 8px' }}>
                          Clear
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                      {warehousesList.filter(w => w.active).map(w => {
                        const existingInv = warehouseInventories.find(i => String(i.productId) === String(adminTransferForm.productId) && (String(i.warehouseId) === String(w.id) || (i.warehouse && String(i.warehouse.id) === String(w.id))));
                        const currentInHub = existingInv ? existingInv.quantity : 0;
                        const val = adminTransferForm.distributions[w.id] !== undefined ? adminTransferForm.distributions[w.id] : 0;

                        return (
                          <div key={w.id} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '8px', padding: '10px 12px' }}>
                            <div style={{ fontWeight: '700', fontSize: '12px' }}>{w.name}</div>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                              Code: {w.code} • In Hub: <strong>{currentInHub} units</strong>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Allocate:</span>
                              <input
                                type="number"
                                min="0"
                                value={val}
                                onChange={(e) => {
                                  const qty = parseInt(e.target.value) || 0;
                                  setAdminTransferForm(prev => ({
                                    ...prev,
                                    distributions: {
                                      ...prev.distributions,
                                      [w.id]: qty
                                    }
                                  }));
                                }}
                                className="form-input"
                                style={{ fontSize: '14px', fontWeight: '800', padding: '4px 8px', textAlign: 'right' }}
                              />
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>units</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Total Summary */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(99, 102, 241, 0.08)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                      <span style={{ fontSize: '12px', fontWeight: '700' }}>Total Units to Distribute:</span>
                      <strong style={{ fontSize: '16px', color: 'var(--accent-indigo)' }}>
                        {totalDistAcrossWhs} units {listedStock > 0 && `(Vendor Listed: ${listedStock} units)`}
                      </strong>
                    </div>
                  </div>
                ) : (
                  /* MODE B: SINGLE WAREHOUSE ALLOCATION */
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: '700' }}>Destination Warehouse *</label>
                      <select
                        value={adminTransferForm.destinationWarehouseId}
                        onChange={(e) => setAdminTransferForm(prev => ({ ...prev, destinationWarehouseId: e.target.value }))}
                        className="form-select"
                        required
                      >
                        <option value="">-- Select Destination Hub --</option>
                        {warehousesList.filter(w => w.active).map(w => (
                          <option key={w.id} value={w.id}>{w.name} ({w.code})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: '700' }}>Units to Allocate *</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={adminTransferForm.quantity}
                        onChange={(e) => setAdminTransferForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        className="form-input"
                        style={{ fontSize: '16px', fontWeight: '800' }}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Distribution Reason / Purpose</label>
                  <select
                    value={adminTransferForm.transferReason}
                    onChange={(e) => setAdminTransferForm(prev => ({ ...prev, transferReason: e.target.value }))}
                    className="form-select"
                  >
                    <option value="VENDOR_STOCK_DISTRIBUTION">Vendor Listed Stock Initial Distribution</option>
                    <option value="REGIONAL_REBALANCE">Regional Stock Rebalancing & Buffer Allocation</option>
                    <option value="LOW_STOCK_REPLENISHMENT">Low Stock Replenishment</option>
                    <option value="PROMOTIONAL_DEMAND">High Customer Demand Anticipation</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Administrative Notes</label>
                  <textarea
                    rows="2"
                    placeholder="e.g. Approved vendor catalog stock distribution across regional hubs."
                    value={adminTransferForm.notes}
                    onChange={(e) => setAdminTransferForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="form-input"
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button type="button" onClick={() => setShowCreateTransferAdminModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmittingTransfer} className="btn btn-primary" style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <ArrowRightLeft size={16} />
                    {isSubmittingTransfer ? 'Distributing Stock...' : '⚡ Distribute & Allocate Stock to Warehouses'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
