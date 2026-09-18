import React, { useState } from 'react';
import { X, Plus, AlertCircle } from 'lucide-react';
import { productApi } from '../api';
import { getErrorMessage } from '../api/axios';

const AddProductModal = ({ categories, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    brand: '',
    price: '',
    discountPrice: '',
    stockQuantity: '',
    imageUrl: '',
    categoryId: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.price || !formData.stockQuantity || !formData.categoryId) {
      setError('Please fill in all required fields (Title, Price, Stock, Category)');
      return;
    }

    setSubmitting(true);
    try {
      await productApi.create({
        ...formData,
        price: parseFloat(formData.price),
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        stockQuantity: parseInt(formData.stockQuantity, 10),
        categoryId: parseInt(formData.categoryId, 10),
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create product listing. Check permissions and inputs.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Add New Product Listing</h2>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.85rem' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Product Title *</label>
            <input type="text" name="title" className="input-field" placeholder="e.g. Ultra HD Smart Monitor 27 inch" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="form-grid-2">
            <div className="input-group">
              <label className="input-label">Category *</label>
              <select name="categoryId" className="input-field" value={formData.categoryId} onChange={handleChange} required>
                <option value="" disabled>Select a Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id} style={{ background: '#0b0f19' }}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Brand Name</label>
              <input type="text" name="brand" className="input-field" placeholder="e.g. Sony, Nike" value={formData.brand} onChange={handleChange} />
            </div>
          </div>

          <div className="form-grid-3">
            <div className="input-group">
              <label className="input-label">Price (₹) *</label>
              <input type="number" step="0.01" name="price" className="input-field" placeholder="199.99" value={formData.price} onChange={handleChange} required />
            </div>

            <div className="input-group">
              <label className="input-label">Discount Price (₹)</label>
              <input type="number" step="0.01" name="discountPrice" className="input-field" placeholder="149.99" value={formData.discountPrice} onChange={handleChange} />
            </div>

            <div className="input-group">
              <label className="input-label">Stock Quantity *</label>
              <input type="number" name="stockQuantity" className="input-field" placeholder="50" value={formData.stockQuantity} onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Image URL</label>
            <input type="url" name="imageUrl" className="input-field" placeholder="https://images.unsplash.com/..." value={formData.imageUrl} onChange={handleChange} />
          </div>

          <div className="input-group">
            <label className="input-label">Detailed Description</label>
            <textarea name="description" className="input-field" rows="3" placeholder="Describe key features, specifications, and warranty details..." value={formData.description} onChange={handleChange} />
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
              {submitting ? 'Creating Product...' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
