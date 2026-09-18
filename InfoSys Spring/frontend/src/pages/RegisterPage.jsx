import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthService from '../services/AuthService'
import { getErrorMessage } from '../utils/errorHandler'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER',
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [apiSuccess, setApiSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const validate = () => {
    const newErrors = {}
    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = 'Username must be 3–20 characters'
    }
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    if (apiError) setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setLoading(true)
    try {
      await AuthService.register(formData.username, formData.email, formData.password, formData.role)
      setApiSuccess('Account created successfully! Redirecting to login...')
      setTimeout(() => navigate('/login'), 2000)
    } catch (error) {
      const msg = getErrorMessage(error, 'Registration failed. Please try again.')
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  const getPasswordStrength = () => {
    const p = formData.password
    if (!p) return null
    let score = 0
    if (p.length >= 8) score++
    if (/[A-Z]/.test(p)) score++
    if (/[0-9]/.test(p)) score++
    if (/[^A-Za-z0-9]/.test(p)) score++
    if (score <= 1) return { label: 'Weak', color: '#ef4444', width: '25%' }
    if (score === 2) return { label: 'Fair', color: '#f59e0b', width: '50%' }
    if (score === 3) return { label: 'Good', color: '#10b981', width: '75%' }
    return { label: 'Strong', color: '#6c63ff', width: '100%' }
  }

  const strength = getPasswordStrength()

  return (
    <div className="auth-bg">
      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-logo">✨</div>
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join us today — it&apos;s free forever</p>
        </div>

        {/* Alerts */}
        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            ⚠️ {apiError}
          </div>
        )}
        {apiSuccess && (
          <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>
            ✅ {apiSuccess}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Account Type / Role Selection */}
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div className="register-role-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem' }}>
              {[
                { key: 'CUSTOMER', label: 'Customer', subtitle: 'Shopping', icon: '🛍️' },
                { key: 'VENDOR', label: 'Vendor', subtitle: 'Store Owner', icon: '🏪' },
                { key: 'WAREHOUSE_STAFF', label: 'Warehouse', subtitle: 'Logistics', icon: '🏭' },
              ].map((r) => {
                const isActive = formData.role === r.key
                return (
                  <button
                    key={r.key}
                    type="button"
                    id={`reg-role-${r.key.toLowerCase()}`}
                    onClick={() => setFormData((prev) => ({ ...prev, role: r.key }))}
                    style={{
                      padding: '0.75rem 0.4rem',
                      background: isActive ? 'var(--gold-dim)' : 'var(--bg-card)',
                      border: '1px solid ' + (isActive ? 'var(--gold)' : 'var(--border)'),
                      color: isActive ? 'var(--gold)' : 'var(--text-secondary)',
                      borderRadius: 'var(--radius-btn)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      boxShadow: isActive ? '0 0 12px rgba(212,175,55,0.25)' : 'none',
                      transition: 'var(--transition)'
                    }}
                  >
                    <span style={{ fontSize: '1.3rem', marginBottom: '0.1rem' }}>{r.icon}</span>
                    <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{r.label}</span>
                    <span style={{ fontSize: '0.68rem', color: isActive ? 'var(--gold)' : 'var(--text-muted)', fontWeight: '500' }}>
                      {r.subtitle}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Username */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-username">Username</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input
                id="reg-username"
                type="text"
                name="username"
                className="form-input"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
              />
            </div>
            {errors.username && <span className="field-error">⚠ {errors.username}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                id="reg-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="field-error">⚠ {errors.email}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="reg-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input has-toggle"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {/* Password strength bar */}
            {strength && (
              <div style={{ marginTop: '0.4rem' }}>
                <div style={{
                  height: '4px',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.08)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: strength.width,
                    background: strength.color,
                    transition: 'all 0.3s ease',
                    borderRadius: '4px'
                  }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: strength.color, marginTop: '0.25rem', display: 'block' }}>
                  {strength.label} password
                </span>
              </div>
            )}
            {errors.password && <span className="field-error">⚠ {errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔑</span>
              <input
                id="reg-confirm"
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                className="form-input has-toggle"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm((v) => !v)}
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.confirmPassword && <span className="field-error">⚠ {errors.confirmPassword}</span>}
          </div>

          {/* Submit */}
          <button
            id="register-submit-btn"
            type="submit"
            className="btn-primary"
            disabled={loading || !!apiSuccess}
          >
            {loading ? (
              <span className="btn-loader">
                <span className="spinner" />
                Creating account...
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          Already have an account?
          <Link to="/login" className="auth-link" id="go-login-link">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
