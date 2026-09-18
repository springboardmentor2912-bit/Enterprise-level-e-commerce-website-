import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AuthService from '../services/AuthService'

export default function ProfileEdit() {
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    bio: '',
    phoneNumber: '',
    location: '',
    password: ''
  })
  
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true
    const fetchProfile = async () => {
      try {
        const data = await AuthService.getUserProfile()
        if (isMounted) {
          setFormData({
            username: data.username || '',
            email: data.email || '',
            fullName: data.fullName || '',
            bio: data.bio || '',
            phoneNumber: data.phoneNumber || '',
            location: data.location || '',
            password: '' // Kept empty unless they want to change it
          })
        }
      } catch (err) {
        if (isMounted) setApiError(err.response?.data?.message || 'Failed to load user profile for editing.')
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchProfile()
    return () => { isMounted = false }
  }, [])

  const validate = () => {
    const newErrors = {}
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3 || formData.username.length > 20) {
      newErrors.username = 'Username must be between 3 and 20 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (formData.password && formData.password.trim().length > 0 && formData.password.trim().length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    if (apiError) setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)
    try {
      // Create request payload. If password is empty, don't send it or send it as empty/null
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        fullName: formData.fullName.trim() || null,
        bio: formData.bio.trim() || null,
        phoneNumber: formData.phoneNumber.trim() || null,
        location: formData.location.trim() || null,
        password: formData.password.trim() ? formData.password.trim() : null
      }
      
      await AuthService.updateUserProfile(payload)
      navigate('/profile')
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile. Please try again.'
      setApiError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="auth-bg">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderWidth: '3px' }}></div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading profile data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-bg">
      <div className="auth-card" style={{ maxWidth: '550px', animation: 'cardFadeIn 0.5s ease' }}>
        
        {/* Header */}
        <div className="auth-header">
          <h1 className="auth-title">Edit Profile</h1>
          <p className="auth-subtitle">Update your personal information and credentials</p>
        </div>

        {/* API Error Message */}
        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            ⚠️ {apiError}
          </div>
        )}

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          
          <div className="profile-edit-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            
            {/* Username */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-username">Username</label>
              <div className="input-wrapper">
                <input
                  id="edit-username"
                  type="text"
                  name="username"
                  className="form-input"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  style={{ paddingLeft: '1rem' }}
                />
              </div>
              {errors.username && <span className="field-error">⚠ {errors.username}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-email">Email Address</label>
              <div className="input-wrapper">
                <input
                  id="edit-email"
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  style={{ paddingLeft: '1rem' }}
                />
              </div>
              {errors.email && <span className="field-error">⚠ {errors.email}</span>}
            </div>

          </div>

          <div className="profile-edit-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-fullname">Full Name</label>
              <div className="input-wrapper">
                <input
                  id="edit-fullname"
                  type="text"
                  name="fullName"
                  className="form-input"
                  placeholder="Your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={{ paddingLeft: '1rem' }}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-phone">Phone Number</label>
              <div className="input-wrapper">
                <input
                  id="edit-phone"
                  type="text"
                  name="phoneNumber"
                  className="form-input"
                  placeholder="Your phone number"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  style={{ paddingLeft: '1rem' }}
                />
              </div>
            </div>

          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
            
            {/* Location */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-location">Location</label>
              <div className="input-wrapper">
                <input
                  id="edit-location"
                  type="text"
                  name="location"
                  className="form-input"
                  placeholder="e.g. New York, USA"
                  value={formData.location}
                  onChange={handleChange}
                  style={{ paddingLeft: '1rem' }}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-bio">Short Bio</label>
              <div className="input-wrapper">
                <textarea
                  id="edit-bio"
                  name="bio"
                  className="form-input"
                  placeholder="Tell us about yourself..."
                  value={formData.bio}
                  onChange={handleChange}
                  rows="3"
                  style={{ 
                    padding: '0.875rem 1rem', 
                    resize: 'vertical', 
                    minHeight: '80px', 
                    fontFamily: 'inherit',
                    lineHeight: '1.5'
                  }}
                />
              </div>
            </div>

            {/* Change Password (Optional) */}
            <div className="form-group">
              <label className="form-label" htmlFor="edit-password">New Password (Leave blank to keep current)</label>
              <div className="input-wrapper">
                <input
                  id="edit-password"
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  style={{ paddingLeft: '1rem' }}
                />
              </div>
              {errors.password && <span className="field-error">⚠ {errors.password}</span>}
            </div>

          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={() => navigate('/profile')} 
              disabled={submitting}
              style={{ 
                width:"200px",
                marginTop: '0', 
                background: 'rgba(255, 255, 255, 0.05)', 
                border: '1px solid var(--glass-border)', 
                color: 'var(--text-primary)' 
              }}
            >
              Cancel
            </button>
            
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={submitting}
              style={{ marginTop: '0', flex: '1.5' }}
            >
              {submitting ? (
                <div className="btn-loader">
                  <span className="spinner"></span>
                  Saving Changes...
                </div>
              ) : 'Save Changes'}
            </button>
          </div>

        </form>

      </div>
    </div>
  )
}
