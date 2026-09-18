import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { authApi } from '../api/authApi'
import { setCredentials } from '../features/auth/authSlice'
import ErrorBanner from '../components/ErrorBanner'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.login(form)
      dispatch(setCredentials(data.data))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-lg border border-gray-200">
      <h1 className="text-2xl font-bold mb-6">Log in to ShopStack</h1>
      <ErrorBanner message={error} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <input
            type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input
            type="password" required value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>
        <Link to="/forgot-password" className="text-sm text-brand-600 self-end">Forgot password?</Link>
        <button disabled={loading} className="bg-brand-600 text-white rounded-md py-2 font-medium hover:bg-brand-700 disabled:opacity-50">
          {loading ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        Don't have an account? <Link to="/register" className="text-brand-600 font-medium">Sign up</Link>
      </p>
    </div>
  )
}
