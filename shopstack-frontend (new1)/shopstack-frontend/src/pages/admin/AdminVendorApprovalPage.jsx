import React, { useEffect, useState } from 'react'
import { adminApi } from '../../api/adminApi'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

export default function AdminVendorApprovalPage() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    adminApi.pendingVendors({ page: 0, size: 30 })
      .then(({ data }) => setVendors(data.data.content))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const approve = async (id) => {
    setError('')
    try { await adminApi.approveVendor(id); load() }
    catch (err) { setError(err.response?.data?.message || 'Could not approve vendor') }
  }
  const reject = async (id) => {
    setError('')
    try { await adminApi.rejectVendor(id); load() }
    catch (err) { setError(err.response?.data?.message || 'Could not reject vendor') }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <ErrorBanner message={error} />
      {vendors.length === 0 ? (
        <p className="text-gray-400">No pending vendor applications.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {vendors.map((v) => (
            <div key={v.id} className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center">
              <div>
                <p className="font-medium">{v.businessName}</p>
                <p className="text-sm text-gray-500">{v.ownerEmail}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => approve(v.id)} className="bg-green-600 text-white rounded-md px-3 py-1.5 text-sm hover:bg-green-700">Approve</button>
                <button onClick={() => reject(v.id)} className="border border-red-300 text-red-600 rounded-md px-3 py-1.5 text-sm hover:bg-red-50">Reject</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
