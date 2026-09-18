import React from 'react';
import { Store, ShieldCheck, Cpu, CreditCard, Lock, Globe, CheckCircle2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', background: '#070a13', paddingTop: '3.5rem', paddingBottom: '2rem' }}>
      <div className="container">
        
        {/* Top Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Store size={20} color="#fff" />
              </div>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>ShopStack</span>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Enterprise Java Spring Boot & React Multi-Vendor E-Commerce Platform. Powering high-scale digital retail, merchant onboarding, and automated catalog management.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.82rem', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 10px #34d399' }}></span>
              All API Gateway Microservices Operational
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.02em' }}>Customer Care</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <li>Order Tracking & Shipping Status</li>
              <li>Buyer Protection & Refunds</li>
              <li>Returns & Exchange Policy</li>
              <li>Help Center & Live Support</li>
              <li>Bulk Order Procurement</li>
            </ul>
          </div>


          {/* Architecture Specs */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '0.02em' }}>Platform Tech Stack</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <li>Spring Boot 3.2 Security & JPA</li>
              <li>PostgreSQL RDBMS Engine</li>
              <li>JWT Token Authentication</li>
              <li>React + Vite Client Frontend</li>
              <li>REST API Architecture</li>
            </ul>
          </div>

        </div>

        {/* Accepted Payment Badges & Trust Icons */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-subtle)', fontSize: '0.82rem' }}>
            <Lock size={15} color="#34d399" />
            <span>256-bit SSL Encrypted Payments</span>
          </div>

          {/* Payment Method Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 700 }}>ACCEPTED PAYMENTS:</span>
            {['VISA', 'MASTERCARD', 'AMEX', 'PAYPAL', 'APPLE PAY'].map((pm) => (
              <span key={pm} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8' }}>
                {pm}
              </span>
            ))}
          </div>

        </div>

        {/* Copyright */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '1.25rem', textAlign: 'center', color: 'var(--text-subtle)', fontSize: '0.82rem' }}>
          © {new Date().getFullYear()} ShopStack Enterprise Multi-Vendor Platform. Built with React & Spring Boot. All rights reserved.
        </div>

      </div>
    </footer>
  );
};

export default Footer;
