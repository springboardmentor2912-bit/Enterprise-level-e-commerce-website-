import React from 'react';
import { Store, Star, CheckCircle, ArrowRight, Award, ShieldCheck } from 'lucide-react';

const FEATURED_VENDORS = [
  {
    id: 1,
    name: 'Nexus Electronics',
    category: 'Electronics & Audio Gear',
    rating: 4.9,
    reviews: 340,
    productsCount: '45+ Products',
    logo: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    badge: 'Premier Vendor',
  },
  {
    id: 2,
    name: 'Aura Fashion House',
    category: 'Luxury Wear & Timepieces',
    rating: 4.8,
    reviews: 280,
    productsCount: '60+ Products',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=80',
    badge: 'Sustainable Partner',
  },
  {
    id: 3,
    name: 'Urban Thread Co.',
    category: 'Organic Streetwear & Accessories',
    rating: 4.7,
    reviews: 195,
    productsCount: '30+ Products',
    logo: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=200&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80',
    badge: 'Rising Star',
  },
];

const BrandSection = ({ onVendorClick }) => {
  return (
    <div style={{ margin: '3.5rem 0' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontSize: '0.85rem', fontWeight: 600 }}>
          <ShieldCheck size={16} /> 100% Verified Sellers
        </div>
      </div>

      {/* Grid of Vendor Stores */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem'
      }}>
        {FEATURED_VENDORS.map((vendor) => (
          <div
            key={vendor.id}
            className="glass-panel brand-card"
            style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Store Cover Banner */}
            <div style={{ height: '100px', width: '100%', position: 'relative', overflow: 'hidden' }}>
              <img
                src={vendor.banner}
                alt={vendor.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.7 }}
              />
              <span className="badge badge-vendor" style={{ position: 'absolute', top: '10px', right: '10px', backdropFilter: 'blur(8px)' }}>
                <Award size={12} /> {vendor.badge}
              </span>
            </div>

            {/* Content Body */}
            <div style={{ padding: '1.25rem', position: 'relative', marginTop: '-30px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              
              {/* Store Avatar Logo */}
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                border: '3px solid #131b2e',
                overflow: 'hidden',
                background: '#0f172a',
                marginBottom: '0.75rem',
                boxShadow: 'var(--shadow-md)'
              }}>
                <img src={vendor.logo} alt={vendor.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>{vendor.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 700 }}>
                  <Star size={14} fill="#fbbf24" color="#fbbf24" />
                  {vendor.rating}
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                {vendor.category} • {vendor.productsCount}
              </p>

              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.78rem', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <CheckCircle size={14} /> Official Store
                </span>

                <button
                  onClick={() => onVendorClick && onVendorClick(vendor)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem' }}
                >
                  Explore Store <ArrowRight size={14} />
                </button>
              </div>

            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default BrandSection;
