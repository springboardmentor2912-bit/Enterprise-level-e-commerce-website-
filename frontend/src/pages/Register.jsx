import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/axios';
import { Store, User, Mail, Lock, Phone, AlertCircle, CheckCircle2, Eye, EyeOff, Building } from 'lucide-react';

const Register = () => {
  const [role, setRole] = useState('CUSTOMER');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName.trim()) {
      errors.fullName = 'Full Name is required.';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Name must be at least 2 characters.';
    }

    if (!email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (phoneNumber && !/^\+?[0-9\s\-()]{7,20}$/.test(phoneNumber.trim())) {
      errors.phoneNumber = 'Please enter a valid phone number format.';
    }

    if (role === 'VENDOR') {
      if (!storeName.trim()) {
        errors.storeName = 'Store / Business Name is required for vendor accounts.';
      }
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
      const res = await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        phoneNumber: phoneNumber.trim() || null,
        role,
        storeName: role === 'VENDOR' ? storeName.trim() : null,
        storeDescription: role === 'VENDOR' ? storeDescription.trim() : null,
      });

      setSuccessMessage('Account registered successfully! Redirecting to your dashboard...');

      setTimeout(() => {
        if (res?.role === 'VENDOR') {
          navigate('/vendor');
        } else {
          navigate('/');
        }
      }, 700);

    } catch (err) {
      const msg = getErrorMessage(err, 'Registration failed. Email might already be in use.');
      setServerError(msg);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 76px)', padding: '2.5rem 1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '560px', padding: '2.5rem' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>Create ShopStack Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Join as a Customer or Enterprise Vendor Partner
          </p>
        </div>

        {/* Account Role Selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0.5rem',
          background: 'rgba(15, 23, 42, 0.7)',
          padding: '0.4rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem'
        }}>
          <button
            type="button"
            className={`btn ${role === 'CUSTOMER' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-sm)', padding: '0.6rem', fontSize: '0.88rem' }}
            onClick={() => {
              setRole('CUSTOMER');
              setFieldErrors(prev => ({ ...prev, storeName: null }));
            }}
          >
            <User size={16} />
            Customer Account
          </button>

          <button
            type="button"
            className={`btn ${role === 'VENDOR' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-sm)', padding: '0.6rem', fontSize: '0.88rem' }}
            onClick={() => setRole('VENDOR')}
          >
            <Store size={16} />
            Vendor Partner Store
          </button>
        </div>

        {/* Global Error Alert */}
        {serverError && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{serverError}</div>
          </div>
        )}

        {/* Global Success Alert */}
        {successMessage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.88rem' }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <div>{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="input-group">
            <label className="input-label">Full Name *</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                className={`input-field ${fieldErrors.fullName ? 'input-error' : ''}`}
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) setFieldErrors(prev => ({ ...prev, fullName: null }));
                }}
                style={{ paddingLeft: '44px' }}
              />
            </div>
            {fieldErrors.fullName && <span className="field-error-text">{fieldErrors.fullName}</span>}
          </div>

          {/* Email & Phone side-by-side with responsive fallback */}
          <div className="grid-2-to-1" style={{ gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Email Address *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className={`input-field ${fieldErrors.email ? 'input-error' : ''}`}
                  placeholder="john@example.com"
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

            <div className="input-group">
              <label className="input-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="tel"
                  className={`input-field ${fieldErrors.phoneNumber ? 'input-error' : ''}`}
                  placeholder="+1 555-0199"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value);
                    if (fieldErrors.phoneNumber) setFieldErrors(prev => ({ ...prev, phoneNumber: null }));
                  }}
                  style={{ paddingLeft: '44px' }}
                />
              </div>
              {fieldErrors.phoneNumber && <span className="field-error-text">{fieldErrors.phoneNumber}</span>}
            </div>
          </div>

          {/* Password & Confirm Password side-by-side with responsive fallback */}
          <div className="grid-2-to-1" style={{ gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`input-field ${fieldErrors.password ? 'input-error' : ''}`}
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: null }));
                  }}
                  style={{ paddingLeft: '44px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.password && <span className="field-error-text">{fieldErrors.password}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className={`input-field ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: null }));
                  }}
                  style={{ paddingLeft: '44px', paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-subtle)', cursor: 'pointer' }}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <span className="field-error-text">{fieldErrors.confirmPassword}</span>}
            </div>
          </div>

          {/* Vendor Details */}
          {role === 'VENDOR' && (
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
              <div className="badge badge-vendor" style={{ marginBottom: '1rem' }}>
                <Building size={14} /> Vendor Store Information
              </div>

              <div className="input-group">
                <label className="input-label">Store / Business Name *</label>
                <input
                  type="text"
                  className={`input-field ${fieldErrors.storeName ? 'input-error' : ''}`}
                  placeholder="e.g. Apex Electronics & Apparel"
                  value={storeName}
                  onChange={(e) => {
                    setStoreName(e.target.value);
                    if (fieldErrors.storeName) setFieldErrors(prev => ({ ...prev, storeName: null }));
                  }}
                />
                {fieldErrors.storeName && <span className="field-error-text">{fieldErrors.storeName}</span>}
              </div>

              <div className="input-group">
                <label className="input-label">Store Description</label>
                <textarea
                  className="input-field"
                  rows="2"
                  placeholder="Brief overview of products & specialty items..."
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.88rem', marginTop: '1rem', fontSize: '0.95rem' }}>
            {loading ? 'Creating Enterprise Account...' : role === 'VENDOR' ? 'Register Vendor Partner Store' : 'Create Customer Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Log In
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
