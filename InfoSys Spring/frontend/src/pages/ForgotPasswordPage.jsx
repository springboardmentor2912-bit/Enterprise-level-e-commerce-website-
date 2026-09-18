import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthService from '../services/AuthService'
import { getErrorMessage } from '../utils/errorHandler'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [resetToken, setResetToken] = useState('')
  const [apiError, setApiError] = useState('')
  const [copied, setCopied] = useState(false)

  const validateEmail = () => {
    if (!email) return 'Email is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Please enter a valid email'
    return ''
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const err = validateEmail()
    if (err) {
      setEmailError(err)
      return
    }
    setLoading(true)
    setApiError('')
    try {
      const data = await AuthService.forgotPassword(email)
      setResetToken(data.resetToken || '')
      setSubmitted(true)
    } catch (error) {
      const msg = getErrorMessage(error, 'Something went wrong. Please try again.')
      setApiError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(resetToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (submitted) {
    return (
      <div className="auth-bg">
        <div className="auth-card" style={{ maxWidth: '480px' }}>
          <div className="auth-header">
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
              boxShadow: '0 0 24px rgba(16,185,129,0.4)'
            }}>
              <span style={{ fontSize: '2rem' }}>✓</span>
            </div>
            <h1 className="auth-title" style={{ fontSize: '1.5rem' }}>Check your details</h1>
            <p className="auth-subtitle">
              A reset token has been generated for <strong>{email}</strong>. Copy it and use it on the reset password page.
            </p>
          </div>

          {resetToken && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '12px',
              padding: '1rem 1.25rem',
              marginBottom: '1.25rem',
            }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Your Reset Token
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <code style={{
                  flex: 1,
                  fontSize: '0.72rem',
                  wordBreak: 'break-all',
                  color: 'var(--accent-primary)',
                  lineHeight: 1.5,
                }}>
                  {resetToken}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  style={{
                    flexShrink: 0,
                    padding: '0.4rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)',
                    color: copied ? '#10b981' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    transition: 'all 0.2s',
                  }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: '0.6rem' }}>
                ⏱ Token expires in 15 minutes
              </p>
            </div>
          )}

          <Link
            to={`/reset-password?token=${encodeURIComponent(resetToken)}`}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
          >
            Reset My Password →
          </Link>

          <div className="auth-footer" style={{ marginTop: '1rem' }}>
            <Link to="/login" className="auth-link" id="back-to-login-link">
              ← Back to Sign In
            </Link>
          </div>
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
            <span style={{ fontSize: '1.6rem' }}>🔑</span>
          </div>
          <h1 className="auth-title">Forgot Password?</h1>
          <p className="auth-subtitle">
            No worries! Enter your registered email and we&apos;ll generate a secure reset token for you.
          </p>
        </div>

        {/* Error Alert */}
        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            ⚠️ {apiError}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="forgot-email">Email Address</label>
            <div className="input-wrapper">
              <input
                id="forgot-email"
                type="email"
                name="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (emailError) setEmailError('')
                  if (apiError) setApiError('')
                }}
                autoComplete="email"
              />
            </div>
            {emailError && <span className="field-error">⚠ {emailError}</span>}
          </div>

          <button
            id="forgot-password-submit-btn"
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="btn-loader">
                <span className="spinner" />
                Generating Token...
              </span>
            ) : (
              'Send Reset Token'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="auth-footer">
          Remember your password?
          <Link to="/login" className="auth-link" id="back-to-login-fp-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
