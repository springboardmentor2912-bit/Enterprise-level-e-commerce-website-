import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { orderApi } from '../api/orderApi'
import LoadingSpinner from '../components/LoadingSpinner'

const statusColors = {
  PENDING: 'bg-gray-100 text-gray-600',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-amber-100 text-amber-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  RETURNED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-red-100 text-red-700',
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    orderApi.myOrders({ page: 0, size: 20 })
      .then(({ data }) => setOrders(data.data.content))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-4xl mx-auto mt-8 px-2">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <p className="text-gray-400">You haven't placed any orders yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`}
              className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-sm">
              <div>
                <p className="font-medium">{o.orderNumber}</p>
                <p className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item(s)</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold">₹{o.totalAmount}</span>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[o.status] || 'bg-gray-100'}`}>
                  {o.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
