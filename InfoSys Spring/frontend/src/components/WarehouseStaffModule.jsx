import { useState, useEffect } from 'react'
import WarehouseService from '../services/WarehouseService'
import AuthService from '../services/AuthService'
import ProductService from '../services/ProductService'


/* ───────────────────────── helpers ───────────────────────── */
const statusColor = {
  ALLOCATED: '#F59E0B',
  PICKED:    '#3B82F6',
  PACKED:    '#8B5CF6',
  SHIPPED:   '#10B981',
  DELIVERED: '#16A34A',
}

const movTypeIcon = {
  INWARD_STOCK:      '📥',
  ALLOCATED:         '🔒',
  PICKED:            '🤚',
  PACKED:            '📦',
  SHIPPED:           '🚚',
  RETURN_RESTOCK:    '↩️',
  CANCELLED_RESTOCK: '❌',
  MANUAL_ADJUSTMENT: '✏️',
}

const fmt = (dt) => dt ? new Date(dt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'
const rupee = (v) => v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '—'

/* ═══════════════════════════════════════════════════════════════
   SHIPMENT MODAL
═══════════════════════════════════════════════════════════════ */
function ShipmentModal({ order, staffId, staffName, onConfirm, onClose }) {
  const [carrier, setCarrier] = useState('BlueDart Express')
  const [tracking, setTracking] = useState(`TRK-${Date.now()}`)
  const [loading, setLoading] = useState(false)

  const carriers = ['BlueDart Express', 'Delhivery', 'DTDC', 'India Post', 'Ekart Logistics', 'XpressBees', 'Shadowfax']

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm(order.id, carrier, tracking, staffId, staffName)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border-focus)',
        borderRadius: 'var(--radius-card)', padding: '2rem', width: '480px', maxWidth: '95vw'
      }}>
        <h2 style={{ color: '#fff', fontFamily: 'Manrope,sans-serif', marginBottom: '0.5rem', fontSize: '1.3rem' }}>
          🚚 Prepare Shipment
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Order #{order.id} · {order.customerName}
        </p>

        <label style={{ display: 'block', marginBottom: '0.75rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Logistics Carrier
          </span>
          <select
            value={carrier}
            onChange={e => setCarrier(e.target.value)}
            style={{
              display: 'block', width: '100%', marginTop: '0.4rem',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: '#fff', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-input)',
              fontSize: '0.95rem', cursor: 'pointer'
            }}
          >
            {carriers.map(c => <option key={c}>{c}</option>)}
          </select>
        </label>

        <label style={{ display: 'block', marginBottom: '1.5rem' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Tracking Number
          </span>
          <input
            value={tracking}
            onChange={e => setTracking(e.target.value)}
            style={{
              display: 'block', width: '100%', marginTop: '0.4rem',
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              color: '#fff', padding: '0.6rem 0.9rem', borderRadius: 'var(--radius-input)',
              fontSize: '0.95rem', boxSizing: 'border-box'
            }}
          />
        </label>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            color: 'var(--text-secondary)', padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-btn)', cursor: 'pointer', fontWeight: '600'
          }}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            style={{
              background: 'linear-gradient(135deg, #10B981, #059669)',
              border: 'none', color: '#fff', padding: '0.6rem 1.5rem',
              borderRadius: 'var(--radius-btn)', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: '700', opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Dispatching...' : '🚚 Confirm Shipment'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   ORDER CARD
═══════════════════════════════════════════════════════════════ */
function OrderCard({ order, staffId, staffName, onRefresh }) {
  const [actionLoading, setActionLoading] = useState('')
  const [showShipModal, setShowShipModal] = useState(false)

  async function doPick() {
    setActionLoading('pick')
    try {
      await WarehouseService.pickOrder(order.id, staffId, staffName)
      await onRefresh()
    } catch (err) {
      alert('Pick failed: ' + (err.response?.data?.message || err.message))
    } finally { setActionLoading('') }
  }

  async function doPack() {
    setActionLoading('pack')
    try {
      await WarehouseService.packOrder(order.id, staffId, staffName)
      await onRefresh()
    } catch (err) {
      alert('Pack failed: ' + (err.response?.data?.message || err.message))
    } finally { setActionLoading('') }
  }

  async function doShip(orderId, carrier, tracking) {
    try {
      await WarehouseService.shipOrder(orderId, carrier, tracking, staffId, staffName)
      setShowShipModal(false)
      await onRefresh()
    } catch (err) {
      alert('Ship failed: ' + (err.response?.data?.message || err.message))
    }
  }

  const st = order.status
  const color = statusColor[st] || 'var(--text-muted)'

  return (
    <>
      <div style={{
        background: 'var(--bg-card)',
        border: `1px solid ${st === 'ALLOCATED' ? 'rgba(245,158,11,0.35)' : st === 'PICKED' ? 'rgba(59,130,246,0.35)' : st === 'PACKED' ? 'rgba(139,92,246,0.35)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-card)', padding: '1.5rem',
        transition: 'var(--transition)', marginBottom: '1rem',
        boxShadow: `0 0 20px ${st === 'ALLOCATED' ? 'rgba(245,158,11,0.06)' : 'rgba(0,0,0,0.3)'}`
      }}>
        {/* Header Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <span style={{ color: 'var(--gold)', fontWeight: '800', fontSize: '1rem' }}>Order #{order.id}</span>
            <span style={{ marginLeft: '0.75rem', background: `${color}22`, color, border: `1px solid ${color}55`,
              padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>
              {st}
            </span>
          </div>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{fmt(order.createdAt)}</span>
        </div>

        {/* Customer & Warehouse */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Customer</span>
            <p style={{ color: '#fff', fontWeight: '600', margin: '2px 0 0' }}>{order.customerName || '—'}</p>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Amount</span>
            <p style={{ color: 'var(--gold)', fontWeight: '700', margin: '2px 0 0' }}>{rupee(order.totalAmount)}</p>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Ship To</span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '2px 0 0' }}>{order.shippingAddress || '—'}</p>
          </div>
        </div>

        {/* Items */}
        {order.items && order.items.length > 0 && (
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '12px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Items to {st === 'ALLOCATED' ? 'Pick' : st === 'PICKED' ? 'Pack' : 'Ship'}
            </span>
            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#fff', fontSize: '0.9rem' }}>📍 {item.productName}</span>
                  <span style={{
                    background: 'rgba(212,175,55,0.15)', color: 'var(--gold)',
                    padding: '2px 10px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: '700'
                  }}>
                    Qty: {item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timestamps / Staff Info */}
        {st === 'PICKED' && order.pickedByStaffName && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
            ✅ Picked by {order.pickedByStaffName} at {fmt(order.pickedAt)}
          </p>
        )}
        {st === 'PACKED' && order.packedByStaffName && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
            📦 Packed by {order.packedByStaffName} at {fmt(order.packedAt)}
          </p>
        )}
        {st === 'SHIPPED' && (
          <p style={{ color: '#10B981', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
            🚚 Shipped via {order.carrierName} · Tracking: {order.trackingNumber}
          </p>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {st === 'ALLOCATED' && (
            <button
              id={`btn-pick-${order.id}`}
              onClick={doPick}
              disabled={actionLoading === 'pick'}
              style={{
                background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                border: 'none', color: '#000', padding: '0.6rem 1.4rem',
                borderRadius: 'var(--radius-btn)', cursor: actionLoading ? 'not-allowed' : 'pointer',
                fontWeight: '800', fontSize: '0.9rem', opacity: actionLoading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              {actionLoading === 'pick' ? '⏳ Picking...' : '✅ Start Picking'}
            </button>
          )}

          {st === 'PICKED' && (
            <button
              id={`btn-pack-${order.id}`}
              onClick={doPack}
              disabled={actionLoading === 'pack'}
              style={{
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                border: 'none', color: '#fff', padding: '0.6rem 1.4rem',
                borderRadius: 'var(--radius-btn)', cursor: actionLoading ? 'not-allowed' : 'pointer',
                fontWeight: '800', fontSize: '0.9rem', opacity: actionLoading ? 0.7 : 1,
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              {actionLoading === 'pack' ? '⏳ Packing...' : '📦 Mark as Packed'}
            </button>
          )}

          {st === 'PACKED' && (
            <button
              id={`btn-ship-${order.id}`}
              onClick={() => setShowShipModal(true)}
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                border: 'none', color: '#fff', padding: '0.6rem 1.4rem',
                borderRadius: 'var(--radius-btn)', cursor: 'pointer',
                fontWeight: '800', fontSize: '0.9rem',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              🚚 Prepare Shipment
            </button>
          )}
        </div>
      </div>

      {showShipModal && (
        <ShipmentModal
          order={order}
          staffId={staffId}
          staffName={staffName}
          onConfirm={doShip}
          onClose={() => setShowShipModal(false)}
        />
      )}
    </>
  )
}
export default function WarehouseStaffModule() {
  const user = AuthService.getCurrentUser()
  const staffId = user?.id
  const staffName = user?.fullName || user?.username || 'Staff'
  const warehouseId = user?.assignedWarehouseId
  const warehouseName = user?.assignedWarehouseName || 'Your Warehouse'

  const [activeTab, setActiveTab] = useState('orders')
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState([])
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [actionError, setActionError] = useState('')
  const [inwardError, setInwardError] = useState('')
  const [inwardSuccess, setInwardSuccess] = useState('')

  const [showInwardModal, setShowInwardModal] = useState(false)
  const [productList, setProductList] = useState([])
  const [inwardForm, setInwardForm] = useState({ productId: '', quantity: 50, aisleBin: 'Aisle A-01', note: 'Initial stock inward' })
  const [inwardLoading, setInwardLoading] = useState(false)

  async function loadAll() {
    setLoading(true)
    setLoadError('')
    try {
      const [ord, inv, mov, prods] = await Promise.all([
        WarehouseService.getActiveOrders(warehouseId).catch(e => { console.warn('Active orders load err:', e); return []; }),
        warehouseId ? WarehouseService.getInventory(warehouseId).catch(e => { console.warn('Inventory load err:', e); return []; }) : Promise.resolve([]),
        WarehouseService.getStockMovements(warehouseId).catch(e => { console.warn('Movements load err:', e); return []; }),
        ProductService.getAllProducts().catch(e => { console.warn('Product catalog load err:', e); return []; })
      ])
      setOrders(ord || [])
      setInventory(inv || [])
      setMovements(mov || [])
      setProductList(prods || [])
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load warehouse data.'
      setLoadError(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleInwardStock(e) {
    e.preventDefault()
    if (!inwardForm.productId) { alert('Please select a product'); return }
    if (!warehouseId) { alert('No warehouse assigned to your staff account'); return }
    setInwardLoading(true)
    setInwardError('')
    setInwardSuccess('')
    try {
      await WarehouseService.inwardStock(warehouseId, {
        productId: Number(inwardForm.productId),
        quantity: Number(inwardForm.quantity),
        staffId: staffId || 1,
        staffName: staffName,
        aisleBin: inwardForm.aisleBin,
        note: inwardForm.note
      })
      setInwardSuccess('Product stock successfully added to warehouse!')
      setTimeout(() => {
        setShowInwardModal(false)
        setInwardSuccess('')
      }, 1500)
      setInwardForm({ productId: '', quantity: 50, aisleBin: 'Aisle A-01', note: 'Stock replenishment' })
      loadAll()
    } catch (err) {
      setInwardError('Failed to inward stock: ' + (err.response?.data?.message || err.message))
    } finally { setInwardLoading(false) }
  }

  async function refreshOrders() {
    setRefreshing(true)
    try {
      const ord = await WarehouseService.getActiveOrders(warehouseId).catch(() => [])
      setOrders(ord || [])
      const mov = await WarehouseService.getStockMovements(warehouseId).catch(() => [])
      setMovements(mov || [])
    } catch (err) {
      console.error('Refresh failed:', err)
    } finally { setRefreshing(false) }
  }

  useEffect(() => { loadAll() }, [warehouseId])

  const allocated = orders.filter(o => o.status === 'ALLOCATED')
  const picked    = orders.filter(o => o.status === 'PICKED')
  const packed    = orders.filter(o => o.status === 'PACKED')

  const tabStyle = (t) => ({
    background: activeTab === t ? 'var(--bg-card)' : 'transparent',
    border: activeTab === t ? '1px solid var(--border-focus)' : '1px solid transparent',
    color: activeTab === t ? 'var(--gold)' : 'var(--text-secondary)',
    padding: '0.55rem 1.25rem', borderRadius: 'var(--radius-btn)',
    cursor: 'pointer', fontWeight: activeTab === t ? '700' : '500',
    fontSize: '0.9rem', transition: 'var(--transition)',
    boxShadow: activeTab === t ? 'var(--shadow-gold)' : 'none',
  })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--gold)', fontSize: '1.1rem' }}>
      ⏳ Loading warehouse data...
    </div>
  )

  if (loadError) return (
    <div className="banner-error" style={{ margin: '2rem 0' }}>
      ⚠️ {loadError}
      <button onClick={loadAll} style={{ marginLeft: '1rem', background: 'none', border: '1px solid #F87171', color: '#F87171', padding: '0.3rem 0.75rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}>Retry</button>
    </div>
  )

  if (!warehouseId) return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏭</div>
      <h2 style={{ color: '#fff', fontFamily: 'Manrope,sans-serif' }}>No Warehouse Assigned</h2>
      <p style={{ color: 'var(--text-secondary)' }}>Please contact an Administrator to assign you to a warehouse.</p>
    </div>
  )

  return (
    <div style={{ padding: '1.5rem 0' }}>

      {/* ── Header ── */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(10,10,10,0.98) 100%)',
        border: '1px solid rgba(59,130,246,0.3)', borderRadius: 'var(--radius-card)',
        padding: '2rem', marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ color: '#60A5FA', fontWeight: '800', fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Warehouse Operations
              </span>
              <span style={{ background: 'rgba(59,130,246,0.2)', color: '#93C5FD', border: '1px solid rgba(59,130,246,0.4)',
                padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>
                STAFF PORTAL
              </span>
            </div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: '800', color: '#fff', fontFamily: 'Manrope,sans-serif', margin: '0 0 0.4rem' }}>
              🏭 {warehouseName}
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
              Welcome back, <strong style={{ color: '#fff' }}>{staffName}</strong> · Manage your order fulfilment queue below
            </p>
          </div>

          {/* Stats pills */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { label: 'To Pick', count: allocated.length, color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
              { label: 'To Pack', count: picked.length,    color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
              { label: 'To Ship', count: packed.length,    color: '#8B5CF6', bg: 'rgba(139,92,246,0.15)' },
            ].map(s => (
              <div key={s.label} style={{
                background: s.bg, border: `1px solid ${s.color}55`,
                borderRadius: '14px', padding: '0.5rem 1rem', textAlign: 'center'
              }}>
                <div style={{ color: s.color, fontWeight: '800', fontSize: '1.4rem', lineHeight: 1 }}>{s.count}</div>
                <div style={{ color: s.color, fontSize: '0.7rem', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{s.label}</div>
              </div>
            ))}

            <button
              id="btn-refresh-orders"
              onClick={refreshOrders}
              disabled={refreshing}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-btn)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'
              }}
            >
              {refreshing ? '⏳' : '🔄'} Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <button id="staff-tab-orders"    style={tabStyle('orders')}    onClick={() => setActiveTab('orders')}>    📋 Order Queue ({orders.length})</button>
        <button id="staff-tab-inventory" style={tabStyle('inventory')} onClick={() => setActiveTab('inventory')}> 📦 Inventory ({inventory.length})</button>
        <button id="staff-tab-movements" style={tabStyle('movements')} onClick={() => setActiveTab('movements')}> 🔄 Stock Movements ({movements.length})</button>
      </div>

      {/* ════════════════════════════════════
          TAB: ORDER QUEUE
      ════════════════════════════════════ */}
      {activeTab === 'orders' && (
        <div>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ color: '#fff', fontFamily: 'Manrope,sans-serif' }}>All caught up!</h3>
              <p style={{ color: 'var(--text-secondary)' }}>No pending orders in your warehouse queue right now.</p>
            </div>
          ) : (
            <>
              {/* Pipeline summary banner */}
              <div style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '1rem 1.5rem', marginBottom: '1.5rem',
                display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center'
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Fulfilment Pipeline
                </span>
                {[
                  { label: '📍 Allocated', count: allocated.length, color: '#F59E0B' },
                  { label: '🤚 Picked', count: picked.length, color: '#3B82F6' },
                  { label: '📦 Packed', count: packed.length, color: '#8B5CF6' },
                ].map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: s.color, fontWeight: '700' }}>{s.count}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Allocated */}
              {allocated.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: '#F59E0B', fontFamily: 'Manrope,sans-serif', fontSize: '0.9rem',
                    letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    📍 To Pick ({allocated.length})
                  </h3>
                  {allocated.map(o => <OrderCard key={o.id} order={o} staffId={staffId} staffName={staffName} onRefresh={refreshOrders} />)}
                </div>
              )}

              {/* Picked */}
              {picked.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ color: '#3B82F6', fontFamily: 'Manrope,sans-serif', fontSize: '0.9rem',
                    letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    🤚 To Pack ({picked.length})
                  </h3>
                  {picked.map(o => <OrderCard key={o.id} order={o} staffId={staffId} staffName={staffName} onRefresh={refreshOrders} />)}
                </div>
              )}

              {/* Packed */}
              {packed.length > 0 && (
                <div>
                  <h3 style={{ color: '#8B5CF6', fontFamily: 'Manrope,sans-serif', fontSize: '0.9rem',
                    letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                    📦 Ready to Ship ({packed.length})
                  </h3>
                  {packed.map(o => <OrderCard key={o.id} order={o} staffId={staffId} staffName={staffName} onRefresh={refreshOrders} />)}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ════════════════════════════════════
          TAB: INVENTORY
      ════════════════════════════════════ */}
      {activeTab === 'inventory' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#fff', fontFamily: 'Manrope,sans-serif', margin: 0, fontSize: '1.1rem' }}>
              📦 {warehouseName} — Product Inventory
            </h3>
            <button
              onClick={() => setShowInwardModal(true)}
              style={{
                background: 'var(--gold)', color: '#000', border: 'none',
                padding: '0.6rem 1.25rem', borderRadius: 'var(--radius-btn)',
                fontWeight: '800', cursor: 'pointer', fontSize: '0.85rem'
              }}
            >
              + Inward Stock / Add Product
            </button>
          </div>

          {showInwardModal && (
            <div style={{
              background: 'var(--bg-card)', border: '1px solid var(--gold)',
              borderRadius: 'var(--radius-card)', padding: '1.5rem', marginBottom: '1.5rem'
            }}>
              <h4 style={{ margin: '0 0 1rem', color: 'var(--gold)' }}>📥 Add Stock / Receive Product Shipment</h4>
              {inwardError && <div className="banner-error" style={{ marginBottom: '1rem' }}>\u26a0\ufe0f {inwardError}</div>}
              {inwardSuccess && <div className="banner-success" style={{ marginBottom: '1rem' }}>✅ {inwardSuccess}</div>}
              <form onSubmit={handleInwardStock} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Select Product</label>
                  <select
                    required
                    value={inwardForm.productId}
                    onChange={e => setInwardForm({...inwardForm, productId: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff' }}
                  >
                    <option value="">-- Choose Product from Catalog --</option>
                    {productList.map(p => (
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
                    value={inwardForm.quantity}
                    onChange={e => setInwardForm({...inwardForm, quantity: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Aisle / Bin Location</label>
                  <input
                    placeholder="e.g. Aisle B-04"
                    value={inwardForm.aisleBin}
                    onChange={e => setInwardForm({...inwardForm, aisleBin: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Movement Note</label>
                  <input
                    placeholder="e.g. Supplier Inward Batch #102"
                    value={inwardForm.note}
                    onChange={e => setInwardForm({...inwardForm, note: e.target.value})}
                    style={{ width: '100%', padding: '0.6rem', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', color: '#fff' }}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowInwardModal(false)} style={{ padding: '0.5rem 1rem', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={inwardLoading} style={{ padding: '0.5rem 1.25rem', background: 'var(--gold)', color: '#000', border: 'none', borderRadius: '6px', fontWeight: '800', cursor: 'pointer' }}>
                    {inwardLoading ? 'Saving...' : 'Confirm Inward Stock'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {inventory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No inventory data available in this warehouse yet. Use "+ Inward Stock" above to add products.</div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      {['Product', 'SKU', 'Available', 'Reserved', 'Effective', 'Bin Location', 'Status'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left',
                          color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em',
                          textTransform: 'uppercase', fontWeight: '600', borderBottom: '1px solid var(--border)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item, i) => {
                      const effective = (item.availableQuantity || 0) - (item.reservedQuantity || 0)
                      const isLow = effective <= (item.reorderThreshold || 10)
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '0.85rem 1rem', color: '#fff', fontWeight: '600' }}>{item.productName}</td>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.productSku}</td>
                          <td style={{ padding: '0.85rem 1rem', color: '#fff', fontWeight: '700' }}>{item.availableQuantity}</td>
                          <td style={{ padding: '0.85rem 1rem', color: '#F59E0B' }}>{item.reservedQuantity}</td>
                          <td style={{ padding: '0.85rem 1rem', color: effective > 0 ? '#10B981' : '#DC2626', fontWeight: '700' }}>{Math.max(0, effective)}</td>
                          <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                            {item.aisleBinLocation || '—'}
                          </td>
                          <td style={{ padding: '0.85rem 1rem' }}>
                            {isLow
                              ? <span style={{ background: 'rgba(220,38,38,0.18)', color: '#F87171', border: '1px solid rgba(220,38,38,0.4)',
                                  padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>⚠️ Low Stock</span>
                              : <span style={{ background: 'rgba(22,163,74,0.15)', color: '#4ADE80', border: '1px solid rgba(22,163,74,0.3)',
                                  padding: '2px 10px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: '700' }}>✅ OK</span>
                            }
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════
          TAB: STOCK MOVEMENTS
      ════════════════════════════════════ */}
      {activeTab === 'movements' && (
        <div>
          {movements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No stock movements recorded yet</div>
          ) : (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ color: '#fff', fontFamily: 'Manrope,sans-serif', margin: 0, fontSize: '1rem' }}>
                  🔄 Stock Movement Ledger
                </h3>
              </div>
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary)' }}>
                      {['Type', 'Product', 'Qty Change', 'Order', 'By', 'Note', 'Time'].map(h => (
                        <th key={h} style={{ padding: '0.75rem 1rem', textAlign: 'left',
                          color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.1em',
                          textTransform: 'uppercase', fontWeight: '600', borderBottom: '1px solid var(--border)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {movements.map((m, i) => {
                      const positive = (m.quantityChange || 0) > 0
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}
                          onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '0.75rem 1rem' }}>
                            <span style={{ background: 'var(--bg-secondary)', padding: '3px 10px', borderRadius: '999px',
                              fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                              {movTypeIcon[m.movementType] || '📋'} {m.movementType?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: '#fff', fontWeight: '600', fontSize: '0.88rem' }}>{m.productName}</td>
                          <td style={{ padding: '0.75rem 1rem', fontWeight: '800',
                            color: m.quantityChange === 0 ? 'var(--text-muted)' : positive ? '#4ADE80' : '#F87171' }}>
                            {m.quantityChange === 0 ? '—' : (positive ? '+' : '') + m.quantityChange}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--gold)', fontSize: '0.85rem' }}>
                            {m.orderId ? `#${m.orderId}` : '—'}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{m.performedByStaffName || '—'}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.78rem', maxWidth: '200px' }}>
                            {m.note || '—'}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                            {fmt(m.createdAt)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
