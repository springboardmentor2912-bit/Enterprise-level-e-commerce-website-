import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productApi } from '../../api/productApi'
import { vendorApi } from '../../api/vendorApi'
import ErrorBanner from '../../components/ErrorBanner'

export default function VendorAddProductPage() {
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({
    name: '', brand: '', description: '', price: '', discountPrice: '',
    categoryId: '', images: '', initialStock: 0, lowStockThreshold: 10, warehouseLocation: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    productApi.getCategories().then(({ data }) => setCategories(data.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
        categoryId: Number(form.categoryId),
        images: form.images ? form.images.split(',').map((s) => s.trim()).filter(Boolean) : [],
        initialStock: Number(form.initialStock),
        lowStockThreshold: Number(form.lowStockThreshold),
      }
      await vendorApi.createProduct(payload)
      navigate('/vendor/products')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Add a new product</h2>
      <ErrorBanner message={error} />
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 text-sm">
        <input required placeholder="Product name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 col-span-2" />
        <input placeholder="Brand" value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2" />
        <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2">
          <option value="">Select category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <textarea placeholder="Description" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 col-span-2" rows={3} />
        <input required type="number" step="0.01" placeholder="Price (₹)" value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2" />
        <input type="number" step="0.01" placeholder="Discount price (optional)" value={form.discountPrice}
          onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2" />
        <input placeholder="Image URLs (comma-separated)" value={form.images}
          onChange={(e) => setForm({ ...form, images: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 col-span-2" />
        <input type="number" placeholder="Initial stock" value={form.initialStock}
          onChange={(e) => setForm({ ...form, initialStock: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2" />
        <input type="number" placeholder="Low stock threshold" value={form.lowStockThreshold}
          onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2" />
        <input placeholder="Warehouse location" value={form.warehouseLocation}
          onChange={(e) => setForm({ ...form, warehouseLocation: e.target.value })}
          className="border border-gray-300 rounded-md px-3 py-2 col-span-2" />

        <button disabled={loading} className="col-span-2 bg-brand-600 text-white rounded-md py-2.5 font-medium hover:bg-brand-700 disabled:opacity-50">
          {loading ? 'Submitting...' : 'Submit for approval'}
        </button>
      </form>
    </div>
  )
}
