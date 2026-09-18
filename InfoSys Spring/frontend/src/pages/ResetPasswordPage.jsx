import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthService from '../services/AuthService'
import { getErrorMessage } from '../utils/errorHandler'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [formData, setFormData] = useState({
    token: searchParams.get('token') || '',
    newPassword: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [tokenVerified, setTokenVerified] = useState(null) // null=loading, true=valid, false=invalid

  // Verify token on mount if provided via URL
  useEffect(() => {
    const urlToken = searchParams.get('token')
    if (urlToken) {
      AuthService.verifyResetToken(urlToken)
        .then((data) => setTokenVerified(data.valid))
        .catch(() => setTokenVerified(false))
    } else {
      setTokenVerified(true) // will validate on submit
    }
  }, [searchParams])

  const validate = () => {
    const newErrors = {}
    if (!formData.token.trim()) newErrors.token = 'Reset token is required'
    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters'
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.newPassword !== formData.confirmPassword) {
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
      await AuthService.resetPassword(formData.token.trim(), formData.newPassword)
      setSuccess(true)
    } catch (error) {
      const msg = getErrorMessage(error, 'Failed to reset password. Please try again.')
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Token invalid view
  if (tokenVerified === false) {
    return (
      <div className="auth-bg">
        <div className="auth-card" style={{ maxWidth: '440px', textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #ef4444, #dc2626)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 0 24px rgba(239,68,68,0.4)'
          }}>
            <span style={{ fontSize: '2rem' }}>✕</span>
          </div>
          <h1 className="auth-title" style={{ fontSize: '1.5rem' }}>Invalid Token</h1>
          <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
            This reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
          >
            Request New Reset Link
          </Link>
          <div className="auth-footer" style={{ marginTop: '1rem' }}>
            <Link to="/login" className="auth-link" id="expired-back-to-login">← Back to Sign In</Link>
          </div>
        </div>
      </div>
    )
  }

  // Success view
  if (success) {
    return (
      <div className="auth-bg">
        <div className="auth-card" style={{ maxWidth: '440px', textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 0 24px rgba(16,185,129,0.4)'
          }}>
            <span style={{ fontSize: '2rem' }}>✓</span>
          </div>
          <h1 className="auth-title" style={{ fontSize: '1.5rem' }}>Password Reset!</h1>
          <p className="auth-subtitle" style={{ marginBottom: '1.5rem' }}>
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <button
            id="go-login-after-reset"
            className="btn-primary"
            onClick={() => navigate('/login')}
          >
            Go to Sign In
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-bg">
      <div className="auth-card" style={{ maxWidth: '440px' }}>
        {/* Header */}
        <div className="auth-header">
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
            boxShadow: '0 0 20px rgba(99,102,241,0.4)'
          }}>
            <span style={{ fontSize: '1.6rem' }}>🔒</span>
          </div>
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">Enter your reset token and choose a strong new password.</p>
        </div>

        {/* Error Alert */}
        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            ⚠️ {apiError}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Reset Token */}
          <div className="form-group">
            <label className="form-label" htmlFor="reset-token">Reset Token</label>
            <div className="input-wrapper">
              <input
                id="reset-token"
                type="text"
                name="token"
                className="form-input"
                placeholder="Paste your reset token here"
                value={formData.token}
                onChange={handleChange}
                autoComplete="off"
              />
            </div>
            {errors.token && <span className="field-error">⚠ {errors.token}</span>}
          </div>

          {/* New Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="new-password">New Password</label>
            <div className="input-wrapper">
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                className="form-input has-toggle"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={handleChange}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label="Toggle new password visibility"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.newPassword && <span className="field-error">⚠ {errors.newPassword}</span>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="confirm-password">Confirm Password</label>
            <div className="input-wrapper">
              <input
                id="confirm-password"
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                className="form-input has-toggle"
                placeholder="••••••••"
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
            id="reset-password-submit-btn"
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loader">
                <span className="spinner" />
                Resetting...
              </span>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          <Link to="/login" className="auth-link" id="reset-back-to-login">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
