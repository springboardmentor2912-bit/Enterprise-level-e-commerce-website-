import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { vendorApi } from '../../api/vendorApi'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

const statusColors = {
  APPROVED: 'bg-green-100 text-green-700',
  PENDING: 'bg-amber-100 text-amber-700',
  REJECTED: 'bg-red-100 text-red-700',
}

export default function VendorProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingStock, setEditingStock] = useState({})

  const load = () => {
    setLoading(true)
    vendorApi.myProducts({ page: 0, size: 50 })
      .then(({ data }) => setProducts(data.data.content))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const adjustStock = async (productId) => {
    const changeQuantity = Number(editingStock[productId])
    if (!changeQuantity) return
    setError('')
    try {
      await vendorApi.adjustInventory(productId, { changeQuantity, reason: changeQuantity > 0 ? 'RESTOCK' : 'ADJUSTMENT' })
      setEditingStock((prev) => ({ ...prev, [productId]: '' }))
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not adjust stock')
    }
  }

  const deactivate = async (productId) => {
    await vendorApi.deactivateProduct(productId)
    load()
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <ErrorBanner message={error} />
      {products.length === 0 ? (
        <p className="text-gray-400">You haven't listed any products yet. <Link to="/vendor/products/new" className="text-brand-600">Add your first product</Link>.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-gray-500">₹{p.discountPrice ?? p.price} · Stock: {p.availableStock}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[p.approvalStatus] || 'bg-gray-100'}`}>
                  {p.approvalStatus}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <input type="number" placeholder="±qty" value={editingStock[p.id] || ''}
                  onChange={(e) => setEditingStock((prev) => ({ ...prev, [p.id]: e.target.value }))}
                  className="w-24 border border-gray-300 rounded-md px-2 py-1 text-sm" />
                <button onClick={() => adjustStock(p.id)} className="bg-brand-600 text-white rounded-md px-3 py-1 text-sm hover:bg-brand-700">
                  Update stock
                </button>
                <button onClick={() => deactivate(p.id)} className="text-red-500 hover:text-red-700 text-sm ml-auto">
                  Deactivate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
