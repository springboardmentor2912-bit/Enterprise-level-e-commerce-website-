import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../services/AuthService'

export default function Profile() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    const fetchProfile = async () => {
      try {
        const data = await AuthService.getUserProfile()
        if (isMounted) setProfile(data)
      } catch (err) {
        if (isMounted) setError(err.response?.data?.message || 'Failed to load profile details.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchProfile()
    return () => { isMounted = false }
  }, [])

  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  const handleEditProfile = () => {
    navigate('/profile/edit')
  }

  if (loading) {
    return (
      <div className="auth-bg">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading profile...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="auth-bg">
        <div className="auth-card" style={{ textAlign: 'center', maxWidth: '500px' }}>
          <div className="auth-logo">👤</div>
          <h1 className="auth-title" style={{ marginBottom: '1rem' }}>Error</h1>
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            ⚠️ {error}
          </div>
          <button className="btn-primary" onClick={handleBackToDashboard}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const userInitials = profile?.fullName
    ? profile.fullName.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : (profile?.username ? profile.username.substring(0, 2).toUpperCase() : 'U')

  const formattedDate = profile?.createdAt 
    ? new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A'

  return (
    <div className="auth-bg">
      <div className="auth-card" style={{ maxWidth: '550px', animation: 'cardFadeIn 0.5s ease' }}>
        {/* Profile Avatar and Title */}
        <div className="auth-header" style={{ marginBottom: '1.5rem' }}>
          <div className="auth-logo" style={{ borderRadius: '50%', width: '80px', height: '80px', fontSize: '2rem', marginBottom: '1rem' }}>
            {userInitials}
          </div>
          <h1 className="auth-title" style={{ marginBottom: '0.25rem' }}>{profile?.fullName || profile?.username}</h1>
          <p className="auth-subtitle">
            <span className={`badge ${profile?.role === 'ADMIN' ? 'badge-green' : 'badge-purple'}`}>
              {profile?.role || 'USER'}
            </span>
          </p>
        </div>

        {/* Bio Section */}
        {profile?.bio && (
          <div style={{ 
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px solid var(--glass-border)', 
            borderRadius: '12px', 
            padding: '1rem', 
            marginBottom: '1.5rem', 
            fontSize: '0.925rem', 
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            lineHeight: '1.5',
            textAlign: 'center'
          }}>
            &ldquo;{profile.bio}&rdquo;
          </div>
        )}

        {/* Profile Details List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>

          <div className="profile-detail-row">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', flexShrink: 0 }}>Username</span>
            <span className="detail-value">{profile?.username}</span>
          </div>

          <div className="profile-detail-row">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', flexShrink: 0 }}>Email Address</span>
            <span className="detail-value">{profile?.email}</span>
          </div>

          <div className="profile-detail-row">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', flexShrink: 0 }}>Full Name</span>
            <span className="detail-value" style={{ color: profile?.fullName ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {profile?.fullName || 'Not specified'}
            </span>
          </div>

          <div className="profile-detail-row">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', flexShrink: 0 }}>Phone Number</span>
            <span className="detail-value" style={{ color: profile?.phoneNumber ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {profile?.phoneNumber || 'Not specified'}
            </span>
          </div>

          <div className="profile-detail-row">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', flexShrink: 0 }}>Location</span>
            <span className="detail-value" style={{ color: profile?.location ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {profile?.location || 'Not specified'}
            </span>
          </div>

          <div className="profile-detail-row">
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', flexShrink: 0 }}>Member Since</span>
            <span className="detail-value">{formattedDate}</span>
          </div>

        </div>

        {/* Buttons */}
        <div className="profile-actions">
          <button
            className="btn-primary"
            onClick={handleBackToDashboard}
            style={{
              marginTop: '0',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-primary)'
            }}
          >
            Dashboard
          </button>

          <button
            className="btn-primary"
            onClick={handleEditProfile}
            style={{ marginTop: '0', flex: '1.5' }}
          >
            Edit Profile
          </button>
        </div>

      </div>
    </div>
  )
}