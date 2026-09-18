import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../api/authApi'
import ErrorBanner from '../components/ErrorBanner'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.resetPassword({ token, newPassword })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-lg border border-gray-200">
      <h1 className="text-2xl font-bold mb-6">Set a new password</h1>
      <ErrorBanner message={error} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="password" required minLength={8} value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New password"
          className="border border-gray-300 rounded-md px-3 py-2" />
        <button disabled={loading} className="bg-brand-600 text-white rounded-md py-2 font-medium hover:bg-brand-700 disabled:opacity-50">
          {loading ? 'Saving...' : 'Reset password'}
        </button>
      </form>
    </div>
  )
}
