import { useState, useEffect, useRef } from 'react'
import AdminService from '../services/AdminService'
import ProductService from '../services/ProductService'
import NotificationService from '../services/NotificationService'
import AuthService from '../services/AuthService'
import CouponService from '../services/CouponService'
import WarehouseService from '../services/WarehouseService'

export default function AdminModule() {
  const adminUser = AuthService.getCurrentUser()
  const adminId = adminUser?.id

  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [vendors, setVendors] = useState([])
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [commissions, setCommissions] = useState(null)
  const [systemStatus, setSystemStatus] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [activeReportType, setActiveReportType] = useState('SALES')

  // Coupon & Promotion State
  const [coupons, setCoupons] = useState([])
  const [couponAnalytics, setCouponAnalytics] = useState(null)
  const [couponUsages, setCouponUsages] = useState([])
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderAmount: '',
    maxDiscountAmount: '',
    usageLimit: '',
    startDate: '',
    expiryDate: '',
    active: true
  })
  const [savingCoupon, setSavingCoupon] = useState(false)
  const [couponFormError, setCouponFormError] = useState('')

  // Commission Interactive Tester & Rate Config state
  const [testOrderAmount, setTestOrderAmount] = useState('10000')
  const [testCommissionRate, setTestCommissionRate] = useState('10')
  const [calcResult, setCalcResult] = useState(null)
  const [calcLoading, setCalcLoading] = useState(false)
  const [editingRate, setEditingRate] = useState(false)
  const [newConfigRate, setNewConfigRate] = useState('10')

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [activeAdminTab, setActiveAdminTab] = useState('overview') // 'overview' | 'users' | 'vendors' | 'products' | 'analytics' | 'orders' | 'commissions' | 'coupons' | 'system' | 'reports' | 'warehouse'

  // Warehouse state
  const [warehouses, setWarehouses] = useState([])
  const [warehouseAnalytics, setWarehouseAnalytics] = useState(null)
  const [warehouseStaff, setWarehouseStaff] = useState([])
  const [selectedWhInventory, setSelectedWhInventory] = useState(null)
  const [whInventory, setWhInventory] = useState([])
  const [whMovements, setWhMovements] = useState([])
  const [whOrders, setWhOrders] = useState([])
  const [whLoading, setWhLoading] = useState(false)
  const [assigningStaff, setAssigningStaff] = useState(null)
  const [showAddWarehouseForm, setShowAddWarehouseForm] = useState(false)
  const [newWhForm, setNewWhForm] = useState({ name: '', code: '', locationCity: '', address: '', capacity: 50000, contactNumber: '', contactEmail: '' })
  const [savingWh, setSavingWh] = useState(false)

  // Admin Inward Stock state
  const [showAdminInwardModal, setShowAdminInwardModal] = useState(false)
  const [adminInwardForm, setAdminInwardForm] = useState({ productId: '', quantity: 100, aisleBin: 'Aisle A-01', note: 'Admin initial stock inward' })
  const [adminInwardLoading, setAdminInwardLoading] = useState(false)

  // Quick Staff Assignment state
  const [selectedUserForAssign, setSelectedUserForAssign] = useState('')
  const [selectedWhForAssign, setSelectedWhForAssign] = useState('')



  // Vendor Detail Modal state
  const [selectedVendorDetails, setSelectedVendorDetails] = useState(null)
  const [vendorFilterStatus, setVendorFilterStatus] = useState('ALL')

  // Order Detail Modal state
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderFilterStatus, setOrderFilterStatus] = useState('ALL')

  // Notification state
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifPanel, setShowNotifPanel] = useState(false)
  const notifRef = useRef(null)

  const loadCouponData = async () => {
    try {
      const [allCoupons, allAnalytics, allUsages] = await Promise.all([
        CouponService.getAllCoupons(),
        CouponService.getAnalytics(),
        CouponService.getUsageHistory()
      ])
      setCoupons(allCoupons || [])
      setCouponAnalytics(allAnalytics || null)
      setCouponUsages(allUsages || [])
    } catch (err) {
      console.error('Error loading coupon data:', err)
    }
  }

  const loadAdminData = async () => {
    setLoading(true)
    setLoadError('')
    try {
      const [statsRes, usersRes, vendorsRes, productsRes, ordersRes, analyticsRes, commissionsRes, sysRes, reportRes] = await Promise.all([
        AdminService.getPlatformStats(),
        AdminService.getAllUsers(),
        AdminService.getAllVendors(),
        ProductService.getAllProducts(),
        AdminService.getAllOrders(),
        AdminService.getMarketplaceAnalytics(),
        AdminService.getCommissionData(),
        AdminService.getSystemStatus(),
        AdminService.getReport(activeReportType)
      ])
      setStats(statsRes)
      setUsers(usersRes)
      setVendors(vendorsRes)
      setProducts(productsRes)
      setOrders(ordersRes)
      setAnalytics(analyticsRes)
      setCommissions(commissionsRes)
      setSystemStatus(sysRes)
      setReportData(reportRes)
      await loadCouponData()
      // Load warehouse overview data in background
      loadWarehouseData().catch(e => console.warn('Warehouse data load failed:', e))
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setLoadError('Access Denied: You do not have admin privileges to view this portal.')
      } else {
        setLoadError(err.response?.data?.message || err.message || 'Failed to load admin dashboard data. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const loadWarehouseData = async () => {
    try {
      const whList = await WarehouseService.getWarehouses().catch(e => { console.warn('Warehouses load err:', e); return []; })
      const whAnalytics = await WarehouseService.getAnalytics().catch(e => { console.warn('Analytics load err:', e); return null; })
      const whStaff = await WarehouseService.getWarehouseStaff().catch(e => { console.warn('Staff load err:', e); return []; })
      const whOrdList = await WarehouseService.getOrderQueue(null).catch(e => { console.warn('Orders load err:', e); return []; })
      const movList = await WarehouseService.getStockMovements(null).catch(e => { console.warn('Movements load err:', e); return []; })

      setWarehouses(whList || [])
      setWarehouseAnalytics(whAnalytics || null)
      setWarehouseStaff(whStaff || [])
      setWhOrders(whOrdList || [])
      setWhMovements(movList || [])
    } catch (err) {
      console.warn('Warehouse data error:', err)
    }
  }

  const loadWhInventory = async (whId) => {
    setWhLoading(true)
    try {
      const inv = await WarehouseService.getInventory(whId)
      setWhInventory(inv || [])
      setSelectedWhInventory(whId)
    } catch (err) {
      console.error('Inventory load error:', err)
    } finally { setWhLoading(false) }
  }

  const handleAssignStaff = async (userId, warehouseId) => {
    try {
      await WarehouseService.assignStaffWarehouse(userId, warehouseId)
      await loadWarehouseData()
      setAssigningStaff(null)
      alert('Staff assigned successfully!')
    } catch (err) {
      alert('Failed to assign: ' + (err.response?.data?.message || err.message))
    }
  }

  const handleCreateWarehouse = async (e) => {
    e.preventDefault()
    setSavingWh(true)
    try {
      await WarehouseService.createWarehouse({ ...newWhForm, active: true })
      setShowAddWarehouseForm(false)
      setNewWhForm({ name: '', code: '', locationCity: '', address: '', capacity: 50000, contactNumber: '', contactEmail: '' })
      await loadWarehouseData()
    } catch (err) {
      alert('Failed to create warehouse: ' + (err.response?.data?.message || err.message))
    } finally { setSavingWh(false) }
  }

  const handleAdminInwardStock = async (e) => {
    e.preventDefault()
    if (!adminInwardForm.productId) { alert('Please select a product'); return }
    if (!selectedWhInventory) { alert('No warehouse selected'); return }
    setAdminInwardLoading(true)
    try {
      await WarehouseService.inwardStock(selectedWhInventory, {
        productId: Number(adminInwardForm.productId),
        quantity: Number(adminInwardForm.quantity),
        staffId: adminId || 1,
        staffName: 'Administrator',
        aisleBin: adminInwardForm.aisleBin,
        note: adminInwardForm.note
      })
      alert('Stock successfully added to warehouse!')
      setShowAdminInwardModal(false)
      setAdminInwardForm({ productId: '', quantity: 100, aisleBin: 'Aisle A-01', note: 'Stock inward replenishment' })
      await loadWhInventory(selectedWhInventory)
      await loadWarehouseData()
    } catch (err) {
      alert('Failed to inward stock: ' + (err.response?.data?.message || err.message))
    } finally { setAdminInwardLoading(false) }
  }

  const handleQuickAssign = async () => {
    if (!selectedUserForAssign) { alert('Please select a user'); return }
    if (!selectedWhForAssign) { alert('Please select a warehouse'); return }
    await handleAssignStaff(Number(selectedUserForAssign), Number(selectedWhForAssign))
    setSelectedUserForAssign('')
    setSelectedWhForAssign('')
  }




  const loadNotifications = async () => {
    if (!adminId) return
    try {
      const [notifs, count] = await Promise.all([
        NotificationService.getNotifications(adminId),
        NotificationService.getUnreadCount(adminId)
      ])
      setNotifications(notifs)
      setUnreadCount(count)
    } catch (err) {
      console.error('Error loading notifications:', err)
    }
  }

  useEffect(() => {
    loadAdminData()
    loadNotifications()
    const interval = setInterval(loadNotifications, 5000)
    return () => clearInterval(interval)
  }, [adminId])

  // Reload report when type changes
  useEffect(() => {
    if (activeAdminTab === 'reports') {
      AdminService.getReport(activeReportType)
        .then(res => setReportData(res))
        .catch(err => console.error('Failed to load report:', err))
    }
  }, [activeReportType, activeAdminTab])

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifPanel(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handlers
  const handleRoleChange = async (userId, newRole) => {
    try {
      await AdminService.updateUserRole(userId, newRole)
      loadAdminData()
    } catch (err) {
      console.error('Error updating role:', err)
      alert('Failed to change user role.')
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user account?')) return
    try {
      await AdminService.deleteUser(userId)
      loadAdminData()
    } catch (err) {
      console.error('Error deleting user:', err)
    }
  }

  const handleVendorStatusChange = async (vendorId, newStatus) => {
    try {
      await AdminService.updateVendorStatus(vendorId, newStatus)
      loadAdminData()
    } catch (err) {
      console.error('Error updating vendor status:', err)
    }
  }

  const handleViewVendorDetails = async (vendorId) => {
    try {
      const data = await AdminService.getVendorDetails(vendorId)
      setSelectedVendorDetails(data)
    } catch (err) {
      console.error('Failed to load vendor details:', err)
    }
  }

  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await AdminService.updateOrderStatus(orderId, newStatus)
      loadAdminData()
    } catch (err) {
      console.error('Error updating order status:', err)
    }
  }

  const handleVendorPayoutStatusChange = async (vendorId, newStatus) => {
    try {
      await AdminService.updateVendorPayoutStatus(vendorId, newStatus)
      const freshComm = await AdminService.getCommissionData()
      setCommissions(freshComm)
    } catch (err) {
      console.error('Error updating payout status:', err)
    }
  }

  const handleRunCommissionTest = async (amtOverride, rateOverride) => {
    const amt = amtOverride !== undefined ? amtOverride : testOrderAmount
    const rate = rateOverride !== undefined ? rateOverride : testCommissionRate
    setCalcLoading(true)
    try {
      const res = await AdminService.calculateCommission(amt, rate)
      setCalcResult(res)
    } catch (err) {
      console.error('Error calculating commission test:', err)
    } finally {
      setCalcLoading(false)
    }
  }

  const handleUpdateRecordStatus = async (recordId, newStatus) => {
    try {
      await AdminService.updateCommissionRecordStatus(recordId, newStatus)
      const freshComm = await AdminService.getCommissionData()
      setCommissions(freshComm)
    } catch (err) {
      console.error('Error updating commission record status:', err)
    }
  }

  const handleSaveConfigRate = async () => {
    try {
      await AdminService.updateCommissionRate(newConfigRate)
      setEditingRate(false)
      const freshComm = await AdminService.getCommissionData()
      setCommissions(freshComm)
    } catch (err) {
      console.error('Error updating config rate:', err)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Moderate & remove this product from the platform?')) return
    try {
      await ProductService.deleteProduct(productId)
      loadAdminData()
    } catch (err) {
      console.error('Error moderating product:', err)
    }
  }

  const handleToggleProductApproval = async (product, approved) => {
    try {
      await ProductService.updateProduct(product.id, { ...product, approved })
      loadAdminData()
    } catch (err) {
      console.error('Error updating product approval:', err)
      alert('Failed to update product approval status.')
    }
  }

  const handleMarkAsRead = async (notifId) => {
    try {
      await NotificationService.markAsRead(notifId)
      loadNotifications()
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    if (!adminId) return
    try {
      await NotificationService.markAllAsRead(adminId)
      loadNotifications()
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const handleCreateCoupon = async (e) => {
    e.preventDefault()
    setSavingCoupon(true)
    setCouponFormError('')
    try {
      await CouponService.createCoupon({
        code: couponForm.code.trim().toUpperCase(),
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        minOrderAmount: couponForm.minOrderAmount ? Number(couponForm.minOrderAmount) : null,
        maxDiscountAmount: couponForm.maxDiscountAmount ? Number(couponForm.maxDiscountAmount) : null,
        usageLimit: couponForm.usageLimit ? parseInt(couponForm.usageLimit) : null,
        startDate: couponForm.startDate ? new Date(couponForm.startDate).toISOString() : null,
        expiryDate: couponForm.expiryDate ? new Date(couponForm.expiryDate).toISOString() : null,
        active: couponForm.active
      })
      setShowCouponModal(false)
      setCouponForm({
        code: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        usageLimit: '',
        startDate: '',
        expiryDate: '',
        active: true
      })
      loadCouponData()
    } catch (err) {
      console.error('Error creating coupon:', err)
      setCouponFormError(err.response?.data?.message || err.message || 'Failed to create coupon')
    } finally {
      setSavingCoupon(false)
    }
  }

  const handleToggleCoupon = async (couponId) => {
    try {
      await CouponService.toggleStatus(couponId)
      loadCouponData()
    } catch (err) {
      console.error('Error toggling coupon status:', err)
    }
  }

  const handleDeleteCoupon = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return
    try {
      await CouponService.deleteCoupon(couponId)
      loadCouponData()
    } catch (err) {
      console.error('Error deleting coupon:', err)
    }
  }

  const filteredVendors = vendors.filter(v => {
    if (vendorFilterStatus === 'ALL') return true
    return v.status === vendorFilterStatus
  })

  const filteredOrders = orders.filter(o => {
    if (orderFilterStatus === 'ALL') return true
    return o.status === orderFilterStatus
  })

  if (loading) return <div style={{ color: 'var(--gold)', padding: '2rem', textAlign: 'center', fontSize: '1.1rem' }}>⚡ Loading Executive Control Center...</div>

  if (loadError) return (
    <div style={{ padding: '2rem' }}>
      <div className="banner-error">
        ⚠️ {loadError}
        <button onClick={loadAdminData} style={{ marginLeft: '1rem', background: 'none', border: '1px solid #F87171', color: '#F87171', padding: '0.3rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>Retry</button>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '1.5rem 0' }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(212,175,55,0.12) 0%, rgba(10,10,10,0.98) 100%)',
          border: '1px solid rgba(212,175,55,0.3)',
          borderRadius: 'var(--radius-card)',
          padding: '2rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--gold)', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Executive Control Command Center
              </span>
              <span className="badge badge-purple">SYSTEM ADMIN AUTHORIZED</span>
            </div>
            <h1 style={{ fontSize: '2.1rem', fontWeight: '800', color: '#fff', fontFamily: 'Manrope, sans-serif' }}>
              Obsidian Platform Governance &amp; Analytics
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '700px' }}>
              Monitor marketplace performance, handle vendor verification &amp; commissions, inspect system health, track orders, and generate business audit reports.
            </p>
          </div>

          {/* Right Header Status & Notification Bell */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid var(--success)', padding: '0.5rem 0.9rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }}></span>
              <span style={{ color: '#86efac', fontWeight: '700', fontSize: '0.85rem' }}>SYSTEM OPTIMAL</span>
            </div>

            {/* Notification Bell */}
            <div ref={notifRef} style={{ position: 'relative', flexShrink: 0 }}>
              <button
                id="admin-notif-bell"
                onClick={() => setShowNotifPanel(p => !p)}
                style={{
                  position: 'relative',
                  background: unreadCount > 0 ? 'rgba(212,175,55,0.18)' : 'var(--bg-card)',
                  border: `1px solid ${unreadCount > 0 ? 'rgba(212,175,55,0.6)' : 'var(--border)'}`,
                  borderRadius: '12px',
                  padding: '0.65rem 1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#fff',
                  fontSize: '1.1rem',
                  transition: 'all 0.2s',
                  minWidth: '60px',
                  justifyContent: 'center'
                }}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{
                    background: 'var(--gold)',
                    color: '#000',
                    borderRadius: '999px',
                    fontSize: '0.7rem',
                    fontWeight: '800',
                    padding: '0.15rem 0.45rem',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifPanel && (
                <div
                  id="admin-notif-panel"
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 0.75rem)',
                    right: 0,
                    width: '380px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-focus)',
                    borderRadius: 'var(--radius-card)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                    zIndex: 2000,
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.25rem',
                    borderBottom: '1px solid var(--border)'
                  }}>
                    <span style={{ fontWeight: '800', color: '#fff', fontSize: '0.95rem' }}>🔔 Platform Alerts</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--gold)',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          fontWeight: '700',
                          textDecoration: 'underline'
                        }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div style={{ maxHeight: '380px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        No new notifications
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          onClick={() => !n.read && handleMarkAsRead(n.id)}
                          style={{
                            padding: '0.9rem 1.25rem',
                            borderBottom: '1px solid var(--border-subtle)',
                            background: n.read ? 'transparent' : 'rgba(212,175,55,0.08)',
                            cursor: n.read ? 'default' : 'pointer',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'flex-start'
                          }}
                        >
                          <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: '0.1rem' }}>
                            {n.type === 'PRODUCT_ADDED' ? '📦' : '🏪'}
                          </span>
                          <div style={{ flex: 1 }}>
                            <p style={{
                              margin: 0,
                              fontSize: '0.875rem',
                              color: n.read ? 'var(--text-secondary)' : '#fff',
                              fontWeight: n.read ? '400' : '600',
                              lineHeight: '1.4'
                            }}>
                              {n.message}
                            </p>
                            <p style={{ margin: '0.25rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {new Date(n.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar for all 8 Admin Requirements */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.85rem',
        marginBottom: '2rem',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveAdminTab('overview')}
          style={activeAdminTab === 'overview' ? activeTabStyle : tabStyle}
        >
          📊 Dashboard Summary
        </button>

        <button
          onClick={() => setActiveAdminTab('users')}
          style={activeAdminTab === 'users' ? activeTabStyle : tabStyle}
        >
          👤 Users ({users.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('vendors')}
          style={activeAdminTab === 'vendors' ? activeTabStyle : tabStyle}
        >
          🏪 Vendor Management ({vendors.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('products')}
          style={activeAdminTab === 'products' ? activeTabStyle : tabStyle}
        >
          🔍 Catalog Moderation ({products.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('analytics')}
          style={activeAdminTab === 'analytics' ? activeTabStyle : tabStyle}
        >
          📈 Analytics &amp; Trends
        </button>

        <button
          onClick={() => setActiveAdminTab('orders')}
          style={activeAdminTab === 'orders' ? activeTabStyle : tabStyle}
        >
          📦 Order Monitoring ({orders.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('commissions')}
          style={activeAdminTab === 'commissions' ? activeTabStyle : tabStyle}
        >
          💰 Commissions &amp; Payouts
        </button>

        <button
          onClick={() => setActiveAdminTab('coupons')}
          style={activeAdminTab === 'coupons' ? activeTabStyle : tabStyle}
        >
          🎟️ Coupons &amp; Promotions ({coupons.length})
        </button>

        <button
          onClick={() => setActiveAdminTab('system')}
          style={activeAdminTab === 'system' ? activeTabStyle : tabStyle}
        >
          🖥️ System Status
        </button>

        <button
          onClick={() => setActiveAdminTab('reports')}
          style={activeAdminTab === 'reports' ? activeTabStyle : tabStyle}
        >
          📑 Business Reports
        </button>

        <button
          id="admin-tab-warehouse"
          onClick={() => { setActiveAdminTab('warehouse'); loadWarehouseData(); }}
          style={activeAdminTab === 'warehouse' ? activeTabStyle : tabStyle}
        >
          🏭 Warehouse Management ({warehouses.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD SUMMARY */}
      {activeAdminTab === 'overview' && (
        <div>
          <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
            <div className="info-card">
              <div className="card-icon icon-purple">👑</div>
              <div className="card-label">Platform Gross Volume</div>
              <div className="card-value" style={{ color: 'var(--gold)', fontSize: '1.6rem', fontWeight: '800' }}>
                ${stats?.totalPlatformRevenue ? Number(stats.totalPlatformRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem' }}>Aggregated platform revenue across sellers</div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-blue">👥</div>
              <div className="card-label">Registered Accounts</div>
              <div className="card-value" style={{ fontSize: '1.6rem', fontWeight: '800' }}>{users.length}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem' }}>Customers, Vendors &amp; System Admins</div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-green">🛍️</div>
              <div className="card-label">Catalog Listings</div>
              <div className="card-value" style={{ fontSize: '1.6rem', fontWeight: '800' }}>{products.length}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem' }}>Approved &amp; pending product items</div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-orange">🏪</div>
              <div className="card-label">Registered Stores</div>
              <div className="card-value" style={{ fontSize: '1.6rem', fontWeight: '800' }}>{vendors.length}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem' }}>Active &amp; pending seller stores</div>
            </div>
          </div>

          {/* Quick Platform Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>⚡ Actionable Moderation Queue</h3>
                <span className="badge badge-purple">ATTENTION NEEDED</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'var(--bg-secondary)', borderRadius: '10px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Pending Vendor Applications</span>
                  <span style={{ fontWeight: '800', color: 'var(--gold)', fontSize: '1.1rem' }}>{stats?.pendingVendors || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'var(--bg-secondary)', borderRadius: '10px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Products Awaiting Moderation</span>
                  <span style={{ fontWeight: '800', color: '#fde047', fontSize: '1.1rem' }}>{stats?.pendingProducts || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', background: 'var(--bg-secondary)', borderRadius: '10px', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Processed Orders</span>
                  <span style={{ fontWeight: '800', color: '#86efac', fontSize: '1.1rem' }}>{orders.length}</span>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', marginBottom: '1rem' }}>🛡️ Security &amp; Services Status</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>JWT Security Encryption</span>
                  <span style={{ color: '#86efac', fontWeight: '700' }}>HMAC-SHA256</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Database Connection Pool</span>
                  <span style={{ color: '#86efac', fontWeight: '700' }}>ONLINE (0 Leaks)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment Engine</span>
                  <span style={{ color: 'var(--gold)', fontWeight: '700' }}>RAZORPAY INTEGRATED</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>In-App Alert Pipeline</span>
                  <span style={{ color: '#86efac', fontWeight: '700' }}>ACTIVE (5s Sync)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeAdminTab === 'users' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700' }}>Registered Accounts &amp; Access Control</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Accounts: {users.length}</span>
          </div>
          <div className="table-responsive">
            <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>User Profile</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Current Role</th>
                <th style={{ padding: '1rem' }}>Modify Authorization</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: '700', color: '#fff' }}>{u.username}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: #{u.id} {u.fullName ? `• ${u.fullName}` : ''}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={u.role === 'ADMIN' ? 'badge badge-red' : u.role === 'VENDOR' ? 'badge badge-green' : 'badge badge-purple'}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)',
                        color: '#fff',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '8px',
                        outline: 'none'
                      }}
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="VENDOR">VENDOR</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid var(--error)', color: '#fca5a5', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      Remove User
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* TAB 3: VENDOR MANAGEMENT */}
      {activeAdminTab === 'vendors' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
          {/* Status Filter Header */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700' }}>Vendor Verification &amp; Governance</h3>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['ALL', 'APPROVED', 'PENDING', 'REJECTED', 'SUSPENDED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setVendorFilterStatus(st)}
                  style={{
                    background: vendorFilterStatus === st ? 'var(--gold)' : 'var(--bg-secondary)',
                    color: vendorFilterStatus === st ? '#000' : 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: vendorFilterStatus === st ? '700' : '500',
                    cursor: 'pointer'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="table-responsive">
            <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>Store Name &amp; Address</th>
                <th style={{ padding: '1rem' }}>Business Contact</th>
                <th style={{ padding: '1rem' }}>Rating</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Moderation &amp; Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No vendor applications matching filter.</td></tr>
              ) : (
                filteredVendors.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '700', color: '#fff' }}>{v.storeName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.address}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      <div>{v.businessEmail}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{v.phoneNumber}</div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--gold)', fontWeight: '700' }}>★ {v.rating || 4.9}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className={v.status === 'APPROVED' ? 'badge badge-green' : v.status === 'SUSPENDED' ? 'badge badge-red' : 'badge badge-orange'}>
                        {v.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleViewVendorDetails(v.id)}
                          style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          Details
                        </button>
                        <button
                          onClick={() => handleVendorStatusChange(v.id, 'APPROVED')}
                          style={{ background: 'rgba(22,163,74,0.2)', border: '1px solid var(--success)', color: '#86efac', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleVendorStatusChange(v.id, 'SUSPENDED')}
                          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid var(--warning)', color: '#fde047', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Suspend
                        </button>
                        <button
                          onClick={() => handleVendorStatusChange(v.id, 'REJECTED')}
                          style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid var(--error)', color: '#fca5a5', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

          {/* Vendor Details Drawer Modal */}
          {selectedVendorDetails && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-focus)', borderRadius: 'var(--radius-card)', maxWidth: '600px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>🏪 Vendor Profile Details</h2>
                  <button onClick={() => setSelectedVendorDetails(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Store Name</span>
                    <h3 style={{ color: 'var(--gold)', fontSize: '1.3rem', fontWeight: '800' }}>{selectedVendorDetails.profile?.storeName}</h3>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Description</span>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>{selectedVendorDetails.profile?.description}</p>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Business Email</span>
                      <div style={{ color: '#fff', fontWeight: '600' }}>{selectedVendorDetails.profile?.businessEmail}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Phone Number</span>
                      <div style={{ color: '#fff', fontWeight: '600' }}>{selectedVendorDetails.profile?.phoneNumber}</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Total Active Listings</span>
                      <div style={{ color: '#fff', fontWeight: '600' }}>{selectedVendorDetails.totalProducts} Items</div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Estimated Gross Sales</span>
                      <div style={{ color: 'var(--gold)', fontWeight: '800' }}>${Number(selectedVendorDetails.totalSales).toLocaleString()}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                    <button onClick={() => setSelectedVendorDetails(null)} className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: MARKETPLACE ANALYTICS */}
      {activeAdminTab === 'analytics' && analytics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Analytics Summary Cards */}
          <div className="dashboard-grid">
            <div className="info-card">
              <div className="card-icon icon-purple">💵</div>
              <div className="card-label">Gross Transaction Volume</div>
              <div className="card-value" style={{ color: 'var(--gold)', fontSize: '1.5rem', fontWeight: '800' }}>
                ${Number(analytics.totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-blue">📦</div>
              <div className="card-label">Marketplace Orders</div>
              <div className="card-value" style={{ fontSize: '1.5rem', fontWeight: '800' }}>{analytics.totalOrdersCount}</div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-green">📊</div>
              <div className="card-label">Average Order Value</div>
              <div className="card-value" style={{ color: '#86efac', fontSize: '1.5rem', fontWeight: '800' }}>
                ${Number(analytics.avgOrderValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-orange">🏷️</div>
              <div className="card-label">Catalog Products</div>
              <div className="card-value" style={{ fontSize: '1.5rem', fontWeight: '800' }}>{analytics.totalProducts}</div>
            </div>
          </div>

          {/* Charts Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
            {/* Sales Trend Bar Chart */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: '1.5rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem' }}>📈 Monthly Sales Volume Trend ($)</h3>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '220px', padding: '1rem 0', borderBottom: '1px solid var(--border)' }}>
                {analytics.salesTrend?.map((item, idx) => {
                  const maxSales = 8000
                  const heightPercent = Math.min(100, Math.max(15, (item.sales / maxSales) * 100))
                  return (
                    <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--gold)', fontWeight: '700' }}>${item.sales}</span>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '32px',
                          height: `${heightPercent}%`,
                          background: 'linear-gradient(180deg, var(--gold) 0%, rgba(212,175,55,0.2) 100%)',
                          borderRadius: '6px 6px 0 0',
                          transition: 'height 0.5s ease'
                        }}
                      />
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{item.month}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Category Breakdown Progress Bars */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: '1.5rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem' }}>🏷️ Sales Distribution by Category</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {Object.entries(analytics.categorySales || {}).map(([cat, amount]) => {
                  const total = Object.values(analytics.categorySales).reduce((a, b) => Number(a) + Number(b), 0)
                  const percent = total > 0 ? Math.round((Number(amount) / total) * 100) : 0
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                        <span style={{ color: '#fff', fontWeight: '600' }}>{cat}</span>
                        <span style={{ color: 'var(--gold)', fontWeight: '700' }}>${Number(amount).toLocaleString()} ({percent}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: 'var(--gold)', borderRadius: '999px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ORDER MONITORING */}
      {activeAdminTab === 'orders' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
          {/* Order Status Filter Header */}
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700' }}>Marketplace Order Monitoring &amp; Status Control</h3>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['ALL', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilterStatus(st)}
                  style={{
                    background: orderFilterStatus === st ? 'var(--gold)' : 'var(--bg-secondary)',
                    color: orderFilterStatus === st ? '#000' : 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="table-responsive">
            <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>Order ID</th>
                <th style={{ padding: '1rem' }}>Customer Name</th>
                <th style={{ padding: '1rem' }}>Total Amount</th>
                <th style={{ padding: '1rem' }}>Payment Status</th>
                <th style={{ padding: '1rem' }}>Order Status</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No marketplace orders found.</td></tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--gold)' }}>#{ord.id}</td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '600', color: '#fff' }}>{ord.customerName || 'Customer'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>User ID: #{ord.userId}</div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '800', color: '#fff' }}>
                      ${Number(ord.totalAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge badge-green">{ord.paymentStatus || 'PAID'}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select
                        value={ord.status}
                        onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)',
                          color: '#fff',
                          padding: '0.35rem 0.7rem',
                          borderRadius: '8px',
                          outline: 'none',
                          fontSize: '0.85rem'
                        }}
                      >
                        <option value="PROCESSING">PROCESSING</option>
                        <option value="SHIPPED">SHIPPED</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                      >
                        View Items ({ord.items?.length || 0})
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>

          {/* Order Details Modal */}
          {selectedOrder && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', zIndex: 3000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-focus)', borderRadius: 'var(--radius-card)', maxWidth: '650px', width: '100%', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#fff' }}>📦 Order Summary #{selectedOrder.id}</h2>
                  <button onClick={() => setSelectedOrder(null)} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '12px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Shipping Address</div>
                    <div style={{ color: '#fff', fontWeight: '600' }}>{selectedOrder.shippingAddress}</div>
                  </div>

                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff', marginTop: '0.5rem' }}>Purchased Items</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.8rem', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
                        <img src={item.imageUrl} alt="" style={{ width: '45px', height: '45px', borderRadius: '8px', objectFit: 'cover' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '700', color: '#fff' }}>{item.productName}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Quantity: {item.quantity} units</div>
                        </div>
                        <div style={{ fontWeight: '800', color: 'var(--gold)' }}>
                          ${Number(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
                    <span style={{ fontWeight: '700', color: '#fff' }}>Total Amount Paid</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--gold)' }}>
                      ${Number(selectedOrder.totalAmount).toFixed(2)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button onClick={() => setSelectedOrder(null)} className="btn-primary" style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>Close</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: COMMISSION MANAGEMENT */}
      {activeAdminTab === 'commissions' && commissions && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Financial Overview Metric Cards */}
          <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className="info-card">
              <div className="card-icon icon-purple">⚡</div>
              <div className="card-label">Marketplace Configured Rate</div>
              <div className="card-value" style={{ color: 'var(--gold)', fontSize: '1.6rem', fontWeight: '800' }}>
                {commissions.commissionRate}%
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>Default platform service fee</div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-blue">💰</div>
              <div className="card-label">Total Gross Seller Volume</div>
              <div className="card-value" style={{ fontSize: '1.6rem', fontWeight: '800' }}>
                ₹{Number(commissions.totalGrossSales || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>Total sales across platform</div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-green">👑</div>
              <div className="card-label">Platform Net Earnings</div>
              <div className="card-value" style={{ color: '#86efac', fontSize: '1.6rem', fontWeight: '800' }}>
                ₹{Number(commissions.totalPlatformCommission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>Platform retained fee</div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-purple">🛍️</div>
              <div className="card-label">Net Vendor Payouts</div>
              <div className="card-value" style={{ color: '#60a5fa', fontSize: '1.6rem', fontWeight: '800' }}>
                ₹{Number(commissions.totalVendorNetPayout || (commissions.totalGrossSales - commissions.totalPlatformCommission) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginTop: '0.2rem' }}>Net owed to vendors</div>
            </div>
          </div>

          {/* Interactive Live Commission Calculator Widget */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-focus)', borderRadius: 'var(--radius-card)', padding: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  ⚡ Live Commission Calculation Simulator
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                  Execute backend business logic REST API (`/api/commissions/calculate`) to test any order amount &amp; commission rate
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setTestOrderAmount('10000')
                    setTestCommissionRate('10')
                    handleRunCommissionTest('10000', '10')
                  }}
                  style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid #3b82f6', color: '#93c5fd', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}
                >
                  Preset Case 1 (₹10,000 @ 10%)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTestOrderAmount('5000')
                    setTestCommissionRate('5')
                    handleRunCommissionTest('5000', '5')
                  }}
                  style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid #a855f7', color: '#c084fc', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '600' }}
                >
                  Preset Case 2 (₹5,000 @ 5%)
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end', marginBottom: '1.2rem' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Order Amount (₹)</label>
                <input
                  type="number"
                  value={testOrderAmount}
                  onChange={(e) => setTestOrderAmount(e.target.value)}
                  placeholder="e.g. 10000"
                  style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.3rem' }}>Commission Rate (%)</label>
                <input
                  type="number"
                  value={testCommissionRate}
                  onChange={(e) => setTestCommissionRate(e.target.value)}
                  placeholder="e.g. 10"
                  style={{ width: '100%', padding: '0.6rem 0.8rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff' }}
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => handleRunCommissionTest()}
                  disabled={calcLoading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '0.65rem 1rem' }}
                >
                  {calcLoading ? 'Calculating...' : 'Calculate via REST API'}
                </button>
              </div>
            </div>

            {calcResult && (
              <div style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid var(--border-focus)', borderRadius: '8px', padding: '1.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Input Order Amount</div>
                  <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '700' }}>₹{Number(calcResult.orderAmount).toLocaleString('en-IN')}</div>
                </div>

                <div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Commission Rate</div>
                  <div style={{ color: 'var(--gold)', fontSize: '1.2rem', fontWeight: '700' }}>{calcResult.commissionRate}%</div>
                </div>

                <div style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                  <div style={{ color: '#fef08a', fontSize: '0.78rem', fontWeight: '600' }}>Platform Commission</div>
                  <div style={{ color: '#fde047', fontSize: '1.3rem', fontWeight: '800' }}>₹{Number(calcResult.commissionAmount).toLocaleString('en-IN')}</div>
                </div>

                <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', padding: '0.6rem 0.8rem', borderRadius: '6px' }}>
                  <div style={{ color: '#86efac', fontSize: '0.78rem', fontWeight: '600' }}>Vendor Amount</div>
                  <div style={{ color: '#4ade80', fontSize: '1.3rem', fontWeight: '800' }}>₹{Number(calcResult.vendorAmount).toLocaleString('en-IN')}</div>
                </div>
              </div>
            )}
          </div>

          {/* Vendor Commission Breakdown Table */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700' }}>Vendor Sales, Commission &amp; Disbursal Ledger</h3>
            </div>
            <div className="table-responsive">
            <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Vendor Store</th>
                  <th style={{ padding: '1rem' }}>Gross Sales</th>
                  <th style={{ padding: '1rem' }}>Platform Fee</th>
                  <th style={{ padding: '1rem' }}>Net Vendor Payout</th>
                  <th style={{ padding: '1rem' }}>Payout Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Process Action</th>
                </tr>
              </thead>
              <tbody>
                {commissions.vendorCommissions?.map((vc) => (
                  <tr key={vc.vendorId} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: '700', color: '#fff' }}>{vc.storeName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{vc.businessEmail}</div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '700', color: '#fff' }}>
                      ₹{Number(vc.grossSales).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--gold)' }}>
                      ₹{Number(vc.platformFee).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: '800', color: '#86efac' }}>
                      ₹{Number(vc.netPayout).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={vc.payoutStatus === 'PAID' ? 'badge badge-green' : 'badge badge-orange'}>
                        {vc.payoutStatus}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      {vc.payoutStatus === 'PAID' ? (
                        <button
                          onClick={() => handleVendorPayoutStatusChange(vc.vendorId, 'PENDING')}
                          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid var(--warning)', color: '#fde047', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Mark Pending
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVendorPayoutStatusChange(vc.vendorId, 'PAID')}
                          style={{ background: 'rgba(22,163,74,0.2)', border: '1px solid var(--success)', color: '#86efac', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Disburse Payout
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>

          {/* Transactional Order Commission Records Table */}
          {commissions.commissionRecords && commissions.commissionRecords.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700' }}>📜 Order Commission Transactions (PostgreSQL Records)</h3>
              </div>
              <div className="table-responsive">
              <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '1rem' }}>Record ID</th>
                    <th style={{ padding: '1rem' }}>Date</th>
                    <th style={{ padding: '1rem' }}>Order ID</th>
                    <th style={{ padding: '1rem' }}>Vendor</th>
                    <th style={{ padding: '1rem' }}>Order Amount</th>
                    <th style={{ padding: '1rem' }}>Rate</th>
                    <th style={{ padding: '1rem' }}>Platform Fee</th>
                    <th style={{ padding: '1rem' }}>Vendor Amount</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {commissions.commissionRecords.map((cr) => (
                    <tr key={cr.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--gold)' }}>#COMM-{cr.id}</td>
                      <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {cr.createdAt ? new Date(cr.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#fff' }}>#ORD-{cr.orderId}</td>
                      <td style={{ padding: '1rem', fontWeight: '600', color: '#fff' }}>{cr.vendorName || `Vendor #${cr.vendorId}`}</td>
                      <td style={{ padding: '1rem', fontWeight: '700', color: '#fff' }}>
                        ₹{Number(cr.orderAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--gold)' }}>{cr.commissionRate}%</td>
                      <td style={{ padding: '1rem', fontWeight: '700', color: '#fde047' }}>
                        ₹{Number(cr.commissionAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '800', color: '#4ade80' }}>
                        ₹{Number(cr.vendorAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span className={cr.status === 'PAID' ? 'badge badge-green' : 'badge badge-orange'}>
                          {cr.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleUpdateRecordStatus(cr.id, cr.status === 'PAID' ? 'PENDING' : 'PAID')}
                          style={{
                            background: cr.status === 'PAID' ? 'rgba(245,158,11,0.15)' : 'rgba(22,163,74,0.2)',
                            border: cr.status === 'PAID' ? '1px solid var(--warning)' : '1px solid var(--success)',
                            color: cr.status === 'PAID' ? '#fde047' : '#86efac',
                            padding: '0.35rem 0.7rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          {cr.status === 'PAID' ? 'Mark Pending' : 'Mark Paid'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: SYSTEM MONITORING */}
      {activeAdminTab === 'system' && systemStatus && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Health Overview Cards */}
          <div className="dashboard-grid">
            <div className="info-card">
              <div className="card-icon icon-green">🖥️</div>
              <div className="card-label">System Health Status</div>
              <div className="card-value" style={{ color: '#86efac', fontSize: '1.5rem', fontWeight: '800' }}>
                {systemStatus.overallStatus}
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-purple">⚡</div>
              <div className="card-label">JVM Memory Usage</div>
              <div className="card-value" style={{ color: 'var(--gold)', fontSize: '1.5rem', fontWeight: '800' }}>
                {systemStatus.usedMemoryMB} MB / {systemStatus.maxMemoryMB} MB
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                {systemStatus.memoryUsagePercent}% utilization
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-blue">🧵</div>
              <div className="card-label">Active Java Threads</div>
              <div className="card-value" style={{ fontSize: '1.5rem', fontWeight: '800' }}>{systemStatus.activeThreads}</div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-orange">⏱️</div>
              <div className="card-label">System Uptime</div>
              <div className="card-value" style={{ fontSize: '1.5rem', fontWeight: '800' }}>{systemStatus.uptimeMinutes} Mins</div>
            </div>
          </div>

          {/* Service Diagnostics Grid */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: '1.5rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.5rem' }}>🔍 Microservice Health Grid</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {Object.entries(systemStatus.services || {}).map(([key, srv]) => (
                <div key={key} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '12px', padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.92rem' }}>{srv.name}</span>
                    <span className="badge badge-green">{srv.status}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {srv.latency ? `Latency: ${srv.latency}` : srv.algorithm ? `Alg: ${srv.algorithm}` : 'Status: Optimal'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* System Diagnostic Logs Stream */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: '1.5rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700', marginBottom: '1rem' }}>📜 Live Operational Diagnostic Logs</h3>
            <div style={{ background: '#050505', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {systemStatus.logs?.map((log, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>[{log.timestamp}]</span>
                  <span style={{ color: log.level === 'SUCCESS' ? '#86efac' : 'var(--gold)', fontWeight: '700' }}>[{log.level}]</span>
                  <span style={{ color: '#fff' }}>{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: BUSINESS REPORTS */}
      {activeAdminTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Report Type Selector */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: '800' }}>📑 Executive Business Audit Reports</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>Generate and download real-time reporting datasets across sales, vendors, products, and system infrastructure.</p>
              </div>

              <a
                href={AdminService.exportReportCsvUrl(activeReportType)}
                target="_blank"
                rel="noreferrer"
                download
                className="btn-primary"
                style={{ width: 'auto', padding: '0.65rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}
              >
                📥 Export CSV Report
              </a>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
              {[
                { id: 'SALES', label: '📊 Sales & Orders Report' },
                { id: 'VENDOR', label: '🏪 Vendor Performance' },
                { id: 'PRODUCT', label: '📦 Catalog Inventory Audit' },
                { id: 'SYSTEM', label: '🖥️ System Diagnostic Report' }
              ].map(rep => (
                <button
                  key={rep.id}
                  onClick={() => setActiveReportType(rep.id)}
                  style={{
                    background: activeReportType === rep.id ? 'var(--gold)' : 'var(--bg-secondary)',
                    color: activeReportType === rep.id ? '#000' : 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                    padding: '0.65rem 1.25rem',
                    borderRadius: 'var(--radius-btn)',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  {rep.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generated Report Data Table Preview */}
          {reportData && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ color: 'var(--gold)', fontSize: '1.1rem', fontWeight: '800' }}>{reportData.title}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Generated: {reportData.generatedAt} by {reportData.generatedBy}</span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.82rem', textTransform: 'uppercase' }}>
                    {reportData.columns?.map((col, idx) => (
                      <th key={idx} style={{ padding: '1rem' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.data?.map((row, rIdx) => (
                    <tr key={rIdx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      {Object.values(row).map((val, cIdx) => (
                        <td key={cIdx} style={{ padding: '1rem', color: cIdx === 0 ? 'var(--gold)' : '#fff', fontWeight: cIdx === 0 ? '700' : '400' }}>
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3 (CATALOG MODERATION - EXISTING CONTINUED) */}
      {activeAdminTab === 'products' && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700' }}>Product Catalog Listing Moderation</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Listings: {products.length}</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                <th style={{ padding: '1rem' }}>Item</th>
                <th style={{ padding: '1rem' }}>Vendor</th>
                <th style={{ padding: '1rem' }}>Price</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Stock</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img src={prod.imageUrl} alt="" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div>
                        <div style={{ fontWeight: '700', color: '#fff' }}>{prod.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Category: {prod.category}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{prod.vendorName || 'Obsidian Seller'}</td>
                  <td style={{ padding: '1rem' }}>
                    {prod.discount > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ color: 'var(--gold)', fontWeight: '800' }}>
                          ${Number(prod.discountedPrice).toLocaleString()}
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textDecoration: 'line-through' }}>
                          ${Number(prod.price).toLocaleString()}
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontWeight: '800', color: 'var(--gold)' }}>
                        ${Number(prod.price).toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {prod.approved ? (
                      <span className="badge badge-green">Approved</span>
                    ) : (
                      <span className="badge badge-red">Pending</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>{prod.stockQuantity} units</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      {prod.approved ? (
                        <button
                          onClick={() => handleToggleProductApproval(prod, false)}
                          style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid var(--warning)', color: '#fde047', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          Revoke
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleProductApproval(prod, true)}
                          style={{ background: 'rgba(22,163,74,0.15)', border: '1px solid var(--success)', color: '#86efac', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteProduct(prod.id)}
                        style={{ background: 'rgba(220,38,38,0.15)', border: '1px solid var(--error)', color: '#fca5a5', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* TAB 8: COUPONS & PROMOTIONS ENGINE */}
      {activeAdminTab === 'coupons' && (
        <div>
          {/* Coupon Analytics KPI Cards */}
          <div className="dashboard-grid" style={{ marginBottom: '2.5rem' }}>
            <div className="info-card">
              <div className="card-icon icon-purple">🎟️</div>
              <div className="card-label">Total Coupons</div>
              <div className="card-value" style={{ fontSize: '1.6rem', fontWeight: '800' }}>
                {couponAnalytics?.totalCoupons ?? coupons.length}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                Total promotional campaigns created
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-green">⚡</div>
              <div className="card-label">Active Campaigns</div>
              <div className="card-value" style={{ color: '#22c55e', fontSize: '1.6rem', fontWeight: '800' }}>
                {couponAnalytics?.activeCoupons ?? coupons.filter(c => c.active).length}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                Currently valid and live for checkout
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-blue">🛒</div>
              <div className="card-label">Total Redemptions</div>
              <div className="card-value" style={{ fontSize: '1.6rem', fontWeight: '800' }}>
                {couponAnalytics?.totalUsageCount ?? couponUsages.length}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                Orders placed using promotional coupons
              </div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-gold">💎</div>
              <div className="card-label">Total Discounts Given</div>
              <div className="card-value" style={{ color: 'var(--gold)', fontSize: '1.6rem', fontWeight: '800' }}>
                ₹{couponAnalytics?.totalDiscountGiven ? Number(couponAnalytics.totalDiscountGiven).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
                Cumulative savings provided to customers
              </div>
            </div>
          </div>

          {/* Coupon Campaigns Header & Action */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: 0 }}>
                Promotional Campaigns &amp; Discount Vouchers
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0' }}>
                Configure discount rules, track redemption limits, and manage coupon lifecycle
              </p>
            </div>

            <button
              onClick={() => { setCouponFormError(''); setShowCouponModal(true) }}
              style={{
                background: 'var(--gold)',
                color: '#000',
                border: 'none',
                padding: '0.75rem 1.25rem',
                borderRadius: 'var(--radius-btn)',
                fontWeight: '800',
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 15px rgba(212, 175, 55, 0.3)'
              }}
            >
              <span>➕</span> Create New Coupon
            </button>
          </div>

          {/* Coupon Campaigns Table */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden', marginBottom: '2.5rem' }}>
            <div className="table-responsive">
              <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '1rem' }}>Coupon Code</th>
                    <th style={{ padding: '1rem' }}>Discount</th>
                    <th style={{ padding: '1rem' }}>Rules &amp; Limits</th>
                    <th style={{ padding: '1rem' }}>Redemptions</th>
                    <th style={{ padding: '1rem' }}>Validity</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No coupons created yet. Click "Create New Coupon" to start a campaign.
                      </td>
                    </tr>
                  ) : (
                    coupons.map((cpn) => {
                      const status = getCouponStatus(cpn)
                      return (
                        <tr key={cpn.id} style={{ borderBottom: '1px solid var(--border-subtle)', background: !cpn.active ? 'rgba(0,0,0,0.2)' : 'transparent' }}>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ fontWeight: '800', color: 'var(--gold)', letterSpacing: '0.05em', background: 'rgba(212,175,55,0.1)', padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-focus)' }}>
                              {cpn.code}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', fontWeight: '700', color: '#fff' }}>
                            {cpn.discountType === 'PERCENTAGE' ? `${cpn.discountValue}% OFF` : `₹${cpn.discountValue} FLAT`}
                            {cpn.maxDiscountAmount && (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                                Max cap: ₹{cpn.maxDiscountAmount}
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            {cpn.minOrderAmount ? `Min order: ₹${cpn.minOrderAmount}` : 'No min order'}
                            {cpn.usageLimit && (
                              <span style={{ display: 'block', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                                Limit: {cpn.usageLimit} uses
                              </span>
                            )}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{ fontWeight: '700', color: 'var(--gold)' }}>{cpn.usedCount || 0}</span>
                            {cpn.usageLimit && <span style={{ color: 'var(--text-muted)' }}> / {cpn.usageLimit}</span>}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            {cpn.expiryDate ? new Date(cpn.expiryDate).toLocaleDateString() : 'Never expires'}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span className={`badge ${status.color}`}>
                              {status.label}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleToggleCoupon(cpn.id)}
                                style={{
                                  background: cpn.active ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
                                  border: cpn.active ? '1px solid var(--warning)' : '1px solid var(--success)',
                                  color: cpn.active ? '#fde047' : '#86efac',
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontWeight: '600',
                                  fontSize: '0.8rem'
                                }}
                              >
                                {cpn.active ? 'Disable' : 'Enable'}
                              </button>
                              <button
                                onClick={() => handleDeleteCoupon(cpn.id)}
                                style={{
                                  background: 'rgba(220,38,38,0.15)',
                                  border: '1px solid var(--error)',
                                  color: '#fca5a5',
                                  padding: '0.35rem 0.75rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem'
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Coupon Usage Audit Ledger */}
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '1rem' }}>
              📜 Coupon Redemption Ledger &amp; Audit Trail
            </h3>
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
              <div className="table-responsive">
              <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.9rem 1rem' }}>Redemption ID</th>
                    <th style={{ padding: '0.9rem 1rem' }}>Customer</th>
                    <th style={{ padding: '0.9rem 1rem' }}>Order Ref</th>
                    <th style={{ padding: '0.9rem 1rem' }}>Coupon Code</th>
                    <th style={{ padding: '0.9rem 1rem' }}>Cart Amount</th>
                    <th style={{ padding: '0.9rem 1rem' }}>Discount Given</th>
                    <th style={{ padding: '0.9rem 1rem' }}>Final Paid</th>
                    <th style={{ padding: '0.9rem 1rem' }}>Redeemed At</th>
                  </tr>
                </thead>
                <tbody>
                  {couponUsages.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No coupon redemptions recorded yet. Redemptions appear here upon checkout.
                      </td>
                    </tr>
                  ) : (
                    couponUsages.map((usage) => (
                      <tr key={usage.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.9rem 1rem', color: 'var(--text-muted)' }}>#{usage.id}</td>
                        <td style={{ padding: '0.9rem 1rem', fontWeight: '600', color: '#fff' }}>{usage.customerUsername || 'Customer'}</td>
                        <td style={{ padding: '0.9rem 1rem', color: 'var(--gold)' }}>Order #{usage.orderId}</td>
                        <td style={{ padding: '0.9rem 1rem' }}>
                          <span style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700', fontSize: '0.8rem' }}>
                            {usage.couponCode}
                          </span>
                        </td>
                        <td style={{ padding: '0.9rem 1rem' }}>₹{Number(usage.cartAmount || 0).toLocaleString()}</td>
                        <td style={{ padding: '0.9rem 1rem', color: '#22c55e', fontWeight: '700' }}>
                          -₹{Number(usage.discountAmount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.9rem 1rem', fontWeight: '700', color: 'var(--gold)' }}>
                          ₹{Number(usage.finalAmount || 0).toLocaleString()}
                        </td>
                        <td style={{ padding: '0.9rem 1rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
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
        </div>
      )}

      {/* CREATE COUPON MODAL */}
      {showCouponModal && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 1100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1.5rem'
          }}
          onClick={() => setShowCouponModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-focus)',
              borderRadius: 'var(--radius-card)',
              maxWidth: '520px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--gold)', margin: 0 }}>
                🎟️ Create New Promotion / Coupon
              </h2>
              <button
                onClick={() => setShowCouponModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '1.4rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {couponFormError && (
              <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem' }}>
                ⚠️ {couponFormError}
              </div>
            )}

            <form onSubmit={handleCreateCoupon}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '600' }}>
                  Coupon Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SAVE20, FESTIVE500"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                />
              </div>

              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '600' }}>
                    Discount Type *
                  </label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }}
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT_AMOUNT">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: '600' }}>
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder={couponForm.discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 200'}
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Min Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 1000 (Optional)"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Max Discount Cap (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 500 (Optional)"
                    value={couponForm.maxDiscountAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscountAmount: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                  Usage Limit (Total redemptions allowed)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 100 (Leave empty for unlimited)"
                  value={couponForm.usageLimit}
                  onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '0.9rem' }}
                />
              </div>

              <div className="form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Start Date
                  </label>
                  <input
                    type="datetime-local"
                    value={couponForm.startDate}
                    onChange={(e) => setCouponForm({ ...couponForm, startDate: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                    Expiry Date
                  </label>
                  <input
                    type="datetime-local"
                    value={couponForm.expiryDate}
                    onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem 0.85rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="checkbox"
                  id="couponActiveToggle"
                  checked={couponForm.active}
                  onChange={(e) => setCouponForm({ ...couponForm, active: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="couponActiveToggle" style={{ fontSize: '0.9rem', color: '#fff', cursor: 'pointer' }}>
                  Activate immediately upon creation
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  style={{ padding: '0.65rem 1.25rem', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', borderRadius: 'var(--radius-btn)', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingCoupon}
                  style={{ padding: '0.65rem 1.5rem', background: 'var(--gold)', border: 'none', color: '#000', fontWeight: '800', borderRadius: 'var(--radius-btn)', cursor: 'pointer' }}
                >
                  {savingCoupon ? 'Creating...' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* TAB 11: WAREHOUSE & LOGISTICS MANAGEMENT */}
      {activeAdminTab === 'warehouse' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Header Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-card)', padding: '1.25rem 1.5rem', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem', fontWeight: '800' }}>🏭 Warehouse &amp; Fulfillment Operations</h3>
              <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Monitor inventory distribution, assign staff, and track multi-facility fulfillment analytics.</p>
            </div>
            <button
              onClick={() => setShowAddWarehouseForm(true)}
              style={{ padding: '0.65rem 1.25rem', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: 'var(--radius-btn)', fontWeight: '800', cursor: 'pointer' }}
            >
              + Create Warehouse
            </button>
          </div>

          {/* Analytics Summary Grid */}
          <div className="dashboard-grid">
            <div className="info-card">
              <div className="card-icon icon-purple">🏭</div>
              <div className="card-label">Active Facilities</div>
              <div className="card-value" style={{ fontSize: '1.6rem', fontWeight: '800' }}>{warehouseAnalytics?.totalWarehouses || warehouses.length}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Fulfillment Centers</div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-blue">📦</div>
              <div className="card-label">Total Stock Quantity</div>
              <div className="card-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#60a5fa' }}>{warehouseAnalytics?.totalStockUnits?.toLocaleString() || 0}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Across all Warehouses</div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-green">📋</div>
              <div className="card-label">Allocated Orders</div>
              <div className="card-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--gold)' }}>{warehouseAnalytics?.allocatedOrders || 0}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Awaiting Pick/Pack</div>
            </div>

            <div className="info-card">
              <div className="card-icon icon-orange">⚠️</div>
              <div className="card-label">Low Stock Alerts</div>
              <div className="card-value" style={{ fontSize: '1.6rem', fontWeight: '800', color: '#f87171' }}>{warehouseAnalytics?.lowStockItems || 0}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Stock &lt; 10 units</div>
            </div>
          </div>

          {/* Create Warehouse Modal / Form */}
          {showAddWarehouseForm && (
            <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: 'var(--radius-card)', border: '1px solid var(--gold)' }}>
              <h4 style={{ margin: '0 0 1rem', color: 'var(--gold)' }}>➕ Add New Warehouse Facility</h4>
              <form onSubmit={handleCreateWarehouse} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Warehouse Name</label>
                  <input required placeholder="e.g. Mumbai North Hub" value={newWhForm.name} onChange={e => setNewWhForm({...newWhForm, name: e.target.value})} style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Code (Unique)</label>
                  <input required placeholder="e.g. WH-MUM-01" value={newWhForm.code} onChange={e => setNewWhForm({...newWhForm, code: e.target.value})} style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>City</label>
                  <input required placeholder="e.g. Mumbai" value={newWhForm.locationCity} onChange={e => setNewWhForm({...newWhForm, locationCity: e.target.value})} style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Address</label>
                  <input placeholder="Street / Logistics Park" value={newWhForm.address} onChange={e => setNewWhForm({...newWhForm, address: e.target.value})} style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Max Capacity</label>
                  <input type="number" value={newWhForm.capacity} onChange={e => setNewWhForm({...newWhForm, capacity: Number(e.target.value)})} style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Contact Phone</label>
                  <input placeholder="+91 9876543210" value={newWhForm.contactNumber} onChange={e => setNewWhForm({...newWhForm, contactNumber: e.target.value})} style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff' }} />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowAddWarehouseForm(false)} style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={savingWh} style={{ padding: '0.5rem 1.25rem', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>{savingWh ? 'Saving...' : 'Save Warehouse'}</button>
                </div>
              </form>
            </div>
          )}

          {/* Facilities List & Inventory Explorer */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)', overflow: 'hidden' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, color: '#fff', fontSize: '1rem' }}>🏢 Managed Warehouse Facilities</h4>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Click "View Inventory" to inspect stock allocation</span>
            </div>
            <div className="table-responsive">
            <table style={{ width: '100%', minWidth: '780px', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Code</th>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Facility Name</th>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Location</th>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Assigned Staff</th>
                  <th style={{ padding: '0.75rem 1.25rem' }}>Capacity</th>
                  <th style={{ padding: '0.75rem 1.25rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {warehouses.map(wh => {
                  const staffForWh = warehouseStaff.filter(s => s.assignedWarehouseId === wh.id)
                  return (
                    <tr key={wh.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.85rem 1.25rem', fontWeight: '700', color: 'var(--gold)' }}>{wh.code}</td>
                      <td style={{ padding: '0.85rem 1.25rem', color: '#fff', fontWeight: '600' }}>{wh.name}</td>
                      <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)' }}>📍 {wh.locationCity}</td>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        {staffForWh.length > 0 ? (
                          staffForWh.map(s => <span key={s.id} className="badge badge-purple" style={{ marginRight: '0.25rem' }}>{s.name}</span>)
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1.25rem', color: 'var(--text-secondary)' }}>{wh.capacity?.toLocaleString()} units</td>
                      <td style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>
                        <button
                          onClick={() => loadWhInventory(wh.id)}
                          style={{ padding: '0.4rem 0.85rem', background: selectedWhInventory === wh.id ? 'var(--gold)' : 'var(--bg-secondary)', color: selectedWhInventory === wh.id ? '#000' : 'var(--gold)', border: '1px solid var(--gold)', borderRadius: '6px', fontWeight: '700', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          {selectedWhInventory === wh.id ? 'Viewing Inventory' : 'View Inventory'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            </div>
          </div>

          {/* Selected Facility Stock Inventory Breakdown */}
          {selectedWhInventory && (
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)', padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--gold)', fontSize: '1.1rem' }}>
                    📦 Stock Inventory for {warehouses.find(w => w.id === selectedWhInventory)?.name || `Warehouse #${selectedWhInventory}`}
                  </h4>
                  <p style={{ margin: '0.2rem 0 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Inspect available units or add product inventory to this facility.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setShowAdminInwardModal(true)}
                    style={{ padding: '0.5rem 1rem', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    + Add Product Stock
                  </button>
                  <button onClick={() => { setSelectedWhInventory(null); setShowAdminInwardModal(false); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem' }}>✖</button>
                </div>
              </div>

              {/* Admin Stock Inward Form */}
              {showAdminInwardModal && (
                <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: '10px', border: '1px solid var(--gold)', marginBottom: '1.25rem' }}>
                  <h5 style={{ margin: '0 0 0.75rem', color: 'var(--gold)', fontSize: '0.95rem' }}>📥 Inward Product Stock to Facility</h5>
                  <form onSubmit={handleAdminInwardStock} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Select Product</label>
                      <select
                        required
                        value={adminInwardForm.productId}
                        onChange={e => setAdminInwardForm({ ...adminInwardForm, productId: e.target.value })}
                        style={{ width: '100%', padding: '0.55rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      >
                        <option value="">-- Choose Product from Catalog --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.title} ({p.sku || `ID #${p.id}`})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Quantity to Add</label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={adminInwardForm.quantity}
                        onChange={e => setAdminInwardForm({ ...adminInwardForm, quantity: e.target.value })}
                        style={{ width: '100%', padding: '0.55rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Aisle / Bin Location</label>
                      <input
                        placeholder="e.g. Aisle A-01"
                        value={adminInwardForm.aisleBin}
                        onChange={e => setAdminInwardForm({ ...adminInwardForm, aisleBin: e.target.value })}
                        style={{ width: '100%', padding: '0.55rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Movement Note</label>
                      <input
                        placeholder="e.g. Stock replenishment batch #1"
                        value={adminInwardForm.note}
                        onChange={e => setAdminInwardForm({ ...adminInwardForm, note: e.target.value })}
                        style={{ width: '100%', padding: '0.55rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
                      />
                    </div>

                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                      <button type="button" onClick={() => setShowAdminInwardModal(false)} style={{ padding: '0.45rem 0.85rem', background: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                      <button type="submit" disabled={adminInwardLoading} style={{ padding: '0.45rem 1.1rem', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}>
                        {adminInwardLoading ? 'Adding...' : 'Add Stock Now'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {whLoading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading inventory...</p>
              ) : whInventory.length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ margin: '0 0 0.5rem' }}>No stock registered in this warehouse facility yet.</p>
                  <button onClick={() => setShowAdminInwardModal(true)} style={{ padding: '0.5rem 1rem', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>+ Add First Product Stock</button>
                </div>
              ) : (
                <div className="table-responsive">
                <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                      <th style={{ padding: '0.6rem 1rem' }}>Product</th>
                      <th style={{ padding: '0.6rem 1rem' }}>Physical Quantity</th>
                      <th style={{ padding: '0.6rem 1rem' }}>Reserved</th>
                      <th style={{ padding: '0.6rem 1rem' }}>Available</th>
                      <th style={{ padding: '0.6rem 1rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {whInventory.map(item => {
                      const available = (item.quantity || 0) - (item.reservedQuantity || 0)
                      return (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '0.6rem 1rem', color: '#fff', fontWeight: '600' }}>{item.productName || `Product #${item.productId}`}</td>
                          <td style={{ padding: '0.6rem 1rem', color: '#fff' }}>{item.quantity}</td>
                          <td style={{ padding: '0.6rem 1rem', color: 'var(--gold)' }}>{item.reservedQuantity || 0}</td>
                          <td style={{ padding: '0.6rem 1rem', fontWeight: '700', color: available > 5 ? '#4ade80' : '#f87171' }}>{available}</td>
                          <td style={{ padding: '0.6rem 1rem' }}>
                            {available > 5 ? <span className="badge badge-green">In Stock</span> : <span className="badge badge-red">Low Stock</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                </div>
              )}
            </div>
          )}

          {/* Staff Assignment Panel */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-card)', border: '1px solid var(--border)', padding: '1.25rem 1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem', color: '#fff' }}>👥 Warehouse Staff Role Assignments</h4>

            {/* Quick Assign Bar */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.25rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--gold)', fontWeight: '700' }}>➕ Assign User to Warehouse:</span>
              <select
                value={selectedUserForAssign}
                onChange={(e) => setSelectedUserForAssign(e.target.value)}
                style={{ flex: 1, minWidth: '200px', padding: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
              >
                <option value="">-- Choose Registered User --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.username} ({u.email}) - {u.role}</option>
                ))}
              </select>

              <select
                value={selectedWhForAssign}
                onChange={(e) => setSelectedWhForAssign(e.target.value)}
                style={{ flex: 1, minWidth: '200px', padding: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '0.85rem' }}
              >
                <option value="">-- Choose Warehouse Facility --</option>
                {warehouses.map(w => (
                  <option key={w.id} value={w.id}>{w.code} - {w.name} ({w.locationCity})</option>
                ))}
              </select>

              <button
                onClick={handleQuickAssign}
                style={{ padding: '0.5rem 1.25rem', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Assign Staff
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {warehouseStaff.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', gridColumn: '1 / -1' }}>No warehouse staff assigned yet. Use the dropdown above to assign a user.</div>
              ) : (
                warehouseStaff.map(staff => (
                  <div key={staff.id} style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ color: '#fff', fontWeight: '700' }}>{staff.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{staff.email}</div>
                      <div style={{ color: 'var(--gold)', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                        Assigned: {staff.assignedWarehouseId ? warehouses.find(w => w.id === staff.assignedWarehouseId)?.name || `WH #${staff.assignedWarehouseId}` : 'Unassigned'}
                      </div>
                    </div>
                    <select
                      value={staff.assignedWarehouseId || ''}
                      onChange={(e) => handleAssignStaff(staff.id, e.target.value ? Number(e.target.value) : null)}
                      style={{ padding: '0.4rem', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff', fontSize: '0.8rem' }}
                    >
                      <option value="">-- Unassigned --</option>
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const tabStyle = {
  background: 'transparent',
  border: 'none',
  color: 'var(--text-secondary)',
  padding: '0.5rem 1rem',
  cursor: 'pointer',
  fontWeight: '600',
  fontSize: '0.9rem',
  whiteSpace: 'nowrap',
  flexShrink: 0
}

const activeTabStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-focus)',
  color: 'var(--gold)',
  padding: '0.5rem 1rem',
  borderRadius: 'var(--radius-btn)',
  cursor: 'pointer',
  fontWeight: '800',
  fontSize: '0.9rem',
  whiteSpace: 'nowrap',
  flexShrink: 0
}
