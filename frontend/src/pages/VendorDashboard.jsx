import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { vendorApi, productApi, categoryApi, orderApi, commissionApi, warehouseApi } from '../api';
import { getErrorMessage } from '../api/axios';
import AddProductModal from '../components/AddProductModal';
import UpdateStockModal from '../components/UpdateStockModal';
import {
  Store, Plus, Package, DollarSign, TrendingUp, AlertTriangle, Trash2,
  CheckCircle, RefreshCw, ShoppingBag, Edit3, MapPin, Percent, CreditCard,
  PieChart, Layers, CheckCircle2, X
} from 'lucide-react';

const VendorDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [activeTab, setActiveTab] = useState('CATALOG'); // 'CATALOG' | 'ORDERS' | 'EARNINGS'
  
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState(null);
  const [selectedDistributeProduct, setSelectedDistributeProduct] = useState(null);
  const [distributeForm, setDistributeForm] = useState({
    warehouseId: '',
    quantity: 10,
    aisleLocation: 'Aisle 01, Inbound Shelf',
    notes: 'Vendor stock batch distribution'
  });
  const [distributeLoading, setDistributeLoading] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profRes, catsRes, whRes] = await Promise.all([
        vendorApi.getMyProfile().catch(() => ({ data: null })),
        categoryApi.getAll().catch(() => ({ data: [] })),
        warehouseApi.getAll().catch(() => ({ data: [] })),
      ]);
      setProfile(profRes.data);
      setCategories(catsRes.data);
      setWarehouses(whRes.data || []);

      if (profRes.data?.id) {
        const [prodsRes, ordsRes, commsRes, allocsRes] = await Promise.all([
          productApi.getByVendor(profRes.data.id),
          orderApi.getByVendor(profRes.data.id).catch(() => ({ data: [] })),
          commissionApi.getByVendor(profRes.data.id).catch(() => ({ data: [] })),
          warehouseApi.getAllocations().catch(() => ({ data: [] })),
        ]);
        setProducts(prodsRes.data || []);
        setOrders(ordsRes.data || []);
        setCommissions(commsRes.data || []);
        setAllocations(allocsRes.data || []);
      }
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to fetch vendor portal data.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to remove this product listing?')) {
      try {
        await productApi.delete(id);
        showToast('Product listing removed successfully.');
        fetchData();
      } catch (err) {
        showToast(getErrorMessage(err, 'Failed to remove product listing.'), 'error');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await productApi.updateStatus(id, nextStatus);
      showToast(`Product listing status updated to ${nextStatus}.`);
      fetchData();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to update product status.'), 'error');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderApi.updateStatus(orderId, newStatus);
      showToast(`Order status updated to ${newStatus}.`);
      fetchData();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to update order status.'), 'error');
    }
  };

  const handleDistributeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDistributeProduct || !distributeForm.warehouseId) {
      showToast('Please select a destination warehouse hub.', 'error');
      return;
    }
    setDistributeLoading(true);
    try {
      await warehouseApi.transferVendorStock({
        productId: selectedDistributeProduct.id,
        warehouseId: Number(distributeForm.warehouseId),
        quantity: Number(distributeForm.quantity),
        aisleLocation: distributeForm.aisleLocation,
        notes: distributeForm.notes,
        transferredBy: profile?.storeName || 'Vendor Merchant'
      });
      showToast('Stock successfully transferred to warehouse hub!');
      setSelectedDistributeProduct(null);
      fetchData();
    } catch (err) {
      showToast(getErrorMessage(err, 'Failed to distribute stock to warehouse hub.'), 'error');
    } finally {
      setDistributeLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={28} className="spin-icon" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
        <p style={{ fontWeight: 600 }}>Loading Vendor Merchant Portal...</p>
      </div>
    );
  }

  const totalInventory = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);
  const outOfStockCount = products.filter((p) => p.stockQuantity <= 0 || p.status === 'OUT_OF_STOCK').length;

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem' }}>
      
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
          gap: '0.6rem'
        }}>
          {toastMessage.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          {toastMessage.msg}
        </div>
      )}

      {/* Header Banner */}
      <div className="card" style={{ padding: '1.75rem 2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profile?.logoUrl ? <img src={profile.logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Store size={28} color="var(--primary)" />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>{profile?.storeName || 'Vendor Merchant Portal'}</h1>
              <span className="badge badge-customer"><CheckCircle size={12} /> {profile?.status || 'APPROVED'}</span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.2rem' }}>{profile?.description}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={18} /> Add New Product
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Responsive Horizontal Scroll) */}
      <div className="horizontal-scroll-ribbon" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('CATALOG')}
          className={`btn ${activeTab === 'CATALOG' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.88rem', borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap' }}
        >
          <Package size={16} /> Inventory Catalog ({products.length})
        </button>

        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`btn ${activeTab === 'ORDERS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.88rem', borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap' }}
        >
          <ShoppingBag size={16} /> Merchant Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('EARNINGS')}
          className={`btn ${activeTab === 'EARNINGS' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.88rem', borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap' }}
        >
          <CreditCard size={16} /> Earnings & Commissions ({commissions.length})
        </button>
      </div>

      {/* Responsive KPI Stats Grid */}
      <div className="stat-grid-responsive" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Listed SKUs</span>
            <Package size={18} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{products.length}</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Inventory Units</span>
            <TrendingUp size={18} color="#34d399" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>{totalInventory} units</div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Out of Stock</span>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: outOfStockCount > 0 ? '#fca5a5' : '#fff' }}>
            {outOfStockCount} items
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Commission Rate</span>
            <Percent size={18} color="#818cf8" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#818cf8' }}>
            {profile?.commissionRate || 10.0}%
          </div>
        </div>
      </div>

      {/* Tab 1: Catalog Inventory Management */}
      {activeTab === 'CATALOG' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff' }}>Inventory & Product Management</h2>
          </div>

          {products.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No products in your store catalog yet. Click "Add New Product" to start selling.
            </div>
          ) : (
            <div className="table-responsive-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Product & SKU</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Stock Quantity</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const isOut = p.stockQuantity <= 0 || p.status === 'OUT_OF_STOCK';
                    const isLow = p.stockQuantity > 0 && p.stockQuantity < 10;

                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.88rem' }}>
                        <td style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                          <img src={p.imageUrl} alt="" style={{ width: '42px', height: '42px', borderRadius: '6px', objectFit: 'cover', background: '#0f172a' }} />
                          <div>
                            <div style={{ fontWeight: 700, color: '#fff' }}>{p.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {p.sku}</div>
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>{p.category?.name}</td>

                        <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#fff' }}>
                          ₹{p.discountPrice || p.price}
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.92rem', color: isOut ? '#fca5a5' : isLow ? '#fbbf24' : '#34d399' }}>
                              {p.stockQuantity} units
                            </span>

                            {isOut ? (
                              <span className="badge badge-danger" style={{ fontSize: '0.7rem' }}>
                                OUT OF STOCK
                              </span>
                            ) : isLow ? (
                              <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}>LOW STOCK</span>
                            ) : null}
                          </div>
                        </td>

                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span className={`badge ${p.status === 'ACTIVE' ? 'badge-customer' : p.status === 'OUT_OF_STOCK' ? 'badge-danger' : 'badge-warning'}`}>
                            {p.status}
                          </span>
                        </td>

                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => {
                                setSelectedDistributeProduct(p);
                                setDistributeForm({
                                  warehouseId: warehouses[0]?.id || '',
                                  quantity: Math.min(p.stockQuantity || 10, 20),
                                  aisleLocation: 'Aisle 01, Inbound Shelf',
                                  notes: `Vendor batch dispatch for ${p.title}`
                                });
                              }}
                              className="btn btn-primary btn-sm"
                              style={{ fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                              title="Distribute stock to regional warehouse hub"
                            >
                              <Layers size={13} /> Distribute
                            </button>

                            <button
                              onClick={() => setSelectedStockProduct(p)}
                              className="btn btn-secondary btn-sm"
                              title="Update stock quantity"
                            >
                              <Edit3 size={14} /> Stock
                            </button>

                            <button
                              onClick={() => handleToggleStatus(p.id, p.status)}
                              className="btn btn-secondary btn-sm"
                            >
                              {p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="btn btn-danger btn-sm"
                            >
                              <Trash2 size={14} />
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

      {/* Tab 2: Merchant Orders */}
      {activeTab === 'ORDERS' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', marginBottom: '1.25rem' }}>Merchant Order Management</h2>

          {orders.length === 0 ? (
            <div style={{ padding: '4rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No customer orders received yet for your store.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {orders.map((ord) => (
                <div key={ord.id} style={{ padding: '1.25rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        Order #: {ord.orderNumber}
                        <span className={`badge ${ord.paymentMethod === 'COD' || ord.paymentStatus === 'PENDING_COD' ? 'badge-warning' : 'badge-customer'}`} style={{ fontSize: '0.72rem' }}>
                          {ord.paymentMethod === 'COD' ? '🚚 Cash on Delivery' : '💳 Online Payment'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                        Customer: <strong style={{ color: '#fff' }}>{ord.customer?.fullName}</strong> ({ord.customer?.email}) • Payment: <strong>{ord.paymentStatus || (ord.paymentMethod === 'COD' ? 'PENDING_COD' : 'PAID')}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span className={`badge ${ord.status === 'DELIVERED' ? 'badge-customer' : ord.status === 'CANCELLED' ? 'badge-danger' : 'badge-primary'}`}>
                        {ord.status}
                      </span>
                    </div>
                  </div>

                  {/* Items List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                    {ord.items?.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <img src={item.product?.imageUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />
                          <span style={{ color: '#fff', fontWeight: 600 }}>{item.product?.title}</span>
                          <span style={{ color: 'var(--text-muted)' }}>× {item.quantity}</span>
                        </div>
                        <span style={{ fontWeight: 700, color: '#fff' }}>₹{item.subtotal?.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions & Shipping */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <MapPin size={14} color="var(--primary)" /> {ord.shippingAddress}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {ord.status === 'PENDING' && (
                        <button onClick={() => handleOrderStatusUpdate(ord.id, 'CONFIRMED')} className="btn btn-primary btn-sm">
                          Confirm Order
                        </button>
                      )}
                      {ord.status === 'CONFIRMED' && (
                        <button onClick={() => handleOrderStatusUpdate(ord.id, 'PROCESSING')} className="btn btn-primary btn-sm">
                          Process Order
                        </button>
                      )}
                      {ord.status === 'PROCESSING' && (
                        <button onClick={() => handleOrderStatusUpdate(ord.id, 'SHIPPED')} className="btn btn-primary btn-sm">
                          Mark Shipped
                        </button>
                      )}
                      {ord.status === 'SHIPPED' && (
                        <button onClick={() => handleOrderStatusUpdate(ord.id, 'DELIVERED')} className="btn btn-primary btn-sm" style={{ background: '#10b981', borderColor: '#10b981' }}>
                          Mark Delivered
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Earnings & Commissions */}
      {activeTab === 'EARNINGS' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {(() => {
            const totalSales = commissions.reduce((sum, c) => sum + (c.orderAmount || 0), 0);
            const totalCommissionPaid = commissions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
            const netEarnings = commissions.reduce((sum, c) => sum + (c.vendorAmount || 0), 0);

            return (
              <>
                <div className="stat-grid-responsive">
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Gross Sales</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '0.3rem' }}>₹{totalSales.toFixed(2)}</div>
                  </div>
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Platform Fee</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fca5a5', marginTop: '0.3rem' }}>- ₹{totalCommissionPaid.toFixed(2)}</div>
                  </div>
                  <div className="card" style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Net Store Payout</div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34d399', marginTop: '0.3rem' }}>₹{netEarnings.toFixed(2)}</div>
                  </div>
                </div>

                <div className="card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Commission Settlement History</h3>
                  {commissions.length === 0 ? (
                    <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No commission audit records yet.
                    </div>
                  ) : (
                    <div className="table-responsive-wrapper">
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                            <th style={{ padding: '0.75rem 1rem' }}>Order Ref</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Order Amount</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Rate</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Platform Cut</th>
                            <th style={{ padding: '0.75rem 1rem' }}>Net Payout</th>
                            <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {commissions.map(c => (
                            <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.88rem' }}>
                              <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#fff' }}>
                                {c.orderNumber || `ORD-${c.orderId}`}
                              </td>
                              <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                                {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                              <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#fff' }}>
                                ₹{c.orderAmount?.toFixed(2)}
                              </td>
                              <td style={{ padding: '0.85rem 1rem', color: '#818cf8', fontWeight: 700 }}>
                                {c.commissionRate}%
                              </td>
                              <td style={{ padding: '0.85rem 1rem', color: '#fca5a5', fontWeight: 700 }}>
                                - ₹{c.commissionAmount?.toFixed(2)}
                              </td>
                              <td style={{ padding: '0.85rem 1rem', color: '#34d399', fontWeight: 800 }}>
                                ₹{c.vendorAmount?.toFixed(2)}
                              </td>
                              <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                                <span className={`badge ${c.status === 'PAID' || c.status === 'SETTLED' ? 'badge-customer' : c.status === 'CALCULATED' ? 'badge-admin' : c.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '0.72rem' }}>
                                  {c.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            );
          })()}

        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <AddProductModal categories={categories} onClose={() => setShowAddModal(false)} onSuccess={fetchData} />
      )}

      {/* Update Stock Modal */}
      {selectedStockProduct && (
        <UpdateStockModal
          product={selectedStockProduct}
          onClose={() => setSelectedStockProduct(null)}
          onSuccess={fetchData}
        />
      )}

      {/* Distribute to Warehouse Hub Modal */}
      {selectedDistributeProduct && (
        <div className="modal-overlay" onClick={() => setSelectedDistributeProduct(null)}>
          <div className="modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={20} color="var(--primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Distribute Stock to Warehouse Hub
                </h3>
              </div>
              <button
                onClick={() => setSelectedDistributeProduct(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem', borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <img src={selectedDistributeProduct.imageUrl} alt="" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{selectedDistributeProduct.title}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Catalog Stock: <strong>{selectedDistributeProduct.stockQuantity} units</strong></div>
              </div>
            </div>

            <form onSubmit={handleDistributeSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Target Regional Warehouse Hub *</label>
                  <select
                    value={distributeForm.warehouseId}
                    onChange={(e) => setDistributeForm({ ...distributeForm, warehouseId: e.target.value })}
                    required
                    className="input-field"
                    style={{ background: '#0f172a' }}
                  >
                    <option value="">Select Target Warehouse</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.code}) - {w.city}, {w.state}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="input-group">
                    <label className="input-label">Units to Transfer *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={distributeForm.quantity}
                      onChange={(e) => setDistributeForm({ ...distributeForm, quantity: e.target.value })}
                      className="input-field"
                      style={{ background: '#0f172a' }}
                    />
                  </div>
                  <div className="input-group">
                    <label className="input-label">Shelf / Aisle Location</label>
                    <input
                      type="text"
                      placeholder="Aisle 02, Shelf 04"
                      value={distributeForm.aisleLocation}
                      onChange={(e) => setDistributeForm({ ...distributeForm, aisleLocation: e.target.value })}
                      className="input-field"
                      style={{ background: '#0f172a' }}
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Notes / Batch Manifest</label>
                  <input
                    type="text"
                    value={distributeForm.notes}
                    onChange={(e) => setDistributeForm({ ...distributeForm, notes: e.target.value })}
                    className="input-field"
                    style={{ background: '#0f172a' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedDistributeProduct(null)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={distributeLoading}
                    className="btn btn-primary"
                  >
                    {distributeLoading ? 'Transferring...' : 'Confirm Stock Distribution'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default VendorDashboard;
