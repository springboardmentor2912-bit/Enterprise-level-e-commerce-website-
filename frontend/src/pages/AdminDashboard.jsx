import React, { useState, useEffect, useMemo } from 'react';
import { adminApi, categoryApi, vendorApi, commissionApi, couponApi } from '../api';
import { getErrorMessage } from '../api/axios';
import {
  ShieldCheck, Store, Users, Package, Check, X, PlusCircle, DollarSign,
  ShoppingBag, Lock, Unlock, TrendingUp, BarChart3, Activity,
  FileText, Download, Printer, Search, Filter, Clock, AlertTriangle,
  CheckCircle, Eye, RefreshCw, Sliders, CreditCard, Cpu, Database,
  Server, Star, ArrowUpRight, ChevronRight, Layers, HelpCircle,
  Calculator, Percent, PlayCircle, Zap, Tag, Sparkles, Gift, Edit2, Trash2
} from 'lucide-react';
import WarehouseManagementTab from '../components/warehouse/WarehouseManagementTab';

const AdminDashboard = () => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  // 'OVERVIEW' | 'VENDORS' | 'ANALYTICS' | 'ORDERS' | 'COMMISSIONS' | 'COUPONS' | 'SYSTEM' | 'REPORTS' | 'USERS' | 'TAXONOMY'

  // Global State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  // Vendor Management State
  const [vendors, setVendors] = useState([]);
  const [selectedVendorForModal, setSelectedVendorForModal] = useState(null);
  const [newCommissionRate, setNewCommissionRate] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');

  // Analytics State
  const [analyticsRange, setAnalyticsRange] = useState('30D');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [hoveredTrendIndex, setHoveredTrendIndex] = useState(null);

  // Orders State
  const [orders, setOrders] = useState([]);
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [orderUpdatingId, setOrderUpdatingId] = useState(null);

  // Commission State
  const [commissionSummary, setCommissionSummary] = useState(null);
  const [commissionRecords, setCommissionRecords] = useState([]);
  const [commissionFilterVendor, setCommissionFilterVendor] = useState('ALL');
  const [commissionFilterStatus, setCommissionFilterStatus] = useState('ALL');
  const [simOrderAmount, setSimOrderAmount] = useState('10000');
  const [simCommissionRate, setSimCommissionRate] = useState('10');
  const [simVendorId, setSimVendorId] = useState('');
  const [simResult, setSimResult] = useState({
    orderAmount: 10000.0,
    commissionRate: 10.0,
    commissionAmount: 1000.0,
    vendorAmount: 9000.0,
    formulaExplanation: 'Order Amount (₹10000.00) × Rate (10.00%) = Platform Cut: ₹1000.00 | Vendor Net: ₹9000.00'
  });
  const [simLoading, setSimLoading] = useState(false);

  // Coupon Engine State
  const [coupons, setCoupons] = useState([]);
  const [couponAnalytics, setCouponAnalytics] = useState(null);
  const [couponUsages, setCouponUsages] = useState([]);
  const [couponSearch, setCouponSearch] = useState('');
  const [couponFilterStatus, setCouponFilterStatus] = useState('ALL');
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    minOrderAmount: 1000,
    maxDiscountAmount: 1000,
    startDate: '',
    expiryDate: '',
    usageLimit: 500,
    userUsageLimit: 1,
    active: true
  });
  const [couponSubmitting, setCouponSubmitting] = useState(false);

  // Business Reports State
  const [reportType, setReportType] = useState('SALES');
  const [reportRange, setReportRange] = useState('30D');
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Users & Taxonomy State
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load Main Data
  const loadDashboardData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [statsRes, vRes, uRes, cRes] = await Promise.all([
        adminApi.getStats().catch(() => null),
        adminApi.getVendorsWithMetrics().catch(() => ({ data: [] })),
        adminApi.getUsers().catch(() => ({ data: [] })),
        categoryApi.getAll().catch(() => ({ data: [] })),
      ]);

      if (statsRes?.data) setStats(statsRes.data);
      setVendors(vRes.data || []);
      setUsers(uRes.data || []);
      setCategories(cRes.data || []);
    } catch (err) {
      console.error('Error loading admin portal data:', err);
      showToast('Failed to sync portal data with backend database.', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Load Analytics when Tab or Range Changes
  const loadAnalytics = async (range = analyticsRange) => {
    setAnalyticsLoading(true);
    try {
      const res = await adminApi.getAnalytics(range);
      setAnalyticsData(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'ANALYTICS' || activeTab === 'OVERVIEW') {
      loadAnalytics(analyticsRange);
    }
  }, [activeTab, analyticsRange]);

  // Load Orders when Orders Tab is Active
  const loadOrders = async () => {
    try {
      const params = {};
      if (orderSearch) params.search = orderSearch;
      if (orderStatusFilter !== 'ALL') params.status = orderStatusFilter;
      const res = await adminApi.getAllOrders(params);
      setOrders(res.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'ORDERS' || activeTab === 'OVERVIEW') {
      loadOrders();
    }
  }, [activeTab, orderStatusFilter]);

  // Load Commission Summary & Audit Records
  const loadCommissions = async () => {
    try {
      const [sumRes, recsRes] = await Promise.all([
        commissionApi.getSummary().catch(() => adminApi.getCommissionSummary()),
        commissionApi.getAll({
          vendorId: commissionFilterVendor !== 'ALL' ? commissionFilterVendor : undefined,
          status: commissionFilterStatus !== 'ALL' ? commissionFilterStatus : undefined,
        }).catch(() => ({ data: [] })),
      ]);
      if (sumRes?.data) setCommissionSummary(sumRes.data);
      if (recsRes?.data) setCommissionRecords(recsRes.data);
    } catch (err) {
      console.error('Failed to load commission summary & records:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'COMMISSIONS') {
      loadCommissions();
    }
  }, [activeTab, commissionFilterVendor, commissionFilterStatus]);

  // Run Commission Simulation API
  const handleRunSimulation = async (amount = simOrderAmount, rate = simCommissionRate, vId = simVendorId) => {
    setSimLoading(true);
    try {
      const payload = {
        orderAmount: parseFloat(amount) || 0.0,
        commissionRate: rate !== '' ? parseFloat(rate) : undefined,
        vendorId: vId ? parseInt(vId) : undefined,
      };
      const res = await commissionApi.calculate(payload);
      setSimResult(res.data);
    } catch (err) {
      console.error('Commission simulation error:', err);
      showToast('Error executing commission simulation calculation.', 'error');
    } finally {
      setSimLoading(false);
    }
  };

  // Quick Preset Simulator Handler
  const handleApplySimulatorPreset = (amount, rate) => {
    setSimOrderAmount(amount.toString());
    setSimCommissionRate(rate.toString());
    setSimVendorId('');
    handleRunSimulation(amount, rate, '');
  };

  // Update Individual Commission Record Status
  const handleUpdateCommissionStatus = async (commissionId, newStatus) => {
    try {
      await commissionApi.updateStatus(commissionId, newStatus);
      showToast(`Commission record marked as ${newStatus}.`);
      loadCommissions();
    } catch (err) {
      showToast('Failed to update commission status.', 'error');
    }
  };

  // Load Coupon Engine Data
  const loadCoupons = async () => {
    try {
      const [listRes, statsRes, usagesRes] = await Promise.all([
        couponApi.getAll().catch(() => ({ data: [] })),
        couponApi.getAnalytics().catch(() => ({ data: null })),
        couponApi.getUsageHistory().catch(() => ({ data: [] }))
      ]);
      setCoupons(listRes.data || []);
      if (statsRes?.data) setCouponAnalytics(statsRes.data);
      setCouponUsages(usagesRes.data || []);
    } catch (err) {
      console.error('Failed to load coupons:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'COUPONS' || activeTab === 'OVERVIEW') {
      loadCoupons();
    }
  }, [activeTab]);

  const handleOpenCouponModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setCouponFormData({
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType || 'PERCENTAGE',
        discountValue: coupon.discountValue || 10,
        minOrderAmount: coupon.minOrderAmount || '',
        maxDiscountAmount: coupon.maxDiscountAmount || '',
        startDate: coupon.startDate ? coupon.startDate.slice(0, 10) : '',
        expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : '',
        usageLimit: coupon.usageLimit || '',
        userUsageLimit: coupon.userUsageLimit || 1,
        active: coupon.active !== false
      });
    } else {
      setEditingCoupon(null);
      setCouponFormData({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        minOrderAmount: 1000,
        maxDiscountAmount: 1000,
        startDate: '',
        expiryDate: '',
        usageLimit: 500,
        userUsageLimit: 1,
        active: true
      });
    }
    setShowCouponModal(true);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!couponFormData.code.trim()) {
      showToast('Please enter a coupon code.', 'error');
      return;
    }

    setCouponSubmitting(true);
    try {
      const payload = {
        code: couponFormData.code.trim().toUpperCase(),
        description: couponFormData.description,
        discountType: couponFormData.discountType,
        discountValue: parseFloat(couponFormData.discountValue),
        minOrderAmount: couponFormData.minOrderAmount ? parseFloat(couponFormData.minOrderAmount) : null,
        maxDiscountAmount: couponFormData.maxDiscountAmount ? parseFloat(couponFormData.maxDiscountAmount) : null,
        startDate: couponFormData.startDate ? couponFormData.startDate + 'T00:00:00' : null,
        expiryDate: couponFormData.expiryDate ? couponFormData.expiryDate + 'T23:59:59' : null,
        usageLimit: couponFormData.usageLimit ? parseInt(couponFormData.usageLimit) : null,
        userUsageLimit: couponFormData.userUsageLimit ? parseInt(couponFormData.userUsageLimit) : 1,
        active: couponFormData.active
      };

      if (editingCoupon) {
        await couponApi.update(editingCoupon.id, payload);
        showToast(`Coupon ${payload.code} updated successfully.`);
      } else {
        await couponApi.create(payload);
        showToast(`Coupon ${payload.code} created successfully.`);
      }
      setShowCouponModal(false);
      loadCoupons();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save coupon.';
      showToast(msg, 'error');
    } finally {
      setCouponSubmitting(false);
    }
  };

  const handleToggleCoupon = async (id) => {
    try {
      await couponApi.toggleStatus(id);
      showToast('Coupon active status updated.');
      loadCoupons();
    } catch (err) {
      showToast('Failed to toggle coupon status.', 'error');
    }
  };

  const handleDeleteCoupon = async (id, code) => {
    if (window.confirm(`Are you sure you want to delete coupon '${code}'?`)) {
      try {
        await couponApi.delete(id);
        showToast(`Coupon '${code}' deleted.`);
        loadCoupons();
      } catch (err) {
        showToast('Failed to delete coupon.', 'error');
      }
    }
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const matchesSearch = !couponSearch || 
        c.code.toLowerCase().includes(couponSearch.toLowerCase()) || 
        (c.description && c.description.toLowerCase().includes(couponSearch.toLowerCase()));
      
      const now = new Date();
      const isExpired = c.expiryDate && new Date(c.expiryDate) < now;
      
      let matchesStatus = true;
      if (couponFilterStatus === 'ACTIVE') {
        matchesStatus = c.active && !isExpired;
      } else if (couponFilterStatus === 'INACTIVE') {
        matchesStatus = !c.active;
      } else if (couponFilterStatus === 'EXPIRED') {
        matchesStatus = isExpired;
      }
      return matchesSearch && matchesStatus;
    });
  }, [coupons, couponSearch, couponFilterStatus]);

  // Load Business Report
  const loadReport = async (type = reportType, range = reportRange) => {
    setReportLoading(true);
    try {
      const res = await adminApi.getReport(type, range);
      setReportData(res.data);
    } catch (err) {
      console.error('Failed to generate business report:', err);
      showToast('Error generating business report from database.', 'error');
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'REPORTS') {
      loadReport(reportType, reportRange);
    }
  }, [activeTab, reportType, reportRange]);

  // Actions
  const handleUpdateVendorStatus = async (vendorId, status) => {
    try {
      await vendorApi.updateStatus(vendorId, status);
      showToast(`Vendor store status updated to ${status}.`);
      loadDashboardData(true);
    } catch (err) {
      showToast('Failed to update vendor status.', 'error');
    }
  };

  const handleSaveCommissionRate = async (e) => {
    e.preventDefault();
    if (!selectedVendorForModal || !newCommissionRate) return;
    try {
      await adminApi.updateVendorCommission(selectedVendorForModal.id, parseFloat(newCommissionRate));
      showToast(`Commission rate updated to ${newCommissionRate}% for ${selectedVendorForModal.storeName}.`);
      setSelectedVendorForModal(null);
      setNewCommissionRate('');
      loadDashboardData(true);
      if (activeTab === 'COMMISSIONS') loadCommissions();
    } catch (err) {
      showToast('Failed to update commission rate.', 'error');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setOrderUpdatingId(orderId);
    try {
      const res = await adminApi.updateOrderStatus(orderId, newStatus);
      showToast(`Order #${res.data.orderNumber} updated to ${newStatus}.`);
      if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
        setSelectedOrderDetails(res.data);
      }
      loadOrders();
      loadDashboardData(true);
    } catch (err) {
      showToast('Failed to update order status.', 'error');
    } finally {
      setOrderUpdatingId(null);
    }
  };

  const handleToggleUser = async (userId) => {
    try {
      await adminApi.toggleUserStatus(userId);
      showToast('User account authorization status toggled.');
      loadDashboardData(true);
    } catch (err) {
      showToast('Failed to toggle user status.', 'error');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      await categoryApi.create({ name: newCatName, description: newCatDesc, icon: 'Grid' });
      setNewCatName('');
      setNewCatDesc('');
      showToast(`Category "${newCatName}" created successfully.`);
      loadDashboardData(true);
    } catch (err) {
      showToast('Failed to create category.', 'error');
    }
  };

  // Report Export: CSV
  const handleExportCSV = () => {
    if (!reportData || !reportData.rows || reportData.rows.length === 0) {
      showToast('No report records available to export.', 'error');
      return;
    }

    const headers = reportData.columns.map(c => `"${c.label}"`).join(',');
    const rowsCsv = reportData.rows.map(row => {
      return reportData.columns.map(c => {
        let val = row[c.key];
        if (val === null || val === undefined) val = '';
        if (typeof val === 'string') val = val.replace(/"/g, '""');
        return `"${val}"`;
      }).join(',');
    }).join('\n');

    const csvContent = `data:text/csv;charset=utf-8,${encodeURIComponent(headers + '\n' + rowsCsv)}`;
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `ShopStack_${reportData.reportType}_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report CSV successfully generated and downloaded.');
  };

  // Report Export: JSON
  const handleExportJSON = () => {
    if (!reportData) return;
    const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(reportData, null, 2))}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `ShopStack_${reportData.reportType}_Report_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report JSON dataset exported successfully.');
  };

  // Filtered Vendors for table
  const filteredVendors = useMemo(() => {
    if (!vendorSearch.trim()) return vendors;
    const q = vendorSearch.toLowerCase();
    return vendors.filter(v =>
      v.storeName?.toLowerCase().includes(q) ||
      v.ownerEmail?.toLowerCase().includes(q) ||
      v.ownerName?.toLowerCase().includes(q)
    );
  }, [vendors, vendorSearch]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={32} className="spinning" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>Connecting to ShopStack Enterprise Control Plane...</div>
        <p style={{ fontSize: '0.88rem', marginTop: '0.5rem' }}>Authenticating Spring Boot backend connection and synchronizing marketplace schemas.</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1.5rem 5rem' }}>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          background: toastMessage.type === 'error' ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)',
          color: '#fff',
          padding: '0.85rem 1.5rem',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          fontWeight: 600,
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          animation: 'slideUp 0.3s ease-out'
        }}>
          {toastMessage.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          {toastMessage.msg}
        </div>
      )}

      {/* Top Header Card */}
      <div className="card" style={{ padding: '1.75rem 2rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
        <div>
          <div className="badge badge-admin" style={{ marginBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheck size={14} /> Enterprise Governance Portal
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
            Admin Dashboard & Business Intelligence
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>
            Central management for marketplace merchants, sales analytics, multi-vendor orders, commissions, and audit reports.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => loadDashboardData(true)}
            disabled={refreshing}
            className="btn btn-secondary btn-sm"
            title="Refresh database live stats"
          >
            <RefreshCw size={15} className={refreshing ? 'spinning' : ''} />
            {refreshing ? 'Syncing DB...' : 'Sync Database'}
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="horizontal-scroll-ribbon" style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.75rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`btn ${activeTab === 'OVERVIEW' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ whiteSpace: 'nowrap' }}
        >
          <BarChart3 size={15} /> Overview Summary
        </button>

        <button
          onClick={() => setActiveTab('VENDORS')}
          className={`btn ${activeTab === 'VENDORS' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ whiteSpace: 'nowrap' }}
        >
          <Store size={15} /> Vendor Management ({vendors.length})
        </button>

        <button
          onClick={() => setActiveTab('ANALYTICS')}
          className={`btn ${activeTab === 'ANALYTICS' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ whiteSpace: 'nowrap' }}
        >
          <TrendingUp size={15} /> Marketplace Analytics
        </button>

        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`btn ${activeTab === 'ORDERS' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ whiteSpace: 'nowrap' }}
        >
          <ShoppingBag size={15} /> Order Monitoring
        </button>

        <button
          onClick={() => setActiveTab('WAREHOUSES')}
          className={`btn ${activeTab === 'WAREHOUSES' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ whiteSpace: 'nowrap', border: activeTab === 'WAREHOUSES' ? '1px solid #8b5cf6' : undefined, background: activeTab === 'WAREHOUSES' ? 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' : undefined, color: activeTab === 'WAREHOUSES' ? '#fff' : undefined }}
        >
          <Layers size={15} /> Warehouse & Fulfillment
        </button>

        <button
          onClick={() => setActiveTab('COMMISSIONS')}
          className={`btn ${activeTab === 'COMMISSIONS' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ whiteSpace: 'nowrap' }}
        >
          <DollarSign size={15} /> Commission Management
        </button>

        <button
          onClick={() => setActiveTab('COUPONS')}
          className={`btn ${activeTab === 'COUPONS' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ whiteSpace: 'nowrap' }}
        >
          <Tag size={15} /> Coupon & Promo Engine ({coupons.length})
        </button>

        <button
          onClick={() => setActiveTab('REPORTS')}
          className={`btn ${activeTab === 'REPORTS' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ whiteSpace: 'nowrap' }}
        >
          <FileText size={15} /> Business Reports
        </button>

        <button
          onClick={() => setActiveTab('USERS')}
          className={`btn ${activeTab === 'USERS' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ whiteSpace: 'nowrap' }}
        >
          <Users size={15} /> User Governance ({users.length})
        </button>

        <button
          onClick={() => setActiveTab('TAXONOMY')}
          className={`btn ${activeTab === 'TAXONOMY' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
          style={{ whiteSpace: 'nowrap' }}
        >
          <Layers size={15} /> Taxonomy ({categories.length})
        </button>
      </div>

      {/* =========================================================================
          MODULE 1: OVERVIEW SUMMARY
      ========================================================================= */}
      {activeTab === 'OVERVIEW' && (
        <div>
          {/* KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            
            <div className="card" style={{ padding: '1.35rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Paid Revenue (GMV)</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={18} color="#34d399" />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>₹{stats?.totalRevenue ? stats.totalRevenue.toLocaleString() : '0.00'}</div>
              <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <ArrowUpRight size={14} /> Total Settled Inflow
              </div>
            </div>

            <div className="card" style={{ padding: '1.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Marketplace Commission</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={18} color="#818cf8" />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>₹{stats?.totalCommissionEarned ? stats.totalCommissionEarned.toLocaleString() : '0.00'}</div>
              <div style={{ fontSize: '0.78rem', color: '#818cf8', marginTop: '0.35rem' }}>
                Net Platform Earnings
              </div>
            </div>

            <div className="card" style={{ padding: '1.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={18} color="#fbbf24" />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{stats?.totalOrders || 0}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {stats?.completedOrders || 0} Completed • {stats?.pendingOrders || 0} Pending
              </div>
            </div>

            <div className="card" style={{ padding: '1.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Vendors</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Store size={18} color="#c084fc" />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{stats?.totalVendors || vendors.length}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                {stats?.pendingVendors || 0} Pending Approvals
              </div>
            </div>

            <div className="card" style={{ padding: '1.35rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Catalog Items</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={18} color="#22d3ee" />
                </div>
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff' }}>{stats?.totalProducts || 0}</div>
              <div style={{ fontSize: '0.78rem', color: stats?.outOfStockProducts > 0 ? '#f87171' : 'var(--text-muted)', marginTop: '0.35rem' }}>
                {stats?.outOfStockProducts || 0} Out of Stock
              </div>
            </div>

          </div>

          {/* Quick Hub Navigation */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '0.35rem' }}>
              Governance & Rapid Control Hub
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Direct shortcuts to configure commission policies, audit live transactions, manage users, or export financial statements.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              
              <div
                onClick={() => setActiveTab('VENDORS')}
                style={{
                  padding: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                className="hover-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#c084fc', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Store size={18} /> Vendor Approvals
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Review merchant applications and adjust custom commission rates.</p>
              </div>

              <div
                onClick={() => setActiveTab('ORDERS')}
                style={{
                  padding: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                className="hover-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fbbf24', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  <ShoppingBag size={18} /> Order Monitoring
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Track fulfillment milestones and update order lifecycle statuses.</p>
              </div>

              <div
                onClick={() => setActiveTab('COMMISSIONS')}
                style={{
                  padding: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                className="hover-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#34d399', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  <DollarSign size={18} /> Commission Ledger
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Calculate platform fees and simulate net vendor payouts.</p>
              </div>

              <div
                onClick={() => setActiveTab('COUPONS')}
                style={{
                  padding: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                className="hover-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f472b6', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Tag size={18} /> Coupon Engine
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Create discount codes, configure limits, and track redemption.</p>
              </div>

              <div
                onClick={() => setActiveTab('REPORTS')}
                style={{
                  padding: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                className="hover-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#38bdf8', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  <FileText size={18} /> Business Reports
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Export Sales, Vendor Payouts, Inventory, and Orders to CSV/JSON.</p>
              </div>

              <div
                onClick={() => setActiveTab('USERS')}
                style={{
                  padding: '1.25rem',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                className="hover-card"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#a78bfa', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Users size={18} /> User Governance
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Manage platform roles, customer accounts, and account access.</p>
              </div>

            </div>
          </div>

          {/* Recent Orders Preview on Overview */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Latest Multi-Vendor Orders</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Real-time orders submitted by marketplace customers across merchant stores.</p>
              </div>
              <button onClick={() => setActiveTab('ORDERS')} className="btn btn-secondary btn-sm">
                View All Orders ({orders.length}) <ChevronRight size={14} />
              </button>
            </div>

            <div className="table-responsive-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Order #</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Vendor Store</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Total Amount</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Payment</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#fff' }}>{o.orderNumber}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{o.customer?.fullName || o.customer?.email}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#c084fc', fontWeight: 600 }}>{o.vendorProfile?.storeName || 'General Store'}</td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#34d399' }}>₹{o.totalAmount?.toFixed(2)}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className={`badge ${o.paymentStatus === 'PAID' ? 'badge-customer' : 'badge-warning'}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className={`badge ${o.status === 'DELIVERED' ? 'badge-customer' : o.status === 'SHIPPED' ? 'badge-admin' : o.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                          {o.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedOrderDetails(o)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
                        >
                          <Eye size={13} /> Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 2: VENDOR MANAGEMENT
      ========================================================================= */}
      {activeTab === 'VENDORS' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                Vendor Merchants & Store Governance
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Approve new merchant applications, customize vendor commission fee rates, and monitor store ratings.
              </p>
            </div>

            {/* Vendor Search */}
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search vendor or owner..."
                value={vendorSearch}
                onChange={(e) => setVendorSearch(e.target.value)}
                style={{ paddingLeft: '38px', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Store Details</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Merchant Owner</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Catalog / Sales</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Commission %</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.map(v => (
                  <tr key={v.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {/* Store info */}
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {v.logoUrl ? (
                          <img src={v.logoUrl} alt={v.storeName} style={{ width: '38px', height: '38px', borderRadius: '8px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontWeight: 800 }}>
                            {v.storeName?.slice(0, 1) || 'V'}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{v.storeName}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            Rating: ⭐ {v.rating?.toFixed(1) || '5.0'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Owner info */}
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{v.ownerName || 'Merchant'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{v.ownerEmail}</div>
                      {v.ownerPhone && <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{v.ownerPhone}</div>}
                    </td>

                    {/* Catalog & Sales */}
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{v.productCount || 0} Products</div>
                      <div style={{ fontSize: '0.78rem', color: '#34d399' }}>
                        Gross: ₹{v.grossSales ? v.grossSales.toLocaleString() : '0.00'}
                      </div>
                    </td>

                    {/* Commission */}
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 700, color: '#818cf8', fontSize: '0.95rem' }}>
                          {v.commissionRate || 10.0}%
                        </span>
                        <button
                          onClick={() => {
                            setSelectedVendorForModal(v);
                            setNewCommissionRate(String(v.commissionRate || 10.0));
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.45rem', fontSize: '0.72rem' }}
                          title="Edit Commission Rate"
                        >
                          <Sliders size={12} /> Edit
                        </button>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${v.status === 'APPROVED' ? 'badge-customer' : v.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                        {v.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        {v.status !== 'APPROVED' ? (
                          <button
                            onClick={() => handleUpdateVendorStatus(v.id, 'APPROVED')}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            <Check size={14} /> Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateVendorStatus(v.id, 'REJECTED')}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                          >
                            <X size={14} /> Suspend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Edit Commission Modal */}
          {selectedVendorForModal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(8px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem'
            }}>
              <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '2rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
                  Update Commission Policy
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Adjust the platform commission percentage deducted from <strong style={{ color: '#fff' }}>{selectedVendorForModal.storeName}</strong> on each completed sale.
                </p>

                <form onSubmit={handleSaveCommissionRate}>
                  <div className="input-group">
                    <label className="input-label">Commission Rate (%) *</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      className="input-field"
                      placeholder="e.g. 10.0"
                      value={newCommissionRate}
                      onChange={(e) => setNewCommissionRate(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedVendorForModal(null)}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Commission Rate
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          MODULE 3: MARKETPLACE ANALYTICS
      ========================================================================= */}
      {activeTab === 'ANALYTICS' && (
        <div>
          {/* Header & Range Filter */}
          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                Marketplace Sales & Growth Analytics
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Real-time multi-dimensional statistics on sales volume, category popularity, and top products.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['7D', '30D', '90D', 'ALL'].map(r => (
                <button
                  key={r}
                  onClick={() => setAnalyticsRange(r)}
                  className={`btn ${analyticsRange === r ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                >
                  {r === '7D' ? 'Last 7 Days' : r === '30D' ? 'Last 30 Days' : r === '90D' ? 'Last Quarter' : 'All Time'}
                </button>
              ))}
            </div>
          </div>

          {analyticsLoading ? (
            <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={28} className="spinning" style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
              <div>Computing marketplace statistics...</div>
            </div>
          ) : analyticsData ? (
            <div>
              {/* Analytics Summary Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="card" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Period Revenue</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem' }}>
                    ₹{analyticsData.periodRevenue?.toFixed(2) || '0.00'}
                  </div>
                </div>

                <div className="card" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Period Orders</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '0.25rem' }}>
                    {analyticsData.periodOrders || 0}
                  </div>
                </div>

                <div className="card" style={{ padding: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Average Order Value</span>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#818cf8', marginTop: '0.25rem' }}>
                    ₹{analyticsData.periodAverageOrderValue?.toFixed(2) || '0.00'}
                  </div>
                </div>
              </div>

              {/* Interactive SVG Sales Trend Chart */}
              <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>Revenue Velocity & Daily Inflow</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Daily gross order sales volume over selected duration</p>
                  </div>
                  {hoveredTrendIndex !== null && analyticsData.salesTrend?.[hoveredTrendIndex] && (
                    <div style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid #6366f1', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.82rem', color: '#fff' }}>
                      <strong>{analyticsData.salesTrend[hoveredTrendIndex].date}:</strong> ₹{analyticsData.salesTrend[hoveredTrendIndex].sales.toFixed(2)} ({analyticsData.salesTrend[hoveredTrendIndex].orders} orders)
                    </div>
                  )}
                </div>

                {/* SVG Visual Chart */}
                <div style={{ width: '100%', height: '240px', position: 'relative' }}>
                  {(() => {
                    const trend = analyticsData.salesTrend || [];
                    if (trend.length === 0) return <div style={{ textAlign: 'center', color: 'var(--text-muted)', paddingTop: '80px' }}>No order trends in this window.</div>;
                    
                    const maxVal = Math.max(...trend.map(t => t.sales), 100);
                    const width = 800;
                    const height = 200;
                    const padding = 30;
                    const chartW = width - padding * 2;
                    const chartH = height - padding * 2;

                    const points = trend.map((t, idx) => {
                      const x = padding + (idx / Math.max(trend.length - 1, 1)) * chartW;
                      const y = height - padding - (t.sales / maxVal) * chartH;
                      return { x, y, ...t, idx };
                    });

                    const pathD = points.length > 1
                      ? `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
                      : '';
                    const areaD = points.length > 1
                      ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
                      : '';

                    return (
                      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        <defs>
                          <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>

                        {/* Grid lines */}
                        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="rgba(255,255,255,0.05)" strokeDasharray="4" />

                        {/* Area fill */}
                        {areaD && <path d={areaD} fill="url(#trendGrad)" />}

                        {/* Line */}
                        {pathD && <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

                        {/* Points */}
                        {points.map((p) => (
                          <g key={p.idx} onMouseEnter={() => setHoveredTrendIndex(p.idx)} onMouseLeave={() => setHoveredTrendIndex(null)} style={{ cursor: 'pointer' }}>
                            <circle cx={p.x} cy={p.y} r={hoveredTrendIndex === p.idx ? 7 : 4} fill={hoveredTrendIndex === p.idx ? '#34d399' : '#818cf8'} stroke="#0f172a" strokeWidth="2" />
                            <text x={p.x} y={height - 8} textAnchor="middle" fill="var(--text-subtle)" fontSize="11">
                              {p.date}
                            </text>
                          </g>
                        ))}
                      </svg>
                    );
                  })()}
                </div>
              </div>

              {/* Two Column Section: Category Share & Order Funnel */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                
                {/* Category Breakdown */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                    Revenue by Product Category
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {analyticsData.categoryBreakdown?.map((cat, idx) => (
                      <div key={idx}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                          <span style={{ fontWeight: 600, color: '#fff' }}>{cat.categoryName} ({cat.productCount} items)</span>
                          <span style={{ fontWeight: 700, color: '#34d399' }}>₹{cat.revenue.toFixed(2)} ({cat.percentage}%)</span>
                        </div>
                        <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${Math.max(cat.percentage, 4)}%`,
                            height: '100%',
                            background: idx % 3 === 0 ? '#6366f1' : idx % 3 === 1 ? '#34d399' : '#f59e0b'
                          }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Status Distribution */}
                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                    Fulfillment Status Breakdown
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {Object.entries(analyticsData.orderStatusCounts || {}).map(([st, cnt]) => (
                      <div key={st} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 700 }}>{st}</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>{cnt}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Top Selling Products Leaderboard */}
              <div className="card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>
                  Top Performing Products by Gross Volume
                </h3>
                <div className="table-responsive-wrapper">
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Vendor Store</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Units Sold</th>
                        <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Gross Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.topProducts?.map(p => (
                        <tr key={p.productId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              {p.imageUrl && <img src={p.imageUrl} alt={p.title} style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />}
                              <span style={{ fontWeight: 700, color: '#fff' }}>{p.title}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.85rem 1rem', color: '#c084fc' }}>{p.vendorName}</td>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{p.unitsSold} units</td>
                          <td style={{ padding: '0.85rem 1rem', textAlign: 'right', fontWeight: 800, color: '#34d399' }}>₹{p.totalRevenue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : null}
        </div>
      )}

      {/* =========================================================================
          MODULE 4: ORDER MONITORING
      ========================================================================= */}
      {activeTab === 'ORDERS' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                Global Marketplace Order Monitoring
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Audit all incoming multi-vendor transactions, inspect line items, and override shipping states.
              </p>
            </div>

            {/* Filter Search */}
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '260px' }}>
                <Search size={16} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  className="input-field"
                  placeholder="Order #, customer, store..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
                  style={{ paddingLeft: '38px', fontSize: '0.85rem' }}
                />
              </div>

              <button onClick={loadOrders} className="btn btn-secondary btn-sm">
                <Search size={14} /> Search
              </button>
            </div>
          </div>

          {/* Status Filter Chips */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            {['ALL', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'PENDING', 'CANCELLED'].map(st => (
              <button
                key={st}
                onClick={() => setOrderStatusFilter(st)}
                className={`btn ${orderStatusFilter === st ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="table-responsive-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Order Number</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Vendor Store</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Total</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Payment</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Fulfillment</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 700, color: '#fff' }}>{o.orderNumber}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                        {o.createdAt ? new Date(o.createdAt).toLocaleString() : 'N/A'}
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#fff', fontWeight: 600 }}>{o.customer?.fullName || 'Customer'}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{o.customer?.email}</div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#c084fc', fontWeight: 600 }}>{o.vendorProfile?.storeName || 'ShopStack Merchant'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>Fee: {o.vendorProfile?.commissionRate || 10}%</div>
                    </td>

                    <td style={{ padding: '1rem', fontWeight: 800, color: '#34d399' }}>
                      ₹{o.totalAmount?.toFixed(2)}
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span className={`badge ${o.paymentStatus === 'PAID' ? 'badge-customer' : 'badge-warning'}`} style={{ fontSize: '0.72rem' }}>
                          {o.paymentStatus}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>{o.paymentMethod}</span>
                      </div>
                    </td>

                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${o.status === 'DELIVERED' ? 'badge-customer' : o.status === 'SHIPPED' ? 'badge-admin' : o.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                        {o.status}
                      </span>
                    </td>

                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedOrderDetails(o)}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                      >
                        <Eye size={14} /> View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Detailed Order Modal */}
          {selectedOrderDetails && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1.5rem'
            }}>
              <div className="card" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <div>
                    <span className="badge badge-admin" style={{ marginBottom: '0.35rem' }}>Order Inspector</span>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>{selectedOrderDetails.orderNumber}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedOrderDetails(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Metadata Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>Customer Details</div>
                    <div style={{ fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>{selectedOrderDetails.customer?.fullName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedOrderDetails.customer?.email}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedOrderDetails.customer?.phoneNumber}</div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>Vendor Store</div>
                    <div style={{ fontWeight: 700, color: '#c084fc', marginTop: '0.2rem' }}>{selectedOrderDetails.vendorProfile?.storeName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Commission Fee: {selectedOrderDetails.vendorProfile?.commissionRate || 10}%</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Payment: {selectedOrderDetails.paymentStatus} ({selectedOrderDetails.paymentMethod})</div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700 }}>Shipping Destination</div>
                  <div style={{ fontSize: '0.85rem', color: '#fff', marginTop: '0.25rem' }}>
                    {selectedOrderDetails.shippingAddress || 'Standard Address On File'}
                  </div>
                </div>

                {/* Order Items Table */}
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>Purchased Line Items</h4>
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.5rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
                    <thead style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-subtle)' }}>
                      <tr>
                        <th style={{ padding: '0.6rem 0.85rem' }}>Product</th>
                        <th style={{ padding: '0.6rem 0.85rem' }}>Qty</th>
                        <th style={{ padding: '0.6rem 0.85rem' }}>Unit Price</th>
                        <th style={{ padding: '0.6rem 0.85rem', textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrderDetails.items?.map((item, idx) => (
                        <tr key={idx} style={{ borderTop: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem 0.85rem' }}>
                            <div style={{ fontWeight: 600, color: '#fff' }}>{item.product?.title || 'Product Item'}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>SKU: {item.product?.sku || 'SKU-00'}</div>
                          </td>
                          <td style={{ padding: '0.75rem 0.85rem', color: 'var(--text-muted)' }}>{item.quantity}</td>
                          <td style={{ padding: '0.75rem 0.85rem', color: 'var(--text-muted)' }}>₹{(item.unitPrice || item.price)?.toFixed(2)}</td>
                          <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: 700, color: '#34d399' }}>₹{item.subtotal?.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                        <td colSpan="3" style={{ padding: '0.75rem 0.85rem', fontWeight: 700, color: '#fff' }}>Total Order Amount</td>
                        <td style={{ padding: '0.75rem 0.85rem', textAlign: 'right', fontWeight: 800, color: '#34d399', fontSize: '1rem' }}>
                          ₹{selectedOrderDetails.totalAmount?.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Administrative Status Override */}
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '0.5rem' }}>
                    Administrative Lifecycle Override
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(st => (
                      <button
                        key={st}
                        onClick={() => handleUpdateOrderStatus(selectedOrderDetails.id, st)}
                        disabled={orderUpdatingId === selectedOrderDetails.id || selectedOrderDetails.status === st}
                        className={`btn ${selectedOrderDetails.status === st ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                        style={{ fontSize: '0.78rem' }}
                      >
                        {selectedOrderDetails.status === st && <Check size={13} />} Mark {st}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      )}

      {/* =========================================================================
          MODULE 5: COMMISSION MANAGEMENT & SETTLEMENT ENGINE
      ========================================================================= */}
      {activeTab === 'COMMISSIONS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* 1. Global Commission Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
            
            <div className="card" style={{ padding: '1.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Gross Marketplace Sales</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginTop: '0.35rem' }}>
                ₹{commissionSummary?.totalGrossSales ? commissionSummary.totalGrossSales.toLocaleString() : '0.00'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Total Merchant Sales Volume</div>
            </div>

            <div className="card" style={{ padding: '1.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Platform Cut Retained</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#818cf8', marginTop: '0.35rem' }}>
                ₹{commissionSummary?.totalCommissionEarned ? commissionSummary.totalCommissionEarned.toLocaleString() : '0.00'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#818cf8', marginTop: '0.2rem' }}>Platform Commission Revenue</div>
            </div>

            <div className="card" style={{ padding: '1.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Payable to Merchants</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '0.35rem' }}>
                ₹{commissionSummary?.totalVendorPayouts ? commissionSummary.totalVendorPayouts.toLocaleString() : '0.00'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '0.2rem' }}>Net Merchant Disbursal</div>
            </div>

            <div className="card" style={{ padding: '1.35rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>Avg Platform Rate</span>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.35rem' }}>
                {commissionSummary?.averageCommissionRate || 10.0}%
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Across Registered Stores</div>
            </div>

          </div>

          {/* 2. Interactive Commission Calculator & Test Simulator */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span className="badge badge-admin"><Calculator size={13} /> Live Calculation Engine</span>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                    Interactive Vendor Commission Simulator
                  </h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                  Test arbitrary order amounts and commission rates in real-time. Verify that platform fees and vendor net payouts calculate precisely.
                </p>
              </div>

              {/* Quick Presets */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase' }}>
                  <Zap size={13} style={{ display: 'inline', marginRight: '3px' }} /> 10% Presets:
                </span>
                <button
                  onClick={() => handleApplySimulatorPreset(10000, 10)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', borderColor: '#818cf8', color: '#c7d2fe' }}
                >
                  ₹10,000 (Cut: ₹1,000)
                </button>
                <button
                  onClick={() => handleApplySimulatorPreset(5000, 10)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', borderColor: '#34d399', color: '#a7f3d0' }}
                >
                  ₹5,000 (Cut: ₹500)
                </button>
                <button
                  onClick={() => handleApplySimulatorPreset(2500, 10)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  ₹2,500 (Cut: ₹250)
                </button>
                <button
                  onClick={() => handleApplySimulatorPreset(15000, 10)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  ₹15,000 (Cut: ₹1,500)
                </button>
                <button
                  onClick={() => handleApplySimulatorPreset(50000, 10)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem' }}
                >
                  ₹50,000 (Cut: ₹5,000)
                </button>
              </div>
            </div>

            {/* Simulator Inputs & Result Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
              
              {/* Left: Input Form */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      Order Amount (₹)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', fontWeight: 700 }}>₹</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        className="input-field"
                        value={simOrderAmount}
                        onChange={(e) => {
                          setSimOrderAmount(e.target.value);
                          handleRunSimulation(e.target.value, simCommissionRate, simVendorId);
                        }}
                        style={{ paddingLeft: '28px', fontSize: '0.95rem', fontWeight: 700 }}
                        placeholder="10000"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                      Commission Rate (%)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        className="input-field"
                        value={simCommissionRate}
                        onChange={(e) => {
                          setSimCommissionRate(e.target.value);
                          handleRunSimulation(simOrderAmount, e.target.value, simVendorId);
                        }}
                        style={{ paddingRight: '28px', fontSize: '0.95rem', fontWeight: 700 }}
                        placeholder="10"
                      />
                      <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)', fontWeight: 700 }}>%</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subtle)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Select Vendor Store (Optional Profile Inherit)
                  </label>
                  <select
                    className="input-field"
                    value={simVendorId}
                    onChange={(e) => {
                      const vId = e.target.value;
                      setSimVendorId(vId);
                      if (vId) {
                        const v = vendors.find(item => item.id.toString() === vId.toString());
                        if (v && v.commissionRate != null) {
                          setSimCommissionRate(v.commissionRate.toString());
                          handleRunSimulation(simOrderAmount, v.commissionRate, vId);
                          return;
                        }
                      }
                      handleRunSimulation(simOrderAmount, simCommissionRate, vId);
                    }}
                    style={{ fontSize: '0.88rem' }}
                  >
                    <option value="">-- Custom Manual Rate --</option>
                    {vendors.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.storeName} (Configured Fee: {v.commissionRate || 10}%)
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleRunSimulation(simOrderAmount, simCommissionRate, simVendorId)}
                  disabled={simLoading}
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  <PlayCircle size={15} /> {simLoading ? 'Calculating...' : 'Recalculate Split'}
                </button>
              </div>

              {/* Right: Live Result Display */}
              {simResult ? (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-md)', padding: '1.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    Calculation Breakdown
                  </div>

                  {/* Dual Metric Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                    <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', padding: '1rem', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase' }}>Platform Commission ({simResult.commissionRate}%)</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#818cf8', marginTop: '0.2rem' }}>
                        ₹{simResult.commissionAmount?.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.1rem' }}>Platform Retained Cut</div>
                    </div>

                    <div style={{ background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '1rem', borderRadius: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#6ee7b7', fontWeight: 700, textTransform: 'uppercase' }}>Vendor Payout ({((simResult.vendorAmount / (simResult.orderAmount || 1)) * 100).toFixed(1)}%)</span>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '0.2rem' }}>
                        ₹{simResult.vendorAmount?.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.1rem' }}>Net Merchant Balance</div>
                    </div>
                  </div>

                  {/* Percentage Split Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      <span>Platform: {simResult.commissionRate}%</span>
                      <span>Vendor: {((simResult.vendorAmount / (simResult.orderAmount || 1)) * 100).toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${Math.min(100, simResult.commissionRate)}%`, background: '#6366f1' }}></div>
                      <div style={{ width: `${Math.max(0, 100 - simResult.commissionRate)}%`, background: '#10b981' }}></div>
                    </div>
                  </div>

                  {/* Formula explanation box */}
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.78rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                    {simResult.formulaExplanation}
                  </div>
                </div>
              ) : null}

            </div>
          </div>

          {/* 3. Transaction-Level Order Commission Audit Ledger */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                  Order Commission Audit Ledger
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  Granular transaction audit records showing order amount, platform retention fee, and merchant payable.
                </p>
              </div>

              {/* Status and Vendor Filters */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <select
                  className="input-field"
                  value={commissionFilterVendor}
                  onChange={(e) => setCommissionFilterVendor(e.target.value)}
                  style={{ fontSize: '0.82rem', width: '180px' }}
                >
                  <option value="ALL">All Vendor Stores</option>
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.storeName}</option>
                  ))}
                </select>

                <select
                  className="input-field"
                  value={commissionFilterStatus}
                  onChange={(e) => setCommissionFilterStatus(e.target.value)}
                  style={{ fontSize: '0.82rem', width: '150px' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CALCULATED">CALCULATED</option>
                  <option value="SETTLED">SETTLED</option>
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>

                <button onClick={loadCommissions} className="btn btn-secondary btn-sm">
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>
            </div>

            {/* Audit Table */}
            <div className="table-responsive-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Order #</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Vendor Store</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Order Sale</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Fee %</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Platform Cut</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Vendor Net</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionRecords.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No commission audit records matching current filter criteria.
                      </td>
                    </tr>
                  ) : (
                    commissionRecords.map(rec => (
                      <tr key={rec.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{rec.orderNumber || `ORD-${rec.orderId}`}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
                            {rec.createdAt ? new Date(rec.createdAt).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>

                        <td style={{ padding: '1rem' }}>
                          <div style={{ color: 'var(--text-main)', fontWeight: 600 }}>{rec.customerName || 'Customer'}</div>
                        </td>

                        <td style={{ padding: '1rem' }}>
                          <div style={{ color: '#c084fc', fontWeight: 600 }}>{rec.vendorStoreName || 'ShopStack Merchant'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>{rec.vendorEmail}</div>
                        </td>

                        <td style={{ padding: '1rem', fontWeight: 700, color: '#fff' }}>
                          ₹{rec.orderAmount?.toFixed(2)}
                        </td>

                        <td style={{ padding: '1rem', fontWeight: 700, color: '#818cf8' }}>
                          {rec.commissionRate}%
                        </td>

                        <td style={{ padding: '1rem', fontWeight: 700, color: '#818cf8' }}>
                          ₹{rec.commissionAmount?.toFixed(2)}
                        </td>

                        <td style={{ padding: '1rem', fontWeight: 800, color: '#34d399' }}>
                          ₹{rec.vendorAmount?.toFixed(2)}
                        </td>

                        <td style={{ padding: '1rem' }}>
                          <span className={`badge ${rec.status === 'PAID' || rec.status === 'SETTLED' ? 'badge-customer' : rec.status === 'CALCULATED' ? 'badge-admin' : rec.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.75rem' }}>
                            {rec.status}
                          </span>
                        </td>

                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                            {rec.status !== 'SETTLED' && rec.status !== 'PAID' && (
                              <button
                                onClick={() => handleUpdateCommissionStatus(rec.id, 'SETTLED')}
                                className="btn btn-secondary btn-sm"
                                style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                                title="Mark as Settled in vendor ledger"
                              >
                                Settle
                              </button>
                            )}
                            {rec.status !== 'PAID' && (
                              <button
                                onClick={() => handleUpdateCommissionStatus(rec.id, 'PAID')}
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
                                title="Mark payout disbursed to vendor"
                              >
                                Mark Paid
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4. Merchant Store Settlement Summary Ledger */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
              Merchant Store Commission & Settlement Summary
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Store-level overview of sales volume, platform retention rate, and net disbursals. Click Adjust Rate to configure individual merchant fees.
            </p>

            <div className="table-responsive-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Vendor Store</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Merchant Owner</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Commission Rate</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Total Orders</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Gross Volume</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Platform Fee</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Payable to Vendor</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {commissionSummary?.vendorCommissions?.map(line => (
                    <tr key={line.vendorId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#fff' }}>{line.storeName}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ color: 'var(--text-main)' }}>{line.ownerName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>{line.ownerEmail}</div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: 700, color: '#818cf8' }}>
                        {line.commissionRate}%
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{line.totalOrders} orders</td>
                      <td style={{ padding: '1rem', color: '#fff', fontWeight: 600 }}>₹{line.grossSales?.toFixed(2)}</td>
                      <td style={{ padding: '1rem', color: '#818cf8', fontWeight: 700 }}>₹{line.commissionAmount?.toFixed(2)}</td>
                      <td style={{ padding: '1rem', color: '#34d399', fontWeight: 800 }}>₹{line.payableToVendor?.toFixed(2)}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className="badge badge-customer" style={{ fontSize: '0.75rem' }}>
                          <CheckCircle size={12} /> {line.payoutStatus}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => {
                            const v = vendors.find(item => item.id === line.vendorId);
                            if (v) {
                              setSelectedVendorForModal(v);
                              setNewCommissionRate(v.commissionRate?.toString() || '10');
                            }
                          }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                        >
                          <Sliders size={13} /> Adjust Rate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          MODULE: COUPON & PROMOTION ENGINE
      ========================================================================= */}
      {activeTab === 'COUPONS' && (
        <div>
          {/* Header Card */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Tag size={24} color="#818cf8" />
                Promotions & Coupon Management Engine
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                Design promotional campaigns, configure percentage and flat discounts, enforce minimum order thresholds, and monitor redemptions.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => handleOpenCouponModal()} className="btn btn-primary btn-sm">
                <PlusCircle size={15} /> Create New Coupon
              </button>
              <button onClick={loadCoupons} className="btn btn-secondary btn-sm">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* 1. KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-subtle)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>TOTAL CAMPAIGNS</span>
                <Tag size={18} color="#818cf8" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
                {couponAnalytics?.totalCoupons || coupons.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '0.25rem' }}>
                ✓ {couponAnalytics?.activeCoupons || coupons.filter(c => c.active).length} Active Campaigns
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-subtle)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>TOTAL REDEMPTIONS</span>
                <CheckCircle size={18} color="#34d399" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>
                {couponAnalytics?.totalRedemptions || 0}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Orders with applied discounts
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-subtle)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>TOTAL DISCOUNTS GIVEN</span>
                <Sparkles size={18} color="#fbbf24" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.5rem' }}>
                ₹{(couponAnalytics?.totalDiscountsGiven || 0).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Subsidized promotion value
              </div>
            </div>

            <div className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-subtle)', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>AVG DISCOUNT / ORDER</span>
                <Calculator size={18} color="#a78bfa" />
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa', marginTop: '0.5rem' }}>
                ₹{((couponAnalytics?.totalDiscountsGiven || 0) / Math.max(1, (couponAnalytics?.totalRedemptions || 1))).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Customer savings per use
              </div>
            </div>
          </div>

          {/* 2. Top Performing Campaigns Leaderboard */}
          {couponAnalytics?.topPerformingCoupons && couponAnalytics.topPerformingCoupons.length > 0 && (
            <div className="card" style={{ padding: '1.5rem', marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <TrendingUp size={18} color="#818cf8" />
                Top Performing Promotional Campaigns
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {couponAnalytics.topPerformingCoupons.map((item, index) => (
                  <div key={item.couponCode} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#818cf8' }}>
                        #{index + 1} {item.couponCode}
                      </span>
                      <span className="badge badge-admin" style={{ fontSize: '0.72rem' }}>
                        {item.discountType === 'PERCENTAGE' ? `${item.discountValue}% OFF` : `₹${item.discountValue} FLAT`}
                      </span>
                    </div>
                    <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Redemptions:</span>
                      <span style={{ fontWeight: 700, color: '#fff' }}>{item.redemptionCount} times</span>
                    </div>
                    <div style={{ marginTop: '0.35rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Total Savings Given:</span>
                      <span style={{ fontWeight: 800, color: '#34d399' }}>₹{(item.totalDiscountProvided || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Coupon Directory & Campaign Management Table */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Coupon Campaign Directory ({filteredCoupons.length})
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Manage validity windows, discount values, minimum spends, and active statuses.
                </span>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
                  <input
                    type="text"
                    placeholder="Search by code or description..."
                    value={couponSearch}
                    onChange={(e) => setCouponSearch(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '2.1rem', fontSize: '0.85rem', width: '230px' }}
                  />
                </div>

                <select
                  value={couponFilterStatus}
                  onChange={(e) => setCouponFilterStatus(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '0.85rem', width: '130px' }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="EXPIRED">Expired</option>
                </select>

                <button onClick={() => handleOpenCouponModal()} className="btn btn-primary btn-sm">
                  <PlusCircle size={14} /> Add Coupon
                </button>
              </div>
            </div>

            {/* Coupons Table */}
            <div className="table-responsive-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Coupon Code & Offer</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Discount Structure</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Min Order / Cap</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Validity Window</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Redemptions</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No coupons found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCoupons.map((c) => {
                      const now = new Date();
                      const isExpired = c.expiryDate && new Date(c.expiryDate) < now;
                      return (
                        <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#818cf8', letterSpacing: '0.5px' }}>
                                {c.code}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', maxWidth: '280px' }}>
                              {c.description || 'No description provided.'}
                            </div>
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 700, color: '#fff' }}>
                              {c.discountType === 'PERCENTAGE' ? `${c.discountValue}% OFF` : `₹${c.discountValue?.toFixed(2)} FLAT`}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                              {c.discountType}
                            </div>
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <div style={{ color: 'var(--text-main)' }}>
                              Min: {c.minOrderAmount ? `₹${c.minOrderAmount.toFixed(2)}` : 'None'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                              Max Cap: {c.maxDiscountAmount ? `₹${c.maxDiscountAmount.toFixed(2)}` : 'Unlimited'}
                            </div>
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontSize: '0.82rem', color: isExpired ? '#f87171' : 'var(--text-main)' }}>
                              Exp: {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'No expiry'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                              Start: {c.startDate ? new Date(c.startDate).toLocaleDateString() : 'Immediate'}
                            </div>
                          </td>

                          <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 600, color: '#fff' }}>
                              {c.usageCount || 0} {c.usageLimit ? `/ ${c.usageLimit}` : 'uses'}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-subtle)' }}>
                              Max {c.userUsageLimit || 1}/user
                            </div>
                          </td>

                          <td style={{ padding: '1rem' }}>
                            {isExpired ? (
                              <span className="badge badge-danger" style={{ fontSize: '0.72rem' }}>
                                Expired
                              </span>
                            ) : c.active ? (
                              <span className="badge badge-customer" style={{ fontSize: '0.72rem' }}>
                                Active
                              </span>
                            ) : (
                              <span className="badge badge-warning" style={{ fontSize: '0.72rem' }}>
                                Inactive
                              </span>
                            )}
                          </td>

                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleToggleCoupon(c.id)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                                title={c.active ? 'Deactivate coupon' : 'Activate coupon'}
                              >
                                {c.active ? 'Disable' : 'Enable'}
                              </button>

                              <button
                                onClick={() => handleOpenCouponModal(c)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                                title="Edit coupon details"
                              >
                                <Edit2 size={13} />
                              </button>

                              <button
                                onClick={() => handleDeleteCoupon(c.id, c.code)}
                                className="btn btn-danger btn-sm"
                                style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem' }}
                                title="Delete coupon"
                              >
                                <Trash2 size={13} />
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
          </div>

          {/* 4. Live Redemption Audit Ledger */}
          <div className="card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
              Transaction-Level Coupon Redemption Audit Ledger
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Detailed chronological record of customer purchases with applied coupon discounts.
            </p>

            <div className="table-responsive-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Coupon Code</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Customer</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Order Reference</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Order Subtotal</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Discount Applied</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Net Amount Paid</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Redemption Date</th>
                  </tr>
                </thead>
                <tbody>
                  {couponUsages.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No coupon redemptions recorded yet.
                      </td>
                    </tr>
                  ) : (
                    couponUsages.map((usage) => (
                      <tr key={usage.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '1rem', fontWeight: 800, color: '#818cf8' }}>
                          {usage.couponCode}
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div style={{ fontWeight: 600, color: '#fff' }}>{usage.customerName}</div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-subtle)' }}>{usage.customerEmail}</div>
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {usage.orderNumber}
                        </td>
                        <td style={{ padding: '1rem', color: '#fff', fontWeight: 600 }}>
                          ₹{usage.orderAmount?.toFixed(2)}
                        </td>
                        <td style={{ padding: '1rem', color: '#34d399', fontWeight: 800 }}>
                          - ₹{usage.discountAmount?.toFixed(2)}
                        </td>
                        <td style={{ padding: '1rem', color: '#818cf8', fontWeight: 700 }}>
                          ₹{usage.finalAmount?.toFixed(2)}
                        </td>
                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {usage.usedAt ? new Date(usage.usedAt).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}



      {/* =========================================================================
          MODULE 7: BUSINESS REPORTS
      ========================================================================= */}
      {activeTab === 'REPORTS' && (
        <div>
          {/* Controls Card */}
          <div className="card" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff' }}>
                  Business Intelligence & Financial Reports Engine
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  Generate comprehensive statements for sales volume, merchant payouts, catalog valuation, and audit trails.
                </p>
              </div>

              {/* Export Buttons */}
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  onClick={handleExportCSV}
                  disabled={reportLoading || !reportData}
                  className="btn btn-primary btn-sm"
                >
                  <Download size={15} /> Export CSV
                </button>
                <button
                  onClick={handleExportJSON}
                  disabled={reportLoading || !reportData}
                  className="btn btn-secondary btn-sm"
                >
                  <Download size={15} /> Export JSON
                </button>
                <button
                  onClick={() => window.print()}
                  className="btn btn-secondary btn-sm"
                >
                  <Printer size={15} /> Print / PDF
                </button>
              </div>
            </div>

            {/* Selectors */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              
              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Report Category</label>
                <select
                  className="input-field"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  style={{ background: 'var(--bg-main)', color: '#fff' }}
                >
                  <option value="SALES">Sales & Gross Revenue</option>
                  <option value="VENDORS">Vendor Performance & Commissions</option>
                  <option value="PRODUCTS">Product Inventory & Valuation</option>
                  <option value="ORDERS">Order Transactions & Fulfillment</option>
                </select>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label">Reporting Period</label>
                <select
                  className="input-field"
                  value={reportRange}
                  onChange={(e) => setReportRange(e.target.value)}
                  style={{ background: 'var(--bg-main)', color: '#fff' }}
                >
                  <option value="7D">Last 7 Days</option>
                  <option value="30D">Last 30 Days</option>
                  <option value="90D">Last Quarter (90 Days)</option>
                  <option value="ALL">All Time History</option>
                </select>
              </div>

            </div>
          </div>

          {/* Report Viewer Container */}
          {reportLoading ? (
            <div className="card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <RefreshCw size={28} className="spinning" style={{ color: 'var(--primary)', marginBottom: '0.75rem' }} />
              <div>Generating enterprise report dataset...</div>
            </div>
          ) : reportData ? (
            <div className="card" style={{ padding: '2rem' }}>
              
              {/* Report Header */}
              <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="badge badge-admin" style={{ marginBottom: '0.35rem' }}>
                  {reportData.reportType} REPORT
                </div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>{reportData.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>{reportData.subtitle}</p>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '0.5rem' }}>
                  Generated at: {reportData.generatedAt} • Period: {reportData.dateRange}
                </div>
              </div>

              {/* Summary KPIs Banner */}
              {reportData.summaryMetrics && Object.keys(reportData.summaryMetrics).length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                  {Object.entries(reportData.summaryMetrics).map(([key, val]) => (
                    <div key={key} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase' }}>{key}</span>
                      <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff', marginTop: '0.2rem' }}>
                        {typeof val === 'number' ? val.toLocaleString() : val}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Data Table */}
              <div className="table-responsive-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      {reportData.columns?.map(col => (
                        <th key={col.key} style={{ padding: '0.85rem 1rem' }}>
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.rows?.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        {reportData.columns?.map(col => {
                          const val = row[col.key];
                          return (
                            <td key={col.key} style={{ padding: '0.85rem 1rem' }}>
                              {col.type === 'currency' ? (
                                <strong style={{ color: '#34d399' }}>₹{typeof val === 'number' ? val.toFixed(2) : val}</strong>
                              ) : col.type === 'badge' ? (
                                <span className={`badge ${val === 'APPROVED' || val === 'DELIVERED' || val === 'PAID' || val === 'ACTIVE' ? 'badge-customer' : val === 'PENDING' ? 'badge-warning' : 'badge-danger'}`}>
                                  {val}
                                </span>
                              ) : (
                                <span style={{ color: 'var(--text-main)' }}>{val !== null && val !== undefined ? String(val) : '—'}</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          ) : null}
        </div>
      )}

      {/* =========================================================================
          MODULE 8: USER GOVERNANCE
      ========================================================================= */}
      {activeTab === 'USERS' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
            Registered Users & Role Authorization
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Manage platform accounts across Administrators, Vendors, and Customers.
          </p>

          <div className="table-responsive-wrapper">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-subtle)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>User Name</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Account Status</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '1rem', fontWeight: 700, color: '#fff' }}>{u.fullName}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{u.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${u.role === 'ADMIN' ? 'badge-admin' : u.role === 'VENDOR' ? 'badge-primary' : 'badge-customer'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${u.enabled ? 'badge-customer' : 'badge-danger'}`}>
                        {u.enabled ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleToggleUser(u.id)}
                        className={`btn ${u.enabled ? 'btn-danger' : 'btn-primary'} btn-sm`}
                      >
                        {u.enabled ? <Lock size={14} /> : <Unlock size={14} />} {u.enabled ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE 9: TAXONOMY
      ========================================================================= */}
      {activeTab === 'TAXONOMY' && (
        <div className="card" style={{ padding: '1.75rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginBottom: '0.35rem' }}>
            Marketplace Category Taxonomy
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            Create and organize catalog categories for multi-vendor product listings.
          </p>

          <form onSubmit={handleCreateCategory} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '1rem', marginBottom: '2rem' }}>
            <input
              type="text"
              className="input-field"
              placeholder="Category Name (e.g. Sports & Outdoors)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
            />
            <input
              type="text"
              className="input-field"
              placeholder="Short Description"
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
            />
            <button type="submit" className="btn btn-primary">
              <PlusCircle size={16} /> Add Category
            </button>
          </form>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {categories.map(c => (
              <div key={c.id} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '1rem' }}>{c.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>{c.description || 'No description provided.'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', marginTop: '0.5rem' }}>Slug: /{c.slug}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODULE: WAREHOUSE ALLOCATION & FULFILLMENT (TASK 4)
      ========================================================================= */}
      {activeTab === 'WAREHOUSES' && (
        <WarehouseManagementTab />
      )}

      {/* =========================================================================
          CREATE / EDIT COUPON MODAL DIALOG
      ========================================================================= */}
      {showCouponModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #334155', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Tag size={22} color="#818cf8" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promotional Coupon'}
                </h3>
              </div>
              <button
                onClick={() => setShowCouponModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCoupon}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Coupon Code */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                    Coupon Code * (e.g. SAVE20, FESTIVE500)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="SAVE20"
                    value={couponFormData.code}
                    onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                    className="input-field"
                    style={{ textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}
                  />
                </div>

                {/* Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                    Campaign Description
                  </label>
                  <input
                    type="text"
                    placeholder="Get 20% discount on orders above ₹1,000 (Max discount ₹1,000)"
                    value={couponFormData.description}
                    onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                    className="input-field"
                  />
                </div>

                {/* Discount Type & Value */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                      Discount Type *
                    </label>
                    <select
                      value={couponFormData.discountType}
                      onChange={(e) => setCouponFormData({ ...couponFormData, discountType: e.target.value })}
                      className="input-field"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED_AMOUNT">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                      {couponFormData.discountType === 'PERCENTAGE' ? 'Discount Percentage (%) *' : 'Discount Amount (₹) *'}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      placeholder={couponFormData.discountType === 'PERCENTAGE' ? '20' : '500'}
                      value={couponFormData.discountValue}
                      onChange={(e) => setCouponFormData({ ...couponFormData, discountValue: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Min Order & Max Discount Cap */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                      Minimum Order Amount (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="1000 (Optional)"
                      value={couponFormData.minOrderAmount}
                      onChange={(e) => setCouponFormData({ ...couponFormData, minOrderAmount: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                      Max Discount Cap (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="1000 (Optional)"
                      value={couponFormData.maxDiscountAmount}
                      onChange={(e) => setCouponFormData({ ...couponFormData, maxDiscountAmount: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Validity Dates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={couponFormData.startDate}
                      onChange={(e) => setCouponFormData({ ...couponFormData, startDate: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={couponFormData.expiryDate}
                      onChange={(e) => setCouponFormData({ ...couponFormData, expiryDate: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Limits */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                      Total Usage Limit (Marketplace)
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="500 (Optional)"
                      value={couponFormData.usageLimit}
                      onChange={(e) => setCouponFormData({ ...couponFormData, usageLimit: e.target.value })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.35rem' }}>
                      Limit Per Customer
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="1"
                      value={couponFormData.userUsageLimit}
                      onChange={(e) => setCouponFormData({ ...couponFormData, userUsageLimit: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Active Toggle Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="couponActiveCheck"
                    checked={couponFormData.active}
                    onChange={(e) => setCouponFormData({ ...couponFormData, active: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#4f46e5', cursor: 'pointer' }}
                  />
                  <label htmlFor="couponActiveCheck" style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 600, cursor: 'pointer' }}>
                    Active (Customers can apply this coupon immediately)
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '2rem', borderTop: '1px solid #334155', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={couponSubmitting}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {couponSubmitting ? <RefreshCw size={15} className="spin-icon" /> : <Check size={16} />}
                  {editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
