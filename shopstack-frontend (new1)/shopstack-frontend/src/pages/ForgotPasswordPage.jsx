import React, { useState } from 'react'
import { authApi } from '../api/authApi'
import ErrorBanner from '../components/ErrorBanner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      const { data } = await authApi.forgotPassword(email)
      setMessage(data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-lg border border-gray-200">
      <h1 className="text-2xl font-bold mb-2">Forgot your password?</h1>
      <p className="text-sm text-gray-500 mb-6">Enter your email and we'll send you a reset link.</p>
      <ErrorBanner message={error} />
      {message && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm mb-4">{message}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="border border-gray-300 rounded-md px-3 py-2" />
        <button disabled={loading} className="bg-brand-600 text-white rounded-md py-2 font-medium hover:bg-brand-700 disabled:opacity-50">
          {loading ? 'Sending...' : 'Send reset link'}
        </button>
      </form>
    </div>
  )
}
