import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';
import { Store, Lock, Mail, AlertCircle, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address (e.g. user@company.com).';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 4) {
      errors.password = 'Password must be at least 4 characters long.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    if (!validateForm()) return;

    try {
      const res = await login({ email: email.trim(), password });
      setSuccessMessage('Authentication successful! Redirecting...');
      
      setTimeout(() => {
        if (res?.role === 'ADMIN') {
          navigate('/admin');
        } else if (res?.role === 'WAREHOUSE_STAFF') {
          navigate('/warehouse-staff');
        } else if (res?.role === 'VENDOR') {
          navigate('/vendor');
        } else {
          navigate('/');
        }
      }, 500);
    } catch (err) {
      const msg = getErrorMessage(err, 'Login failed. Please check your credentials and connection.');
      setServerError(msg);
    }
  };

  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setFieldErrors({});
    setServerError('');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 76px)', padding: '2.5rem 1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem' }}>
        
        {/* Brand & Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 4px 20px var(--primary-glow)'
          }}>
            <Store size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>Sign in to your ShopStack Enterprise account</p>
        </div>

        {/* Global Error Banner */}
        {serverError && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{serverError}</div>
          </div>
        )}

        {/* Success Banner */}
        {successMessage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <div>{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="input-group">
            <label className="input-label">Email Address *</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                className={`input-field ${fieldErrors.email ? 'input-error' : ''}`}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: null }));
                }}
                style={{ paddingLeft: '44px' }}
              />
            </div>
            {fieldErrors.email && <span className="field-error-text">{fieldErrors.email}</span>}
          </div>

          {/* Password Field */}
          <div className="input-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="input-label">Password *</label>
              <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Forgot Password?</Link>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`input-field ${fieldErrors.password ? 'input-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null }));
                }}
                style={{ paddingLeft: '44px', paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
          </div>

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.88rem', marginTop: '0.75rem', fontSize: '0.95rem' }}>
            {loading ? 'Authenticating Credentials...' : 'Sign In'}
            <ArrowRight size={18} />
          </button>
        </form>

        {/* Quick Demo Presets */}
        <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.75rem', textAlign: 'center' }}>
            Role-Based Demo Access (Click to Fill)
          </span>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('admin@shopstack.com', 'admin123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.55rem' }}
            >
              👑 Admin (System)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('staff@shopstack.com', 'staff123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.55rem', borderColor: '#818cf8', color: '#818cf8' }}
            >
              📦 Staff (Hyd Hub)
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('techstore@shopstack.com', 'vendor123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.55rem' }}
            >
              🏪 Vendor / Merchant
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('customer@shopstack.com', 'customer123')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem', padding: '0.55rem' }}
            >
              🛍️ Customer
            </button>
          </div>

          {/* Regional Staff Quick Switch */}
          <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)', width: '100%', textAlign: 'center' }}>Staff Hubs:</span>
            <button type="button" onClick={() => handleQuickDemo('staff.mum@shopstack.com', 'staff123')} className="btn btn-sm" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#1e293b', color: '#94a3b8' }}>Mumbai</button>
            <button type="button" onClick={() => handleQuickDemo('staff.del@shopstack.com', 'staff123')} className="btn btn-sm" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#1e293b', color: '#94a3b8' }}>Delhi</button>
            <button type="button" onClick={() => handleQuickDemo('staff.blr@shopstack.com', 'staff123')} className="btn btn-sm" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#1e293b', color: '#94a3b8' }}>Bangalore</button>
            <button type="button" onClick={() => handleQuickDemo('staff.kol@shopstack.com', 'staff123')} className="btn btn-sm" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: '#1e293b', color: '#94a3b8' }}>Kolkata</button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Create Account
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
