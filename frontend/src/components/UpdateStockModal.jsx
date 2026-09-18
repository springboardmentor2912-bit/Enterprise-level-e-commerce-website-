import React, { useState } from 'react';
import { X, Package, AlertTriangle, CheckCircle2, Save } from 'lucide-react';
import { productApi } from '../api';
import { getErrorMessage } from '../api/axios';

const UpdateStockModal = ({ product, onClose, onSuccess }) => {
  const [stockQuantity, setStockQuantity] = useState(product?.stockQuantity ?? 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedStock = parseInt(stockQuantity, 10);
    if (isNaN(parsedStock) || parsedStock < 0) {
      setError('Please enter a valid non-negative integer for stock quantity.');
      return;
    }

    setLoading(true);

    try {
      await productApi.updateStock(product.id, parsedStock);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update stock quantity.'));
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (amount) => {
    const current = parseInt(stockQuantity, 10) || 0;
    setStockQuantity(Math.max(0, current + amount));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Package size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>Update Inventory Stock</h3>
          </div>

          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Product Brief */}
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', padding: '0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
          <img src={product.imageUrl} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>{product.title}</h4>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)' }}>SKU: {product.sku || 'N/A'}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          
          <div className="input-group">
            <label className="input-label">Current Available Stock Units *</label>
            <input
              type="number"
              min="0"
              className="input-field"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              placeholder="e.g. 50"
              required
            />
          </div>

          {/* Quick Presets */}
          <div style={{ marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.5rem' }}>
              Quick Stock Adjustments
            </span>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.4rem' }}>
              <button type="button" onClick={() => handleQuickAdd(5)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                +5
              </button>
              <button type="button" onClick={() => handleQuickAdd(10)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                +10
              </button>
              <button type="button" onClick={() => handleQuickAdd(25)} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                +25
              </button>
              <button type="button" onClick={() => setStockQuantity(0)} className="btn btn-danger btn-sm" style={{ fontSize: '0.72rem' }}>
                Set 0 (Out)
              </button>
            </div>
          </div>

          {/* Status Indicator */}
          <div style={{ marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            Stock Status Preview:{' '}
            {parseInt(stockQuantity, 10) === 0 ? (
              <span className="badge badge-danger" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
                OUT OF STOCK
              </span>
            ) : parseInt(stockQuantity, 10) < 10 ? (
              <span className="badge badge-warning">LOW STOCK ({stockQuantity} units)</span>
            ) : (
              <span className="badge badge-customer">IN STOCK ({stockQuantity} units)</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 1.5 }}>
              <Save size={16} />
              {loading ? 'Saving Stock...' : 'Save Stock Quantity'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default UpdateStockModal;
