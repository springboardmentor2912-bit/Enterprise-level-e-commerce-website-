import React, { useState } from 'react';
import { Mail, CheckCircle2, ShieldCheck, Sparkles, Send } from 'lucide-react';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubscribed(true);
    setEmail('');
  };

  return (
    <div style={{ margin: '3.5rem 0' }}>
      {/* <div
        className="glass-panel"
        style={{
          padding: '3rem 2.5rem',
          borderRadius: 'var(--radius-xl)',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.18) 0%, rgba(236, 72, 153, 0.12) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          boxShadow: '0 4px 20px var(--primary-glow)'
        }}>
          <Mail size={26} color="#fff" />
        </div>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Subscribe to ShopStack Enterprise Insights
        </h2>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '560px', marginBottom: '1.75rem' }}>
          Get early access to multi-vendor flash sales, direct manufacturer drops, and corporate buyer discounts delivered weekly.
        </p>

        {subscribed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'rgba(16, 185, 129, 0.18)', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#34d399', padding: '0.85rem 1.5rem', borderRadius: 'var(--radius-md)', fontSize: '0.95rem', fontWeight: 600 }}>
            <CheckCircle2 size={20} />
            Thank you for subscribing! Check your inbox for confirmation.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '480px' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 280px', position: 'relative' }}>
                <input
                  type="email"
                  className="input-field"
                  placeholder="Enter your business email address..."
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  style={{ borderRadius: 'var(--radius-md)', paddingLeft: '1rem' }}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', whiteSpace: 'nowrap' }}>
                Subscribe
                <Send size={16} />
              </button>
            </div>

            {error && <span style={{ color: '#fca5a5', fontSize: '0.82rem', marginTop: '0.4rem', display: 'block' }}>{error}</span>}
          </form>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-subtle)', fontSize: '0.82rem' }}>
            <ShieldCheck size={15} color="#34d399" /> Zero Spam Guarantee
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-subtle)', fontSize: '0.82rem' }}>
            <Sparkles size={15} color="#818cf8" /> Exclusive VIP Drops
          </div>
        </div>

      </div> */}
    </div>
  );
};

export default NewsletterSection;
