import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, Check, X, Sun, Moon, Store, KeyRound } from 'lucide-react';
import { extractErrorMessage } from '../utils/errorHandler';

const passwordRules = [
  { id: 'length', label: 'Minimum 8 characters', test: (pwd) => pwd.length >= 8 },
  { id: 'capital', label: 'One uppercase letter (A-Z)', test: (pwd) => /[A-Z]/.test(pwd) },
  { id: 'small', label: 'One lowercase letter (a-z)', test: (pwd) => /[a-z]/.test(pwd) },
  { id: 'number', label: 'One numeric digit (0-9)', test: (pwd) => /[0-9]/.test(pwd) },
  { id: 'special', label: 'One special character (e.g. @$!%*?&#)', test: (pwd) => /[^A-Za-z0-9]/.test(pwd) }
];

export default function Login({ switchToRegister, onLoginSuccess, theme, onToggleTheme }) {
  const [formData, setFormData] = useState({ email: '', password: '', vendorCode: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [flashMessage, setFlashMessage] = useState({ type: '', title: '', text: '' });

  // Forgot Password modal states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  // Auto-dismiss flash messages after 3 seconds
  useEffect(() => {
    if (flashMessage.text) {
      const timer = setTimeout(() => {
        setFlashMessage({ type: '', title: '', text: '' });
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [flashMessage]);

  const handleCloseForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setResetEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setShowResetPassword(false);
    setResetLoading(false);
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/forgot-password', { email: resetEmail.trim() });
      setFlashMessage({
        type: 'success',
        title: 'Email verified.',
        text: 'Account found! You can now set your new password.'
      });
      setForgotStep(2);
    } catch (err) {
      setFlashMessage({
        type: 'error',
        title: 'Verification failed.',
        text: extractErrorMessage(err, 'No account found with this email address.')
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    // Validate password rules
    const isPasswordValid = passwordRules.every(rule => rule.test(newPassword));
    if (!isPasswordValid) {
      setFlashMessage({
        type: 'error',
        title: 'Weak Password.',
        text: 'Please ensure your new password satisfies all strength requirements.'
      });
      return;
    }

    if (newPassword.trim() !== confirmPassword.trim()) {
      setFlashMessage({
        type: 'error',
        title: 'Validation failed.',
        text: 'Passwords do not match. Please re-type your new password correctly.'
      });
      return;
    }
    setResetLoading(true);
    try {
      await axios.post('http://localhost:8080/api/auth/reset-password', {
        email: resetEmail.trim(),
        newPassword: newPassword.trim()
      });
      setFlashMessage({
        type: 'success',
        title: 'Success!',
        text: 'Password updated! Please log in with your new password.'
      });
      handleCloseForgotModal();
    } catch (err) {
      setFlashMessage({
        type: 'error',
        title: 'Reset failed.',
        text: extractErrorMessage(err, 'Failed to reset password.')
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFlashMessage({ type: '', title: '', text: '' });

    if (formData.vendorCode && formData.vendorCode.trim().length > 0 && formData.vendorCode.trim().length !== 6) {
      setFlashMessage({
        type: 'error',
        title: 'Validation failed.',
        text: '6-digit Vendor ID must be exactly 6 digits.'
      });
      return;
    }

    const cleanEmail = (formData.email || '').trim().toLowerCase();
    const cleanVendorCode = formData.vendorCode ? formData.vendorCode.trim() : null;

    // Automatically infer role based on email suffix and vendor code
    const inferredRole = cleanEmail.endsWith('@admin')
      ? 'ADMINISTRATOR'
      : cleanEmail.endsWith('@staff')
      ? 'WAREHOUSE_STAFF'
      : cleanVendorCode && cleanVendorCode.length === 6
      ? 'VENDOR'
      : 'CUSTOMER';

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email: cleanEmail,
        password: formData.password,
        role: inferredRole,
        vendorCode: cleanVendorCode
      });
      setFlashMessage({ 
        type: 'success', 
        title: 'Login successful.', 
        text: `Welcome back, ${response.data.fullName}! Redirecting to dashboard...` 
      });
      setTimeout(() => onLoginSuccess(response.data), 1500);
    } catch (error) {
      const errMsg = extractErrorMessage(error, 'Invalid email, password, or vendor ID.');
      const isVendorErr = errMsg.toLowerCase().includes('vendor id not detected');
      setFlashMessage({ 
        type: 'error', 
        title: isVendorErr ? 'Vendor ID not detected.' : 'Authentication failed.', 
        text: isVendorErr ? 'Vendor ID not detected.' : errMsg 
      });
    }
  };

  return (
    <div className="auth-container">
      {/* Floating Top Banner Flash Toast */}
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
          <p className="auth-subtitle">Sign in to your merchant or customer account</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <span 
                onClick={() => setShowForgotModal(true)} 
                className="auth-link" 
                style={{ fontSize: '12px', cursor: 'pointer' }}
              >
                Forgot Password?
              </span>
            </div>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Store size={14} style={{ color: 'var(--accent-indigo)' }} />
                <span>6-Digit Vendor ID</span>
              </label>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '500' }}>
                (Optional / If Any)
              </span>
            </div>
            <div className="input-icon-wrapper">
              <KeyRound className="input-icon" />
              <input
                type="text"
                name="vendorCode"
                maxLength="6"
                placeholder="e.g. 123456 (Leave blank if Customer)"
                value={formData.vendorCode}
                onChange={(e) => setFormData({ ...formData, vendorCode: e.target.value.replace(/\D/g, '') })}
                className="form-input"
                style={{ letterSpacing: formData.vendorCode ? '2px' : 'normal' }}
              />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
              Leave blank to log in as Customer. Enter your 6-digit ID to log in to Vendor mode.
            </p>
          </div>

          <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '12px' }}>
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <span onClick={switchToRegister} className="auth-link">
            Register here
          </span>
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal-overlay" onClick={() => handleCloseForgotModal()}>
          <div className="dialog-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Reset Password</h2>
              <button onClick={() => handleCloseForgotModal()} className="btn-icon-only">
                <X size={18} />
              </button>
            </div>

            {forgotStep === 1 ? (
              <form onSubmit={handleVerifyEmail} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Enter your registered email address below. We'll verify if the account exists.
                </p>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address</label>
                  <div className="input-icon-wrapper">
                    <Mail className="input-icon" />
                    <input 
                      type="email" 
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={resetLoading}>
                  {resetLoading ? 'Verifying...' : 'Next'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  Email verified! Enter your new password below.
                </p>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">New Password</label>
                  <div className="input-icon-wrapper">
                    <Lock className="input-icon" />
                    <input 
                      type={showResetPassword ? "text" : "password"} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-input"
                      required
                      minLength="4"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="input-action-btn"
                    >
                      {showResetPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Real-time Password Checker inside Reset Step */}
                  {newPassword && (
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
                        const isValid = rule.test(newPassword);
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

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Re-type New Password</label>
                  <div className="input-icon-wrapper">
                    <Lock className="input-icon" />
                    <input 
                      type={showResetPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="form-input"
                      required
                      minLength="4"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className="input-action-btn"
                    >
                      {showResetPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={resetLoading}>
                  {resetLoading ? 'Resetting Password...' : 'Reset Password'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}