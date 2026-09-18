import React, { useEffect, useState } from 'react'
import { vendorApi } from '../../api/vendorApi'
import LoadingSpinner from '../../components/LoadingSpinner'

export default function VendorOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vendorApi.orders({ page: 0, size: 30 })
      .then(({ data }) => setOrders(data.data.content))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      {orders.length === 0 ? (
        <p className="text-gray-400">No orders containing your products yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <div key={o.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold">₹{o.totalAmount}</span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 font-medium">{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
