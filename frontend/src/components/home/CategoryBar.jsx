import React from 'react';
import { Layers, Cpu, Shirt, Home as HomeIcon, Activity, Sparkles, Watch, ShoppingBag } from 'lucide-react';

const CATEGORY_ICON_MAP = {
  electronics: Cpu,
  fashion: Shirt,
  'home-living': HomeIcon,
  fitness: Activity,
  watches: Watch,
  default: ShoppingBag,
};

const CategoryBar = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <div style={{ margin: '2.5rem 0' }}>
      
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Catalog Exploration
          </span>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
            Explore Marketplace Categories
          </h2>
        </div>

        <button
          onClick={() => onSelectCategory(null)}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: '0.82rem' }}
        >
          <Layers size={14} /> View All Categories
        </button>
      </div>

      {/* Category Pills Slider */}
      <div className="category-pills-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.75rem' }}>
        <button
          className={`category-pill ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => onSelectCategory(null)}
        >
          <Layers size={16} />
          All Products
        </button>

        {categories.map((cat) => {
          const IconComp = CATEGORY_ICON_MAP[cat.slug] || CATEGORY_ICON_MAP.default;
          return (
            <button
              key={cat.id}
              className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => onSelectCategory(cat.id)}
            >
              <IconComp size={16} />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Featured Category Card Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
        gap: '1.25rem',
        marginTop: '1.5rem'
      }}>
        {categories.map((cat) => {
          const IconComp = CATEGORY_ICON_MAP[cat.slug] || CATEGORY_ICON_MAP.default;
          const isSelected = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="glass-panel category-card"
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'var(--bg-card)',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: isSelected ? 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)' : 'rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isSelected ? '#fff' : 'var(--primary)',
                flexShrink: 0,
                boxShadow: isSelected ? '0 4px 15px var(--primary-glow)' : 'none'
              }}>
                <IconComp size={22} />
              </div>

              <div>
                <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{cat.name}</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {cat.description || 'Enterprise catalog collection'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default CategoryBar;
