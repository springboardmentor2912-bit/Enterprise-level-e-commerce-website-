import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Lock, Briefcase, Eye, EyeOff, Check, X, Sun, Moon, CheckCircle2, MapPin } from 'lucide-react';
import { extractErrorMessage } from '../utils/errorHandler';

const passwordRules = [
  { id: 'length', label: 'Minimum 8 characters', test: (pwd) => pwd.length >= 8 },
  { id: 'capital', label: 'One uppercase letter (A-Z)', test: (pwd) => /[A-Z]/.test(pwd) },
  { id: 'small', label: 'One lowercase letter (a-z)', test: (pwd) => /[a-z]/.test(pwd) },
  { id: 'number', label: 'One numeric digit (0-9)', test: (pwd) => /[0-9]/.test(pwd) },
  { id: 'special', label: 'One special character (e.g. @$!%*?&#)', test: (pwd) => /[^A-Za-z0-9]/.test(pwd) }
];

export default function Register({ switchToLogin, theme, onToggleTheme }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
    warehouseId: null,
    warehouseName: ''
  });
  const [availableWarehouses, setAvailableWarehouses] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [flashMessage, setFlashMessage] = useState({ type: '', title: '', text: '' });
  const [generatedVendorCode, setGeneratedVendorCode] = useState(null);

  // Fetch active warehouses for staff registration selection
  useEffect(() => {
    axios.get('http://localhost:8080/api/warehouses')
      .then(res => {
        if (Array.isArray(res.data)) {
          setAvailableWarehouses(res.data.filter(w => w.active));
        }
      })
      .catch(err => console.error("Failed to load warehouses list", err));
  }, []);

  // Auto-dismiss flash messages after 3 seconds
  useEffect(() => {
    if (flashMessage.text) {
      const timer = setTimeout(() => {
        setFlashMessage({ type: '', title: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFlashMessage({ type: '', title: '', text: '' });

    if (formData.password !== confirmPassword) {
      setFlashMessage({
        type: 'error',
        title: 'Validation failed.',
        text: 'Passwords do not match. Please re-type your password correctly.'
      });
      return;
    }

    // Validate password rules
    const isPasswordValid = passwordRules.every(rule => rule.test(formData.password));
    if (!isPasswordValid) {
      setFlashMessage({
        type: 'error',
        title: 'Weak Password.',
        text: 'Please ensure your password satisfies all strength requirements before registering.'
      });
      return;
    }

    // Validate special role-based email suffixes
    const email = formData.email.trim().toLowerCase();
    const role = formData.role.toUpperCase();

    if (role === 'ADMINISTRATOR' && !email.endsWith('@admin')) {
      setFlashMessage({
        type: 'error',
        title: 'Invalid Email ID',
        text: 'Administrator accounts must register with an email ending in @admin (e.g. abcd123@admin).'
      });
      return;
    }
    if (role === 'WAREHOUSE_STAFF') {
      if (!email.endsWith('@staff')) {
        setFlashMessage({
          type: 'error',
          title: 'Invalid Email ID',
          text: 'Warehouse Staff accounts must register with an email ending in @staff (e.g. abcd123@staff).'
        });
        return;
      }
      if (!formData.warehouseId) {
        setFlashMessage({
          type: 'error',
          title: 'Warehouse Assignment Required',
          text: 'Please choose an assigned warehouse facility from the dropdown list.'
        });
        return;
      }
    }
    if (role === 'CUSTOMER' && (email.endsWith('@admin') || email.endsWith('@staff'))) {
      setFlashMessage({
        type: 'error',
        title: 'Restricted Domain',
        text: 'Standard Customer emails cannot end with @admin or @staff.'
      });
      return;
    }

    try {
      const res = await axios.post('http://localhost:8080/api/auth/register', formData);
      if (role === 'VENDOR' && res.data.vendorCode) {
        setGeneratedVendorCode(res.data.vendorCode);
      } else {
        setFlashMessage({
          type: 'success',
          title: 'New account added successfully.',
          text: 'Please wait while we set things up for you...'
        });
        setTimeout(() => switchToLogin(), 2200);
      }
    } catch (err) {
      setFlashMessage({
        type: 'error',
        title: 'Registration failed.',
        text: extractErrorMessage(err, 'Please check your inputs and try again.')
      });
    }
  };

  return (
    <div className="auth-container">
      {flashMessage.text && (
        <div className={`toast-notification ${flashMessage.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          <div className="toast-icon-container">
            {flashMessage.type === 'success' ? <Check size={18} /> : <X size={18} />}
          </div>
          <div>
            <strong className="toast-message-title">{flashMessage.title}</strong>
            <div className="toast-message-desc">{flashMessage.text}</div>
          </div>
        </div>
      )}

      <div className="auth-card" style={{ position: 'relative' }}>
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="btn-icon-only"
          style={{ position: 'absolute', top: '16px', right: '16px', borderRadius: '50%', padding: '6px' }}
          title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {theme === 'dark' ? <Sun size={14} style={{ color: 'var(--accent-blue)' }} /> : <Moon size={14} style={{ color: 'var(--accent-indigo)' }} />}
        </button>

        <div className="auth-header">
          <h2 className="auth-logo">ShopStack</h2>
          <p className="auth-subtitle">Create your enterprise merchant or customer account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-icon-wrapper">
              <User className="input-icon" />
              <input
                type="text"
                placeholder="Tony Stark"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="form-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="input-action-btn"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Re-type Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>

            {/* Real-time Password Checker */}
            {formData.password && (
              <div className="password-checker-container" style={{
                marginTop: '10px',
                padding: '12px',
                background: 'var(--bg-input)',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Password strength requirements:
                </div>
                {passwordRules.map((rule) => {
                  const isValid = rule.test(formData.password);
                  return (
                    <div key={rule.id} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: isValid ? 'var(--accent-emerald)' : 'var(--text-muted)',
                      transition: 'color var(--transition-fast)'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isValid ? 'var(--accent-emerald)' : 'var(--text-muted)',
                        transition: 'background var(--transition-fast)'
                      }} />
                      <span>{rule.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Account Role</label>
            <div className="input-icon-wrapper">
              <Briefcase className="input-icon" />
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="form-input"
                style={{ paddingLeft: '44px' }}
              >
                <option value="CUSTOMER">Customer</option>
                <option value="VENDOR">Vendor</option>
                <option value="ADMINISTRATOR">Administrator</option>
                <option value="WAREHOUSE_STAFF">Warehouse Staff</option>
              </select>
            </div>

            {/* Helper label for required special email suffix */}
            {formData.role !== 'CUSTOMER' && (
              <div style={{ fontSize: '11px', color: 'var(--accent-indigo)', marginTop: '4px', fontWeight: '500' }}>
                {formData.role === 'VENDOR' ? (
                  <span>A permanent unique <strong>6-digit Vendor ID</strong> will be generated upon registration.</span>
                ) : (
                  <span>Note: {formData.role === 'ADMINISTRATOR' ? 'Administrator' : 'Warehouse Staff'} email must end with {' '}
                    <strong>{formData.role === 'ADMINISTRATOR' ? '@admin' : '@staff'}</strong>.</span>
                )}
              </div>
            )}
          </div>

          {/* Assigned Warehouse Facility selection for Warehouse Staff */}
          {formData.role === 'WAREHOUSE_STAFF' && (
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label className="form-label">Assigned Warehouse Facility *</label>
              <div className="input-icon-wrapper">
                <MapPin className="input-icon" />
                <select
                  required
                  value={formData.warehouseId || ''}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const selWh = availableWarehouses.find(w => String(w.id) === String(selId));
                    setFormData({ 
                      ...formData, 
                      warehouseId: selId ? parseInt(selId) : null,
                      warehouseName: selWh ? `${selWh.name} (${selWh.code})` : ''
                    });
                  }}
                  className="form-input"
                  style={{ paddingLeft: '44px' }}
                >
                  <option value="">-- Choose Assigned Warehouse Facility --</option>
                  {availableWarehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name} ({wh.code}) - {wh.city}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                You will receive and process orders specifically allocated to this warehouse facility.
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '12px' }}>
            Register
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{' '}
          <span onClick={switchToLogin} className="auth-link">
            Login here
          </span>
        </p>
      </div>

      {/* Unique Vendor ID Center Overlay Dialog Modal */}
      {generatedVendorCode && (
        <div className="modal-overlay" style={{ zIndex: 3000 }}>
          <div className="dialog-content" style={{ maxWidth: '440px', textAlign: 'center', padding: '36px', boxShadow: 'var(--shadow-lg)' }}>
            <div className="flex-center" style={{ marginBottom: '16px', color: 'var(--accent-emerald)' }}>
              <CheckCircle2 size={44} />
            </div>
            <h2 className="modal-title" style={{ marginBottom: '8px', fontSize: '20px' }}>Vendor ID Generated</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px', lineHeight: '1.5' }}>
              Your merchant vendor account has been registered successfully! Here is your permanent, unique **6-digit Vendor ID**. You will need this code to log in or switch modes.
            </p>
            <div style={{
              background: 'var(--bg-input)',
              border: '2px dashed var(--accent-indigo)',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '28px',
              fontWeight: '800',
              letterSpacing: '6px',
              color: 'var(--text-primary)',
              marginBottom: '20px',
              fontFamily: 'monospace'
            }}>
              {generatedVendorCode}
            </div>
            <button
              type="button"
              onClick={() => {
                setGeneratedVendorCode(null);
                switchToLogin();
              }}
              className="btn btn-primary btn-block"
            >
              I have copied my Vendor ID
            </button>
          </div>
        </div>
      )}
    </div>
  );
}