import React, { useEffect, useState } from 'react'
import { vendorApi } from '../../api/vendorApi'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

export default function VendorOverviewPage() {
  const [profile, setProfile] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [lowStock, setLowStock] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([vendorApi.profile(), vendorApi.analytics(), vendorApi.lowStock()])
      .then(([p, a, l]) => {
        setProfile(p.data.data)
        setAnalytics(a.data.data)
        setLowStock(l.data.data)
      })
      .catch((err) => setError(err.response?.data?.message || 'Could not load vendor dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <ErrorBanner message={error} />

      {profile && profile.approvalStatus !== 'APPROVED' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-md text-sm mb-6">
          Your vendor account is <strong>{profile.approvalStatus}</strong>. You'll be able to list products once an admin approves your account.
        </div>
      )}

      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            ['Total products', analytics.totalProducts],
            ['Approved products', analytics.approvedProducts],
            ['Pending approval', analytics.pendingProducts],
            ['Total orders', analytics.totalOrders],
            ['Total revenue', `₹${analytics.totalRevenue}`],
            ['Low stock items', analytics.lowStockProductCount],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
            </div>
          ))}
        </div>
      )}

      {lowStock.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h2 className="font-semibold mb-3">Low stock alerts</h2>
          <div className="flex flex-col gap-2 text-sm">
            {lowStock.map((inv) => (
              <div key={inv.id} className="flex justify-between border-b border-gray-100 pb-2">
                <span>{inv.product?.name}</span>
                <span className="text-amber-600 font-medium">{inv.availableQuantity ?? inv.stockQuantity - inv.reservedQuantity} left</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
