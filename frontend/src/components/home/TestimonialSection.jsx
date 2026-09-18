import React from 'react';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Marcus Vance',
    role: 'VP of Procurement, Horizon Tech',
    comment: 'ShopStack has streamlined our enterprise procurement. The multi-vendor catalog allows us to source verified hardware with real-time stock sync.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    type: 'Enterprise Buyer',
  },
  {
    id: 2,
    name: 'Elena Rostova',
    role: 'Founder, Nexus Tech Innovations',
    comment: 'As a vendor partner, the seller onboarding and JWT-secured dashboard made listing our audio products seamless. Orders grew by 60% in Q2.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    type: 'Verified Merchant',
  },
  {
    id: 3,
    name: 'David Chen',
    role: 'Verified Consumer Shopper',
    comment: 'Great marketplace experience! The Noise-Canceling Headphones arrived in 2 days in mint condition. Transparent pricing and seller ratings.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    type: 'Verified Shopper',
  },
];

const TestimonialSection = () => {
  return (
    <div style={{ margin: '3.5rem 0' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2rem' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Platform Trust & Reviews
        </span>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginTop: '0.2rem' }}>
          Trusted by Enterprise Merchants & Shoppers
        </h2>
      </div>

      {/* Testimonials Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem'
      }}>
        {TESTIMONIALS.map((t) => (
          <div
            key={t.id}
            className="glass-panel"
            style={{
              padding: '1.75rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative'
            }}
          >
            <Quote size={28} color="rgba(99, 102, 241, 0.25)" style={{ position: 'absolute', top: '1.25rem', right: '1.25rem' }} />

            <div>
              {/* Star Rating */}
              <div style={{ display: 'flex', gap: '0.2rem', marginBottom: '1rem', color: '#fbbf24' }}>
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />
                ))}
              </div>

              <p style={{ fontSize: '0.92rem', color: 'rgba(241, 245, 249, 0.9)', lineHeight: 1.6, marginBottom: '1.5rem', fontStyle: 'italic' }}>
                "{t.comment}"
              </p>
            </div>

            {/* Author details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <img
                src={t.avatar}
                alt={t.name}
                style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
              />
              <div>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>{t.name}</h4>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.role}</p>
              </div>

              <span className="badge badge-customer" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                <CheckCircle2 size={11} /> {t.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialSection;

