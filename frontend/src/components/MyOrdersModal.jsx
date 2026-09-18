import React, { useState, useEffect } from 'react';
import { orderApi } from '../api';
import { X, PackageCheck, Clock, Store, MapPin, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const MyOrdersModal = ({ onClose }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMyOrders()
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '750px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <PackageCheck size={22} color="var(--primary)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>My Order History</h2>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="spin-icon" style={{ marginBottom: '0.5rem', color: 'var(--primary)' }} />
            <p style={{ fontSize: '0.92rem' }}>Loading your order history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
            <Clock size={42} color="var(--text-subtle)" style={{ marginBottom: '0.8rem' }} />
            <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.3rem' }}>No orders placed yet</h3>
            <p style={{ fontSize: '0.88rem' }}>When you place an order, it will appear here for tracking.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '60vh', overflowY: 'auto' }}>
            {orders.map((ord) => (
              <div
                key={ord.id}
                style={{
                  padding: '1.25rem',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)'
                }}
              >
                {/* Order Top Bar */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', fontWeight: 700 }}>ORDER NUMBER</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>{ord.orderNumber}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-customer" style={{ fontSize: '0.78rem' }}>{ord.status}</span>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginTop: '0.2rem' }}>
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Merchant Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--primary)', marginBottom: '0.85rem', fontWeight: 600 }}>
                  <Store size={14} /> Seller: {ord.vendorProfile?.storeName || 'Verified Merchant'}
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.85rem' }}>
                  {ord.items?.map((item) => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.88rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.6rem 0.85rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <img src={item.product?.imageUrl} alt="" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                        <div>
                          <span style={{ fontWeight: 700, color: '#fff' }}>{item.product?.title}</span>
                          <span style={{ color: 'var(--text-subtle)', marginLeft: '0.5rem', fontSize: '0.8rem' }}>x{item.quantity}</span>
                        </div>
                      </div>
                      <span style={{ fontWeight: 700, color: '#fff' }}>₹{item.subtotal?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Shipping & Total */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
                    <MapPin size={14} /> {ord.shippingAddress}
                  </div>

                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
                    Total: <span style={{ color: 'var(--primary)' }}>₹{ord.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default MyOrdersModal;
