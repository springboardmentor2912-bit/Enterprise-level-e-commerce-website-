import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { authApi } from '../api/authApi'
import { setCredentials } from '../features/auth/authSlice'
import ErrorBanner from '../components/ErrorBanner'

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phone: '', role: 'CUSTOMER', businessName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await authApi.register(form)
      dispatch(setCredentials(data.data))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-lg border border-gray-200">
      <h1 className="text-2xl font-bold mb-6">Create your ShopStack account</h1>
      <ErrorBanner message={error} />
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm font-medium">Full name</label>
          <input required value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Email</label>
          <input type="email" required value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Password</label>
          <input type="password" required minLength={8} value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
          <p className="text-xs text-gray-400 mt-1">At least 8 characters</p>
        </div>
        <div>
          <label className="text-sm font-medium">Phone (optional)</label>
          <input value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="text-sm font-medium">Account type</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2">
            <option value="CUSTOMER">Customer — shop the marketplace</option>
            <option value="VENDOR">Vendor — sell products</option>
          </select>
        </div>
        {form.role === 'VENDOR' && (
          <div>
            <label className="text-sm font-medium">Business name</label>
            <input required value={form.businessName}
              onChange={(e) => setForm({ ...form, businessName: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
            <p className="text-xs text-gray-400 mt-1">Your account needs admin approval before you can list products.</p>
          </div>
        )}
        <button disabled={loading} className="bg-brand-600 text-white rounded-md py-2 font-medium hover:bg-brand-700 disabled:opacity-50">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="text-sm text-gray-500 mt-4">
        Already have an account? <Link to="/login" className="text-brand-600 font-medium">Log in</Link>
      </p>
    </div>
  )
}
