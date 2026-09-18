import React, { useEffect, useState } from 'react'
import { couponApi } from '../../api/couponApi'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    code: '', description: '', discountType: 'PERCENTAGE', discountValue: '',
    minOrderAmount: '', maxDiscountAmount: '', usageLimit: '',
  })
  const [creating, setCreating] = useState(false)

  const load = () => {
    setLoading(true)
    couponApi.list({ page: 0, size: 30 })
      .then(({ data }) => setCoupons(data.data.content))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    setCreating(true)
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      }
      await couponApi.create(payload)
      setForm({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: '', minOrderAmount: '', maxDiscountAmount: '', usageLimit: '' })
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create coupon')
    } finally {
      setCreating(false)
    }
  }

  const deactivate = async (id) => {
    await couponApi.deactivate(id)
    load()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="flex flex-col gap-6">
      <ErrorBanner message={error} />

      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="font-semibold mb-4">Create a coupon</h2>
        <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3 text-sm">
          <input required placeholder="Code (e.g. WELCOME10)" value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            className="border border-gray-300 rounded-md px-3 py-2 col-span-2" />
          <input placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 col-span-2" />
          <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2">
            <option value="PERCENTAGE">Percentage off</option>
            <option value="FIXED_AMOUNT">Flat amount off</option>
          </select>
          <input required type="number" placeholder={form.discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount ₹'}
            value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2" />
          <input type="number" placeholder="Min order amount (optional)" value={form.minOrderAmount}
            onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2" />
          {form.discountType === 'PERCENTAGE' && (
            <input type="number" placeholder="Max discount cap (optional)" value={form.maxDiscountAmount}
              onChange={(e) => setForm({ ...form, maxDiscountAmount: e.target.value })}
              className="border border-gray-300 rounded-md px-3 py-2" />
          )}
          <input type="number" placeholder="Usage limit (optional)" value={form.usageLimit}
            onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2" />
          <button disabled={creating} className="col-span-2 bg-brand-600 text-white rounded-md py-2 font-medium hover:bg-brand-700 disabled:opacity-50">
            {creating ? 'Creating...' : 'Create coupon'}
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-5">
        <h2 className="font-semibold mb-4">Existing coupons</h2>
        {coupons.length === 0 ? (
          <p className="text-gray-400 text-sm">No coupons created yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {coupons.map((c) => (
              <div key={c.id} className="flex justify-between items-center border-b border-gray-100 pb-2 text-sm">
                <div>
                  <p className="font-medium">{c.code} — {c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}</p>
                  <p className="text-gray-400 text-xs">Used {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''} · {c.currentlyValid ? 'Valid' : 'Not currently valid'}</p>
                </div>
                {c.active && (
                  <button onClick={() => deactivate(c.id)} className="text-red-500 hover:text-red-700">Deactivate</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
