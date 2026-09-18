import React, { useState, useEffect } from 'react';
import { orderApi, warehouseApi } from '../api';
import { getErrorMessage } from '../api/axios';
import {
  ShoppingBag, MapPin, RefreshCw, Truck, CreditCard, Layers, Box,
  CheckCircle2, Navigation, RotateCcw, AlertTriangle, CheckSquare, X, ShieldCheck
} from 'lucide-react';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successToast, setSuccessToast] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnError, setReturnError] = useState('');

  // Return Modal State
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState(null);
  const [returnForm, setReturnForm] = useState({
    reason: 'Defective item received',
    returnReasonType: 'DEFECTIVE',
    customerComments: ''
  });

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordRes, allocRes, retRes] = await Promise.all([
        orderApi.getMyOrders(),
        warehouseApi.getAllocations().catch(() => ({ data: [] })),
        warehouseApi.getMyReturns().catch(() => ({ data: [] }))
      ]);
      setOrders(ordRes.data || []);
      setAllocations(allocRes.data || []);
      setReturns(retRes.data || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch order history.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrderForReturn) return;
    if (!returnForm.reason.trim()) {
      setReturnError('Please provide a reason description for the return.');
      return;
    }

    setSubmittingReturn(true);
    setReturnError('');

    try {
      await warehouseApi.requestReturn({
        orderId: selectedOrderForReturn.id,
        reason: returnForm.reason.trim(),
        returnReasonType: returnForm.returnReasonType,
        customerComments: returnForm.customerComments.trim()
      });
      setSelectedOrderForReturn(null);
      setSuccessToast('Return request submitted successfully! Admin and Warehouse QC staff will process your return.');
      setTimeout(() => setSuccessToast(''), 4000);
      fetchOrders();
    } catch (err) {
      setReturnError(getErrorMessage(err, 'Failed to submit return request.'));
    } finally {
      setSubmittingReturn(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'badge-customer';
      case 'SHIPPED':
      case 'PROCESSING':
        return 'badge-primary';
      case 'CONFIRMED':
        return 'badge-customer';
      case 'PENDING':
        return 'badge-warning';
      case 'CANCELLED':
      case 'RETURN_REJECTED':
        return 'badge-danger';
      case 'RETURN_REQUESTED':
      case 'RETURN_APPROVED':
      case 'RETURNED':
        return 'badge-warning';
      case 'REFUNDED':
        return 'badge-customer';
      default:
        return 'badge-secondary';
    }
  };

  const getPaymentStatusBadge = (ord) => {
    if (ord.status === 'REFUNDED') {
      return <span className="badge badge-customer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>🟢 REFUND PROCESSED</span>;
    }
    if (ord.paymentMethod === 'COD' || ord.paymentStatus === 'PENDING_COD') {
      return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Truck size={12} /> COD (Pending Delivery)</span>;
    }
    if (ord.paymentStatus === 'PAID' || ord.status === 'CONFIRMED' || ord.status === 'SHIPPED' || ord.status === 'DELIVERED') {
      return <span className="badge badge-customer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CreditCard size={12} /> PAID (Online)</span>;
    }
    return <span className="badge badge-warning">PENDING</span>;
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <RefreshCw size={28} className="spin-icon" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>Loading order history and warehouse dispatch details...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 1rem 4rem', maxWidth: '1100px' }}>
      
      {/* Toast Feedback */}
      {successToast && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontWeight: 600 }}>
          <CheckCircle2 size={20} style={{ flexShrink: 0 }} />
          <span>{successToast}</span>
        </div>
      )}

      {/* Page Title */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
          My Purchase Orders & Warehouse Tracking
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Track delivery lifecycle, regional fulfillment routing, and customer return/replacement requests.
        </p>
      </div>

      {error && (
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} style={{ display: 'inline', marginRight: '6px' }} />
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card" style={{ padding: '4rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <ShoppingBag size={54} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '0.4rem', fontWeight: 700 }}>
            No orders placed yet
          </h3>
          <p style={{ fontSize: '0.88rem' }}>When you complete checkout via Razorpay or Cash on Delivery, your order history will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((ord) => {
            const existingReturn = returns.find(r => r.orderId === ord.id);
            const canRequestReturn = (ord.status === 'DELIVERED' || ord.status === 'SHIPPED') && !existingReturn;

            return (
              <div
                key={ord.id}
                className="card"
                style={{ 
                  padding: '1.5rem', 
                  border: existingReturn ? '1px solid rgba(244, 114, 182, 0.4)' : '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                
                {/* Order Header */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                      Order #: {ord.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Placed: {new Date(ord.createdAt).toLocaleString()} • Merchant: <strong style={{ color: '#cbd5e1' }}>{ord.vendorProfile?.storeName || 'Verified Merchant'}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {getPaymentStatusBadge(ord)}
                    <span className={`badge ${getStatusBadgeClass(ord.status)}`} style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
                      {ord.status}
                    </span>
                  </div>
                </div>

                {/* Return Status Banner if Active */}
                {existingReturn && (
                  <div style={{
                    background: 'rgba(236, 72, 153, 0.12)',
                    border: '1px solid rgba(236, 72, 153, 0.3)',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: 800, color: '#f472b6', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <RotateCcw size={16} /> Return Request: {existingReturn.status}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Reason: <strong style={{ color: '#fff' }}>{existingReturn.reason}</strong> • Assigned QC Hub: <strong style={{ color: '#fff' }}>{existingReturn.warehouseName || 'Regional Hub'}</strong>
                      </div>
                      {existingReturn.adminNotes && (
                        <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '2px' }}>Admin Note: {existingReturn.adminNotes}</div>
                      )}
                      {existingReturn.qcNotes && (
                        <div style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600, marginTop: '2px' }}>Warehouse QC Note: {existingReturn.qcNotes}</div>
                      )}
                    </div>

                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      background: existingReturn.status === 'QC_PASSED_RESTOCKED' ? 'rgba(16, 185, 129, 0.2)' : existingReturn.status === 'QC_FAILED_DAMAGED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(236, 72, 153, 0.2)',
                      color: existingReturn.status === 'QC_PASSED_RESTOCKED' ? '#34d399' : existingReturn.status === 'QC_FAILED_DAMAGED' ? '#fca5a5' : '#f472b6'
                    }}>
                      {existingReturn.status}
                    </span>
                  </div>
                )}

                {/* Status Timeline */}
                <div className="horizontal-scroll-ribbon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-color)', padding: '0.85rem 1.25rem', borderRadius: '8px', marginBottom: '1.25rem', overflowX: 'auto', minWidth: '100%' }}>
                  {['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((st, idx, arr) => {
                    const statuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
                    const currentIndex = statuses.indexOf(ord.status);
                    const stepIndex = statuses.indexOf(st);
                    const isPassed = currentIndex >= stepIndex || ord.status === 'DELIVERED' || ord.status === 'REFUNDED' || ord.status === 'RETURNED';

                    return (
                      <React.Fragment key={st}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isPassed ? 1 : 0.4, flexShrink: 0 }}>
                          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: isPassed ? 'var(--primary)' : '#334155', color: '#fff', fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {isPassed ? '✓' : idx + 1}
                          </div>
                          <span style={{ fontSize: '0.78rem', fontWeight: isPassed ? 700 : 500, color: isPassed ? '#fff' : 'var(--text-muted)' }}>
                            {st}
                          </span>
                        </div>
                        {idx < arr.length - 1 && (
                          <div style={{ flex: 1, height: '2px', background: isPassed ? 'var(--primary)' : '#334155', margin: '0 0.5rem', minWidth: '15px' }} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Items List & Warehouse Allocation Info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  {ord.items?.map((item) => {
                    const itemAlloc = allocations.find(a => a.orderItemId === item.id || (a.orderId === ord.id && a.productId === item.product?.id));
                    
                    return (
                      <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.85rem 1rem', background: 'rgba(15, 23, 42, 0.7)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                            <img src={item.product?.imageUrl} alt="" style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', background: '#0f172a' }} />
                            <div>
                              <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{item.product?.title}</div>
                              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                Qty: {item.quantity} × ₹{item.unitPrice?.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.98rem' }}>
                            ₹{item.subtotal?.toFixed(2)}
                          </div>
                        </div>

                        {/* Warehouse Allocation Footnote */}
                        {itemAlloc && (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                              <Layers size={13} color="#818cf8" />
                              <span>Hub: <strong>{itemAlloc.warehouseName}</strong> ({itemAlloc.warehouseCode})</span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span style={{
                                fontWeight: 700,
                                padding: '0.15rem 0.5rem',
                                borderRadius: '10px',
                                background: itemAlloc.stage === 'SHIPPED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                                color: itemAlloc.stage === 'SHIPPED' ? '#34d399' : '#818cf8'
                              }}>
                                {itemAlloc.stage}
                              </span>
                              {itemAlloc.trackingNumber && (
                                <span style={{ fontWeight: 700, color: '#818cf8' }}>
                                  🚚 {itemAlloc.carrier}: {itemAlloc.trackingNumber}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer Row with Return Action Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={15} color="var(--primary)" /> Address: <strong style={{ color: '#cbd5e1' }}>{ord.shippingAddress}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    {canRequestReturn && (
                      <button
                        onClick={() => {
                          setSelectedOrderForReturn(ord);
                          setReturnError('');
                          setReturnForm({
                            reason: 'Defective item received',
                            returnReasonType: 'DEFECTIVE',
                            customerComments: ''
                          });
                        }}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#f472b6', borderColor: 'rgba(236, 72, 153, 0.4)', background: 'rgba(236, 72, 153, 0.1)', fontWeight: 700 }}
                      >
                        <RotateCcw size={14} /> Request Return / Refund
                      </button>
                    )}

                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                      Total: <span style={{ color: '#818cf8' }}>₹{ord.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          MODAL: CUSTOMER REQUEST RETURN (Dark Glass Theme)
      ========================================================================= */}
      {selectedOrderForReturn && (
        <div className="modal-overlay" onClick={() => setSelectedOrderForReturn(null)}>
          <div className="modal-card" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RotateCcw size={20} color="#f472b6" /> Request Return & Refund
              </h3>
              <button onClick={() => setSelectedOrderForReturn(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem', borderRadius: '50%' }}>
                <X size={18} />
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Order #: <strong style={{ color: '#fff' }}>{selectedOrderForReturn.orderNumber}</strong> • Eligible for Full Refund (<strong style={{ color: '#34d399' }}>₹{selectedOrderForReturn.totalAmount?.toFixed(2)}</strong>)
            </p>

            {returnError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <AlertTriangle size={16} />
                <span>{returnError}</span>
              </div>
            )}

            <form onSubmit={handleReturnSubmit}>
              <div className="input-group">
                <label className="input-label">Return Reason Category *</label>
                <select
                  value={returnForm.returnReasonType}
                  onChange={(e) => setReturnForm({ ...returnForm, returnReasonType: e.target.value })}
                  className="input-field"
                  style={{ background: '#0f172a' }}
                >
                  <option value="DEFECTIVE">Defective / Malfunctioning Hardware</option>
                  <option value="DAMAGED_IN_TRANSIT">Damaged during shipping transit</option>
                  <option value="WRONG_ITEM">Wrong item / variant received</option>
                  <option value="CHANGED_MIND">Performance / expectations not met</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Reason Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Left button unresponsive, cracked casing"
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value })}
                  className="input-field"
                  style={{ background: '#0f172a' }}
                />
              </div>

              <div className="input-group" style={{ marginBottom: '1.5rem' }}>
                <label className="input-label">Additional Comments (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Describe the defect in detail for warehouse QC staff..."
                  value={returnForm.customerComments}
                  onChange={(e) => setReturnForm({ ...returnForm, customerComments: e.target.value })}
                  className="input-field"
                  style={{ background: '#0f172a', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSelectedOrderForReturn(null)} className="btn btn-secondary">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="btn btn-primary"
                  style={{ background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)', borderColor: '#ec4899', color: '#fff', fontWeight: 700 }}
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyOrdersPage;
