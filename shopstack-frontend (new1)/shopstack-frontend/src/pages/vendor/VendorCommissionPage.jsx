import React, { useEffect, useState } from 'react'
import { vendorApi } from '../../api/vendorApi'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

export default function VendorCommissionPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    vendorApi.commissionSummary()
      .then(({ data }) => setSummary(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Could not load earnings summary'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-xl">
      <ErrorBanner message={error} />
      {summary && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col gap-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Gross revenue</span>
            <span className="font-medium">₹{summary.grossRevenue}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Commission rate</span>
            <span className="font-medium">{summary.commissionRate}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Commission taken by ShopStack</span>
            <span className="font-medium text-red-500">−₹{summary.commissionAmount}</span>
          </div>
          <div className="flex justify-between text-base font-semibold border-t border-gray-100 pt-3">
            <span>Your net earnings</span>
            <span>₹{summary.netEarnings}</span>
          </div>
        </div>
      )}
    </div>
  )
}
