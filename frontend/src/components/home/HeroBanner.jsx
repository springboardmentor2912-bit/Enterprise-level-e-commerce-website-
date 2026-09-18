import React, { useState, useEffect } from 'react';
import { ShieldCheck, Truck, Clock, Sparkles, ChevronLeft, ChevronRight, ArrowRight, Star } from 'lucide-react';

const BANNERS = [
  {
    id: 1,
    badge: 'Enterprise Flash Sale',
    title: 'Next-Gen Audio & Smart Electronics Fest',
    subtitle: 'Upgrade your workspace with flagship noise-canceling headphones, ultra laptops, and ergonomic smart desk gear.',
    highlight: 'Up to 45% OFF',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1000&auto=format&fit=crop&q=80',
    primaryCta: 'Explore Deals',
    secondaryCta: 'View Electronics',
    gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(30, 27, 75, 0.85) 100%)',
    accentColor: '#818cf8',
  },
  {
    id: 2,
    badge: 'Curated Designer Brands',
    title: 'Aura Sustainable Luxury & Streetwear',
    subtitle: 'Discover heavy French terry hoodies, chronometer watches, and handcrafted footwear from top multi-vendor boutiques.',
    highlight: 'New Season Collection',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80',
    primaryCta: 'Shop Designer Wear',
    secondaryCta: 'Explore Vendors',
    gradient: 'linear-gradient(135deg, rgba(236, 72, 153, 0.25) 0%, rgba(70, 10, 40, 0.85) 100%)',
    accentColor: '#f472b6',
  },
  {
    id: 3,
    badge: 'Enterprise Bulk Procurement',
    title: 'Direct-from-Manufacturer Wholesale Pricing',
    subtitle: 'Verified seller storefronts, automated invoicing, real-time inventory sync, and multi-tier commission engine.',
    highlight: 'Verified Merchant Network',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1000&auto=format&fit=crop&q=80',
    primaryCta: 'Become a Seller',
    secondaryCta: 'Corporate Catalog',
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 78, 59, 0.85) 100%)',
    accentColor: '#34d399',
  },
];

const HeroBanner = ({ onExploreClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const banner = BANNERS[currentSlide];

  return (
    <div className="hero-section-container" style={{ position: 'relative', marginTop: '1.5rem', marginBottom: '2.5rem' }}>
      
      {/* Main Banner Box */}
      <div
        className="glass-panel hero-banner-card"
        style={{
          background: banner.gradient,
          borderRadius: 'var(--radius-xl)',
          padding: '3.5rem 3rem',
          minHeight: '380px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: 'var(--shadow-md)',
          transition: 'background 0.8s ease-in-out'
        }}
      >
        {/* Ambient background image blur */}
        <div style={{
          position: 'absolute',
          right: '-5%',
          top: '-10%',
          width: '55%',
          height: '120%',
          backgroundImage: `url(${banner.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.28,
          maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 30%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none',
          zIndex: 1
        }} />

        {/* Banner Content */}
        <div style={{ maxWidth: '640px', position: 'relative', zIndex: 2 }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.35rem 0.85rem' }}>
              <Sparkles size={14} color={banner.accentColor} />
              {banner.badge}
            </span>
            <span style={{ fontSize: '0.82rem', color: banner.accentColor, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {banner.highlight}
            </span>
          </div>

          <h1 style={{ fontSize: '2.6rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.15, marginBottom: '1.2rem', letterSpacing: '-0.02em' }}>
            {banner.title}
          </h1>

          <p style={{ color: 'rgba(241, 245, 249, 0.85)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            {banner.subtitle}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={onExploreClick}
              className="btn btn-primary"
              style={{ padding: '0.85rem 1.8rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
            >
              {banner.primaryCta}
              <ArrowRight size={18} />
            </button>

            <button
              onClick={onExploreClick}
              className="btn btn-secondary"
              style={{ padding: '0.85rem 1.6rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)' }}
            >
              {banner.secondaryCta}
            </button>
          </div>

        </div>

        {/* Feature Visual Card Preview */}
        <div style={{ position: 'relative', zIndex: 2, display: 'none', width: '280px', flexShrink: 0 }} className="desktop-hero-preview">
          <div style={{
            background: 'rgba(15, 23, 42, 0.85)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.5)'
          }}>
            <img
              src={banner.image}
              alt="Feature preview"
              style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: 'var(--radius-md)', marginBottom: '0.8rem' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: banner.accentColor, fontWeight: 700, textTransform: 'uppercase' }}>Verified Listing</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#fbbf24', fontSize: '0.8rem' }}>
                <Star size={12} fill="#fbbf24" /> 4.9 (120+)
              </div>
            </div>
          </div>
        </div>

        {/* Slider Navigation Buttons */}
        <div className="hero-banner-controls" style={{ position: 'absolute', bottom: '1.25rem', right: '2rem', zIndex: 10, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={() => setCurrentSlide((prev) => (prev - 1 + BANNERS.length) % BANNERS.length)}
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Previous Banner"
          >
            <ChevronLeft size={20} />
          </button>
          
          {BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              style={{
                width: currentSlide === idx ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: currentSlide === idx ? banner.accentColor : 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              title={`Slide ${idx + 1}`}
            />
          ))}

          <button
            onClick={() => setCurrentSlide((prev) => (prev + 1) % BANNERS.length)}
            style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            title="Next Banner"
          >
            <ChevronRight size={20} />
          </button>
        </div>

      </div>

      {/* Trust Feature Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
        marginTop: '1.25rem'
      }}>
        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', flexShrink: 0 }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>Verified Merchants</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>100% Authenticated Vendor Network</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', flexShrink: 0 }}>
            <Truck size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>Enterprise Express Shipping</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tracked Dispatch & Global Delivery</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f472b6', flexShrink: 0 }}>
            <Clock size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>24/7 Buyer Protection</h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Dispute Resolution & Instant Returns</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HeroBanner;
