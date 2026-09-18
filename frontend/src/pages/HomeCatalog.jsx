import React, { useState, useEffect, useRef } from 'react';
import { productApi, healthApi } from '../api';
import { getErrorMessage } from '../api/axios';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import HeroBanner from '../components/home/HeroBanner';
import CategoryBar from '../components/home/CategoryBar';
import BrandSection from '../components/home/BrandSection';
import TestimonialSection from '../components/home/TestimonialSection';
import NewsletterSection from '../components/home/NewsletterSection';
import { Sparkles, SlidersHorizontal, Layers, Flame, Award, TrendingUp, RefreshCw, X, ShoppingBag, AlertCircle } from 'lucide-react';

const HomeCatalog = ({ searchQuery, selectedCategory, setSelectedCategory, categories }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const catalogRef = useRef(null);

  const scrollToCatalog = () => {
    if (catalogRef.current) {
      catalogRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const fetchProducts = () => {
    setLoading(true);
    setError(null);
    const params = {};
    if (selectedCategory) params.categoryId = selectedCategory;
    if (searchQuery) params.search = searchQuery;

    productApi.getAll(params)
      .then(res => {
        setProducts(res.data || []);
        setError(null);
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
        setError(getErrorMessage(err, 'Unable to reach the multi-vendor backend server. Please verify your connection.'));
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  // Dynamic Partitioning for Sections (when no explicit filter is applied)
  const featuredProducts = products.filter(p => p.featured);
  const trendingProducts = [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
  const bestSellerProducts = [...products].sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0)).slice(0, 4);

  const isFiltered = selectedCategory !== null || (searchQuery && searchQuery.trim() !== '');

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      
      {/* 1. Dynamic Hero Banner Carousel */}
      {!isFiltered && <HeroBanner onExploreClick={scrollToCatalog} />}

      {/* 2. Category Exploration Bar & Cards */}
      <CategoryBar
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 3. Main Products Catalog Section Anchor */}
      <div ref={catalogRef} style={{ scrollMarginTop: '100px', marginTop: isFiltered ? '1.5rem' : '2.5rem' }}>
        
        {/* Catalog Header & Filter Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
          <div>
            <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {isFiltered ? 'Active Search & Category Filter' : 'Verified Vendor Inventory'}
            </span>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
              {selectedCategory
                ? `Category: ${categories.find(c => c.id === selectedCategory)?.name || 'Filtered Products'}`
                : searchQuery
                ? `Search Results for "${searchQuery}"`
                : 'Featured Marketplace Products'}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isFiltered && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="btn btn-secondary btn-sm"
                style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
              >
                <X size={14} /> Clear Active Filters
              </button>
            )}

            <span style={{ fontSize: '0.88rem', color: 'var(--text-subtle)', background: 'rgba(255,255,255,0.04)', padding: '0.4rem 0.85rem', borderRadius: '9999px', border: '1px solid var(--border-color)' }}>
              Showing <strong>{products.length}</strong> active products
            </span>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={28} className="spin-icon" style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
            <p style={{ fontSize: '1rem' }}>Loading multi-vendor marketplace inventory...</p>
          </div>
        ) : error ? (
          /* Error State with Retry Button */
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3.5rem 2rem', marginTop: '1.5rem', borderRadius: 'var(--radius-xl)', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.15)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', color: '#f87171' }}>
              <RefreshCw size={24} />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>Unable to Load Products</h3>
            <p style={{ color: '#fca5a5', fontSize: '0.9rem', marginBottom: '0.5rem', maxWidth: '500px', margin: '0 auto 0.75rem auto' }}>
              {error}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '1.5rem' }}>
              If connecting from a mobile device or tablet, ensure your device is connected to the same network as the host server.
            </p>
            <button onClick={fetchProducts} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
              <RefreshCw size={14} /> Retry Connection
            </button>
          </div>
        ) : products.length === 0 ? (
          /* Empty State */
          <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem', marginTop: '1.5rem', borderRadius: 'var(--radius-xl)' }}>
            <ShoppingBag size={48} color="var(--text-subtle)" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Products Matching Your Criteria</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Try adjusting your search terms or clearing selected category filters.
            </p>
            {isFiltered && (
              <button onClick={() => setSelectedCategory(null)} className="btn btn-primary btn-sm">
                View All Products
              </button>
            )}
          </div>
        ) : isFiltered ? (
          /* Filtered Results Grid */
          <div className="product-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
            ))}
          </div>
        ) : (
          /* Enterprise Structured Multi-Section Homepage */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
            
            {/* Section A: Featured Products */}
            {featuredProducts.length > 0 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                  <Sparkles size={20} color="#818cf8" />
                  <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Featured Enterprise Picks</h3>
                </div>
                <div className="product-grid">
                  {featuredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
                  ))}
                </div>
              </div>
            )}

            {/* Section B: Trending Products */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Flame size={20} color="#f472b6" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Trending Now</h3>
                <span className="badge badge-admin" style={{ marginLeft: '0.5rem', fontSize: '0.7rem' }}>HIGH DEMAND</span>
              </div>
              <div className="product-grid">
                {trendingProducts.map(product => (
                  <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
                ))}
              </div>
            </div>

            {/* Section C: Best Sellers */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Award size={20} color="#fbbf24" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>Top Rated Best Sellers</h3>
              </div>
              <div className="product-grid">
                {bestSellerProducts.map((product, idx) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onSelect={setSelectedProduct}
                    rankBadge={`#${idx + 1} BEST SELLER`}
                  />
                ))}
              </div>
            </div>

            {/* Section D: Complete Catalog Inventory */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Layers size={20} color="#34d399" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>All Verified Marketplace Items</h3>
              </div>
              <div className="product-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} onSelect={setSelectedProduct} />
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 5. Enterprise Brand Showcase */}
      {!isFiltered && <BrandSection onVendorClick={scrollToCatalog} />}

      {/* 6. Customer & Enterprise Reviews */}
      {!isFiltered && <TestimonialSection />}

      {/* 7. Newsletter Subscription Box */}
      {!isFiltered && <NewsletterSection />}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

    </div>
  );
};

export default HomeCatalog;
