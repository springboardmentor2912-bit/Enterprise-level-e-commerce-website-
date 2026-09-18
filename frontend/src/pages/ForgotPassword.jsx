import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api';
import { getErrorMessage } from '../api/axios';
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await authApi.forgotPassword(email);
      setMessage('If an account with that email exists, a password reset link has been sent.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to request password reset.'));
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 76px)', padding: '2rem 1rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 4px 20px var(--primary-glow)'
          }}>
            <Mail size={26} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff' }}>Forgot Password?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Enter your email to receive a password reset link.</p>
        </div>
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.3)', color: '#6ee7b7', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
            {message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="var(--text-subtle)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                className="input-field"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}>
            Send Reset Link
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Remembered? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
