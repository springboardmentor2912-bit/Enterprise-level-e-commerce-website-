import React, { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi.analytics()
      .then(({ data }) => setData(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load analytics'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <ErrorBanner message={error} />
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['Total users', data.totalUsers],
            ['Customers', data.totalCustomers],
            ['Vendors (approved)', `${data.approvedVendors} / ${data.totalVendors}`],
            ['Vendors pending', data.pendingVendors],
            ['Products (approved)', `${data.approvedProducts} / ${data.totalProducts}`],
            ['Total orders', data.totalOrders],
            ['Confirmed orders', data.confirmedOrders],
            ['Cancelled orders', data.cancelledOrders],
            ['Gross revenue', `₹${data.totalGrossRevenue}`],
            ['Commission earned', `₹${data.totalCommissionEarned}`],
            ['Pending returns', data.pendingReturns],
            ['Open warehouse tasks', data.openWarehouseTasks],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
