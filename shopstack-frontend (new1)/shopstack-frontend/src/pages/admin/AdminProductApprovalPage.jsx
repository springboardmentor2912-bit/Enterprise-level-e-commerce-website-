import React, { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

export default function AdminProductApprovalPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    adminApi.pendingProducts({ page: 0, size: 30 })
      .then(({ data }) => setProducts(data.data.content))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const approve = async (id) => {
    setError('')
    try { await adminApi.approveProduct(id); load() }
    catch (err) { setError(err.response?.data?.message || 'Could not approve product') }
  }
  const reject = async (id) => {
    setError('')
    try { await adminApi.rejectProduct(id); load() }
    catch (err) { setError(err.response?.data?.message || 'Could not reject product') }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <ErrorBanner message={error} />
      {products.length === 0 ? (
        <p className="text-gray-400">No pending product submissions.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-gray-500">{p.vendorName} · ₹{p.price}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(p.id)} className="bg-green-600 text-white rounded-md px-3 py-1.5 text-sm hover:bg-green-700">Approve</button>
                <button onClick={() => reject(p.id)} className="border border-red-300 text-red-600 rounded-md px-3 py-1.5 text-sm hover:bg-red-50">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
